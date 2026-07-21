const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MODELS,
  buildPayload,
  createClient,
  parseOfficialVoiceCatalog,
  validateRequest
} = require("../lib/seed-audio");

const tinyWav = Buffer.from("RIFFmock-wave-audio").toString("base64");
const tinyPng = Buffer.from("\x89PNGmock-image").toString("base64");

test("validateRequest normalizes the complete Seed Audio parameter set", () => {
  const request = validateRequest({
    model: "seed-audio-1.0-multilingual",
    textPrompt: "@音频1 用温柔的声音朗读：你好，世界。",
    references: [{ kind: "audio", speaker: "zh_female_vv_uranus_bigtts" }],
    format: "mp3",
    sampleRate: 44100,
    speechRate: 25,
    loudnessRate: -10,
    pitchRate: 3,
    enableSubtitle: true,
    aigcWatermark: true,
    metadataEnabled: true,
    contentProducer: "声笺",
    produceId: "work-1001",
    contentPropagator: "本地工作台",
    propagateId: "publish-2002"
  });

  assert.equal(request.model, "seed-audio-1.0-multilingual");
  assert.equal(request.references[0].speaker, "zh_female_vv_uranus_bigtts");
  assert.equal(request.sampleRate, 44100);
  assert.equal(request.enableSubtitle, true);
  assert.equal(request.metadata.contentProducer, "声笺");
});

test("buildPayload maps uploads to raw Base64 and never sends URL fields", () => {
  const audioRequest = validateRequest({
    model: "seed-audio-1.0",
    textPrompt: "@音频1 参考音色朗读这句话。",
    references: [{ kind: "audio", filename: "voice.wav", audioData: tinyWav }]
  });
  const audioPayload = buildPayload(audioRequest);
  assert.deepEqual(audioPayload.references, [{ audio_data: tinyWav }]);
  assert.equal(JSON.stringify(audioPayload).includes("url"), false);

  const imageRequest = validateRequest({
    textPrompt: "看图生成符合人物气质的声音。",
    references: [{ kind: "image", filename: "portrait.png", imageData: tinyPng }]
  });
  assert.deepEqual(buildPayload(imageRequest).references, [{ image_data: tinyPng }]);
});

test("validateRequest enforces reference combinations and documented limits", () => {
  assert.throws(() => validateRequest({
    textPrompt: "不允许混用",
    references: [
      { kind: "audio", speaker: "voice-id" },
      { kind: "image", filename: "portrait.png", imageData: tinyPng }
    ]
  }), /图片参考不能与音频参考混用/);

  assert.throws(() => validateRequest({
    textPrompt: "太多音频",
    references: Array.from({ length: 4 }, (_, index) => ({ kind: "audio", speaker: `voice-${index}` }))
  }), /最多支持三条参考音频/);

  assert.throws(() => validateRequest({
    textPrompt: "错误格式",
    references: [{ kind: "audio", filename: "voice.m4a", audioData: tinyWav }]
  }), /WAV、MP3、PCM 或 OGG\/Opus/);

  assert.throws(() => validateRequest({
    textPrompt: "speaker 和数据互斥",
    references: [{ kind: "audio", speaker: "voice-id", filename: "voice.wav", audioData: tinyWav }]
  }), /音色 ID 和上传音频只能选择一种/);
});

test("validateRequest rejects invalid model, ranges and incomplete metadata", () => {
  assert.deepEqual(Object.keys(MODELS), ["seed-audio-1.0-multilingual", "seed-audio-1.0"]);
  assert.throws(() => validateRequest({ textPrompt: "test", model: "unknown" }), /不支持这个 Seed Audio 模型/);
  assert.throws(() => validateRequest({ textPrompt: "test", speechRate: 101 }), /语速/);
  assert.throws(() => validateRequest({ textPrompt: "test", pitchRate: -13 }), /音调/);
  assert.throws(() => validateRequest({ textPrompt: "test", metadataEnabled: true }), /内容制作或传播信息/);
});

test("buildPayload includes every documented output, subtitle and watermark field", () => {
  const payload = buildPayload(validateRequest({
    textPrompt: "测试完整字段。",
    format: "ogg_opus",
    sampleRate: 48000,
    speechRate: -20,
    loudnessRate: 50,
    pitchRate: -2,
    enableSubtitle: true,
    aigcWatermark: true,
    metadataEnabled: true,
    contentProducer: "producer",
    produceId: "p-1"
  }));

  assert.deepEqual(payload.audio_config, {
    format: "ogg_opus",
    sample_rate: 48000,
    speech_rate: -20,
    loudness_rate: 50,
    pitch_rate: -2,
    enable_subtitle: true
  });
  assert.deepEqual(payload.watermark, {
    aigc_watermark: true,
    aigc_metadata: {
      enable: true,
      content_producer: "producer",
      produce_id: "p-1"
    }
  });
});

test("createClient sends API key, request ID and maps the complete response", async () => {
  const requests = [];
  const client = createClient({
    apiKey: "volc-test-key",
    baseUrl: "https://openspeech.bytedance.com/",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({
        code: 0,
        message: "success",
        audio: tinyWav,
        duration: 1.25,
        original_duration: 1.5,
        url: "https://example.com/result.wav",
        subtitle: {
          text: "你好",
          sentences: [{ start_time: 0, end_time: 1200, text: "你好", words: [{ start_time: 0, end_time: 1200, text: "你好" }] }]
        }
      }), { status: 200, headers: { "Content-Type": "application/json", "X-Tt-Logid": "log-123" } });
    }
  });

  const result = await client.create({ model: "seed-audio-1.0", text_prompt: "你好" }, "trace-456");
  assert.equal(requests[0].url, "https://openspeech.bytedance.com/api/v3/tts/create");
  assert.equal(requests[0].options.headers["X-Api-Key"], "volc-test-key");
  assert.equal(requests[0].options.headers["X-Api-Request-Id"], "trace-456");
  assert.equal(result.logId, "log-123");
  assert.equal(result.originalDuration, 1.5);
  assert.equal(result.subtitle.sentences[0].words[0].text, "你好");
});

test("createClient rejects application errors returned with HTTP 200", async () => {
  const client = createClient({
    apiKey: "volc-test-key",
    fetchImpl: async () => new Response(JSON.stringify({ code: 1001, message: "参数错误" }), { status: 200 })
  });
  await assert.rejects(() => client.create({}), /参数错误.*1001/);
});

test("parseOfficialVoiceCatalog keeps both 2.0 tables and ignores S2S and 1.0", () => {
  const markdown = `
## "豆包语音合成模型2.0" 音色列表
|场景|音色名称|voice_type|语种/方言|支持能力|特殊标签|
|---|---|---|---|---|---|
|通用场景|Vivi 2.0|zh_female_vv_uranus_bigtts|语种：中文、日文|指令遵循||
||| |方言：四川、陕西||| 
## "豆包语音合成模型2.0" 多语种音色列表
|多语种|Tim|en_male_tim_uranus_bigtts|美式英语|指令遵循||
|通用场景, 视频配音,多语种,法语|Louise|fr_female_louise_uranus_bigtts|法语|指令遵循||
## "端到端实时语音大模型 S2S-O版本和SC-2.0版本 "音色列表
|角色扮演|不应出现|s2s_voice_id|中文|||
## "豆包语音合成模型1.0" 音色列表
|通用场景|旧音色|legacy_voice_id|中文|||
`;
  const voices = parseOfficialVoiceCatalog(markdown);
  assert.deepEqual(voices, [{
    scene: "通用场景",
    name: "Vivi 2.0",
    voiceId: "zh_female_vv_uranus_bigtts",
    languages: "语种：中文、日文；方言：四川、陕西"
  }, {
    scene: "多语种",
    name: "Tim",
    voiceId: "en_male_tim_uranus_bigtts",
    languages: "美式英语"
  }, {
    scene: "通用场景",
    name: "Louise",
    voiceId: "fr_female_louise_uranus_bigtts",
    languages: "法语"
  }]);
});

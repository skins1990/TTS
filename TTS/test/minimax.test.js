const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MINIMAX_MODEL,
  buildPayload,
  createClient,
  extractAudioResult,
  normalizeBaseUrl,
  validateRequest
} = require("../lib/minimax");

test("normalizeBaseUrl keeps one trailing v1 segment", () => {
  assert.equal(normalizeBaseUrl("https://api.minimaxi.com"), "https://api.minimaxi.com/v1");
  assert.equal(normalizeBaseUrl("https://api.minimaxi.com/v1/"), "https://api.minimaxi.com/v1");
});

test("validateRequest normalizes the complete speech-2.8-hd parameter set", () => {
  const request = validateRequest({
    text: "你好，MiniMax。",
    voiceId: "Chinese (Mandarin)_Reliable_Executive",
    languageBoost: "Chinese",
    speed: 1.25,
    volume: 2.5,
    pitch: -2,
    emotion: "calm",
    englishNormalization: true,
    pronunciationRules: ["MiniMax/mini max"],
    format: "mp3",
    sampleRate: 44100,
    bitrate: 256000,
    channel: 1,
    modifyPitch: -20,
    modifyIntensity: 15,
    modifyTimbre: 30,
    soundEffect: "auditorium_echo",
    aigcWatermark: true
  });

  assert.equal(request.model, MINIMAX_MODEL);
  assert.equal(request.voiceId, "Chinese (Mandarin)_Reliable_Executive");
  assert.equal(request.speed, 1.25);
  assert.equal(request.modifyTimbre, 30);
  assert.deepEqual(request.pronunciationRules, ["MiniMax/mini max"]);
});

test("buildPayload maps all supported request fields to MiniMax names", () => {
  const request = validateRequest({
    text: "你好，MiniMax。",
    voiceId: "male-qn-qingse",
    languageBoost: "auto",
    speed: 1.1,
    volume: 1.5,
    pitch: 2,
    emotion: "happy",
    englishNormalization: true,
    pronunciationRules: ["草地/(cao3)(di1)"],
    format: "mp3",
    sampleRate: 32000,
    bitrate: 128000,
    channel: 2,
    modifyPitch: 10,
    modifyIntensity: -10,
    modifyTimbre: 20,
    soundEffect: "spacious_echo",
    aigcWatermark: true
  });

  assert.deepEqual(buildPayload(request), {
    model: "speech-2.8-hd",
    text: "你好，MiniMax。",
    language_boost: "auto",
    voice_setting: {
      voice_id: "male-qn-qingse",
      speed: 1.1,
      vol: 1.5,
      pitch: 2,
      emotion: "happy",
      english_normalization: true
    },
    pronunciation_dict: { tone: ["草地/(cao3)(di1)"] },
    audio_setting: {
      audio_sample_rate: 32000,
      bitrate: 128000,
      format: "mp3",
      channel: 2
    },
    voice_modify: {
      pitch: 10,
      intensity: -10,
      timbre: 20,
      sound_effects: "spacious_echo"
    },
    aigc_watermark: true
  });
});

test("validateRequest enforces format-dependent sample rate and voice modification", () => {
  assert.throws(
    () => validateRequest({ text: "test", voiceId: "voice", format: "opus", sampleRate: 32000 }),
    /Opus.*采样率/
  );
  assert.throws(
    () => validateRequest({ text: "test", voiceId: "voice", format: "pcm", sampleRate: 32000, modifyPitch: 1 }),
    /音效器.*MP3.*WAV.*FLAC/
  );
});

test("buildPayload uses text_file_id instead of text for uploaded input", () => {
  const request = validateRequest({ file: { name: "script.txt", dataUrl: "data:text/plain;base64,5L2g5aW9" }, voiceId: "voice" });
  const payload = buildPayload(request, "95157322514444");
  assert.equal(payload.text_file_id, 95157322514444);
  assert.equal("text" in payload, false);
});

test("validateRequest rejects uploaded text files larger than 10 MB", () => {
  const oversizedFile = Buffer.alloc(10 * 1024 * 1024 + 1).toString("base64");
  assert.throws(
    () => validateRequest({
      file: { name: "script.txt", dataUrl: `data:text/plain;base64,${oversizedFile}` },
      voiceId: "voice"
    }),
    /10 MB/
  );
});

test("createClient lists only system voices and preserves official descriptions", async () => {
  const requests = [];
  const client = createClient({
    baseUrl: "https://api.minimaxi.com/v1",
    apiKey: "test-key",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return jsonResponse({
        system_voice: [{
          voice_id: "Chinese (Mandarin)_Reliable_Executive",
          voice_name: "沉稳高管",
          description: ["沉稳可靠的中年男性高管声音。", "标准普通话。"]
        }, {
          voice_id: "male-qn-qingse",
          voice_name: "青涩青年音色"
        }],
        base_resp: { status_code: 0, status_msg: "success" }
      });
    }
  });

  const voices = await client.getSystemVoices();
  assert.deepEqual(voices, [{
    id: "Chinese (Mandarin)_Reliable_Executive",
    name: "沉稳高管",
    description: "沉稳可靠的中年男性高管声音。 标准普通话。"
  }, {
    id: "male-qn-qingse",
    name: "青涩青年音色",
    description: "MiniMax 官方普通话音色，声音风格：青涩青年。"
  }]);
  assert.equal(requests[0].url, "https://api.minimaxi.com/v1/get_voice");
  assert.equal(JSON.parse(requests[0].options.body).voice_type, "system");
  assert.equal(requests[0].options.headers.Authorization, "Bearer test-key");
});

test("createClient uploads text input and maps task lifecycle responses", async () => {
  const requests = [];
  const responses = [
    { file: { file_id: 101 }, base_resp: { status_code: 0, status_msg: "success" } },
    { task_id: 202, usage_characters: 12, base_resp: { status_code: 0, status_msg: "success" } },
    { task_id: 202, status: "Processing", file_id: 303, base_resp: { status_code: 0, status_msg: "success" } }
  ];
  const client = createClient({
    baseUrl: "https://api.minimaxi.com/v1/",
    apiKey: "test-key",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return jsonResponse(responses.shift());
    }
  });

  const fileId = await client.uploadTextFile({ name: "script.txt", dataUrl: "data:text/plain;base64,5L2g5aW9" });
  const task = await client.createTask({ model: MINIMAX_MODEL, text_file_id: fileId });
  const status = await client.queryTask(task.taskId);

  assert.equal(fileId, 101);
  assert.deepEqual(task, { taskId: "202", fileId: null, usageCharacters: 12 });
  assert.deepEqual(status, { taskId: "202", status: "processing", fileId: "303" });
  assert.equal(requests[0].options.body.get("purpose"), "t2a_async_input");
  assert.equal(requests[0].options.body.get("file").name, "script.txt");
  assert.equal(requests[1].url, "https://api.minimaxi.com/v1/t2a_async_v2");
  assert.match(requests[2].url, /query\/t2a_async_query_v2\?task_id=202$/);
});

test("createClient rejects MiniMax base_resp errors even on HTTP 200", async () => {
  const client = createClient({
    apiKey: "test-key",
    fetchImpl: async () => jsonResponse({ base_resp: { status_code: 1008, status_msg: "余额不足" } })
  });
  await assert.rejects(() => client.getSystemVoices(), /余额不足.*1008/);
});

test("extractAudioResult returns the first audio entry from a ZIP result", () => {
  const audio = Buffer.from("fake-mp3-audio");
  const archive = createZip([
    { name: "metadata.json", data: Buffer.from("{}") },
    { name: "chapter.mp3", data: audio }
  ]);
  const result = extractAudioResult(archive, {
    contentType: "application/zip",
    filename: "result.zip",
    requestedFormat: "mp3"
  });

  assert.deepEqual(result.buffer, audio);
  assert.equal(result.mime, "audio/mpeg");
  assert.equal(result.filename, "chapter.mp3");
});

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.from(entry.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralOffset, 16);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

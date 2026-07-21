const crypto = require("node:crypto");

const MODELS = Object.freeze({
  "seed-audio-1.0-multilingual": {
    name: "Seed Audio 1.0 多语种",
    description: "支持中文、英文、日语、韩语、墨西哥西班牙语、西班牙语、德语、法语、巴西葡萄牙语、泰语、越南语、马来语、菲律宾语、意大利语、俄语、荷兰语、波兰语和土耳其语，并支持时间轴控制。"
  },
  "seed-audio-1.0": {
    name: "Seed Audio 1.0",
    description: "支持中文、英语，适合基础双语生成。"
  }
});

const AUDIO_FORMATS = new Set(["wav", "mp3", "pcm", "ogg_opus"]);
const SAMPLE_RATES = new Set([8000, 16000, 24000, 32000, 44100, 48000]);
const AUDIO_EXTENSIONS = new Set(["wav", "mp3", "pcm", "ogg", "opus"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_RESOURCE_BYTES = 10 * 1024 * 1024;

function normalizeBaseUrl(value) {
  const base = String(value || "https://openspeech.bytedance.com").trim().replace(/\/+$/, "");
  return base.replace(/\/api\/v3\/tts\/create$/i, "");
}

function validateRequest(body = {}) {
  const model = String(body.model || "seed-audio-1.0-multilingual").trim();
  if (!MODELS[model]) throw new Error("不支持这个 Seed Audio 模型。");

  const textPrompt = String(body.textPrompt ?? body.text_prompt ?? "").trim();
  if (!textPrompt) throw new Error("请填写待合成文本或生成提示词。");
  if (textPrompt.length > 3000) throw new Error("文本与提示词不能超过 3,000 个字符。");

  const rawReferences = Array.isArray(body.references) ? body.references : [];
  const audioReferences = rawReferences.filter((reference) => reference?.kind === "audio");
  const imageReferences = rawReferences.filter((reference) => reference?.kind === "image");
  if (rawReferences.some((reference) => !["audio", "image"].includes(reference?.kind))) {
    throw new Error("参考资源类型无效。");
  }
  if (audioReferences.length && imageReferences.length) throw new Error("图片参考不能与音频参考混用。");
  if (audioReferences.length > 3) throw new Error("最多支持三条参考音频。");
  if (imageReferences.length > 1) throw new Error("最多支持一张参考图片。");

  const references = rawReferences.map((reference, index) => validateReference(reference, index));
  const format = String(body.format || "wav").toLowerCase();
  if (!AUDIO_FORMATS.has(format)) throw new Error("输出格式仅支持 WAV、MP3、PCM 或 OGG/Opus。");
  const sampleRate = integerInSet(body.sampleRate, 24000, SAMPLE_RATES, "采样率");
  const speechRate = integerInRange(body.speechRate, 0, -50, 100, "语速");
  const loudnessRate = integerInRange(body.loudnessRate, 0, -50, 100, "音量");
  const pitchRate = integerInRange(body.pitchRate, 0, -12, 12, "音调");
  const enableSubtitle = Boolean(body.enableSubtitle);
  const aigcWatermark = Boolean(body.aigcWatermark);
  const metadataEnabled = Boolean(body.metadataEnabled);
  const metadata = {
    contentProducer: cleanMetadata(body.contentProducer),
    produceId: cleanMetadata(body.produceId),
    contentPropagator: cleanMetadata(body.contentPropagator),
    propagateId: cleanMetadata(body.propagateId)
  };
  if (metadataEnabled && !Object.values(metadata).some(Boolean)) {
    throw new Error("启用隐式水印后，请至少填写一项内容制作或传播信息。");
  }

  return {
    model,
    textPrompt,
    references,
    format,
    sampleRate,
    speechRate,
    loudnessRate,
    pitchRate,
    enableSubtitle,
    aigcWatermark,
    metadataEnabled,
    metadata
  };
}

function validateReference(reference, index) {
  if (reference.kind === "audio") {
    const speaker = String(reference.speaker || "").trim();
    const audioData = normalizeBase64(reference.audioData, `第 ${index + 1} 条参考音频`);
    if (speaker && audioData) throw new Error("每条参考音频的音色 ID 和上传音频只能选择一种。");
    if (!speaker && !audioData) throw new Error(`第 ${index + 1} 条参考音频缺少音色 ID 或音频数据。`);
    if (speaker) {
      if (speaker.length > 300) throw new Error("音色 ID 过长。");
      return { kind: "audio", speaker };
    }
    const filename = String(reference.filename || "").trim();
    if (!AUDIO_EXTENSIONS.has(fileExtension(filename))) {
      throw new Error("参考音频仅支持 WAV、MP3、PCM 或 OGG/Opus。");
    }
    assertBase64Size(audioData, MAX_RESOURCE_BYTES, "参考音频不能超过 10 MB。");
    return { kind: "audio", filename, audioData };
  }

  const imageData = normalizeBase64(reference.imageData, "参考图片");
  if (!imageData) throw new Error("参考图片数据无效。");
  const filename = String(reference.filename || "").trim();
  if (!IMAGE_EXTENSIONS.has(fileExtension(filename))) throw new Error("参考图片仅支持 JPEG、PNG 或 WebP。");
  assertBase64Size(imageData, MAX_RESOURCE_BYTES, "参考图片不能超过 10 MB。");
  return { kind: "image", filename, imageData };
}

function buildPayload(request) {
  const payload = {
    model: request.model,
    text_prompt: request.textPrompt,
    audio_config: {
      format: request.format,
      sample_rate: request.sampleRate,
      speech_rate: request.speechRate,
      loudness_rate: request.loudnessRate,
      pitch_rate: request.pitchRate,
      enable_subtitle: request.enableSubtitle
    }
  };
  if (request.references.length) {
    payload.references = request.references.map((reference) => {
      if (reference.kind === "image") return { image_data: reference.imageData };
      if (reference.speaker) return { speaker: reference.speaker };
      return { audio_data: reference.audioData };
    });
  }
  if (request.aigcWatermark || request.metadataEnabled) {
    payload.watermark = { aigc_watermark: request.aigcWatermark };
    if (request.metadataEnabled) {
      payload.watermark.aigc_metadata = {
        enable: true,
        ...(request.metadata.contentProducer ? { content_producer: request.metadata.contentProducer } : {}),
        ...(request.metadata.produceId ? { produce_id: request.metadata.produceId } : {}),
        ...(request.metadata.contentPropagator ? { content_propagator: request.metadata.contentPropagator } : {}),
        ...(request.metadata.propagateId ? { propagate_id: request.metadata.propagateId } : {})
      };
    }
  }
  return payload;
}

function createClient({ baseUrl, apiKey, fetchImpl = fetch } = {}) {
  const root = normalizeBaseUrl(baseUrl);
  return {
    async create(payload, requestId = crypto.randomUUID()) {
      const response = await fetchImpl(`${root}/api/v3/tts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey || "",
          "X-Api-Request-Id": requestId
        },
        body: JSON.stringify(payload)
      });
      const raw = await response.text();
      let data;
      try { data = JSON.parse(raw || "{}"); } catch { data = {}; }
      if (!response.ok || Number(data.code || 0) !== 0) {
        const code = data.code ?? response.status;
        throw new Error(`${data.message || raw.slice(0, 300) || "Seed Audio 生成失败。"}（${code}）`);
      }
      return {
        audio: String(data.audio || ""),
        duration: finiteNumber(data.duration),
        originalDuration: finiteNumber(data.original_duration),
        url: String(data.url || ""),
        subtitle: normalizeSubtitle(data.subtitle),
        logId: response.headers.get("x-tt-logid") || "",
        requestId
      };
    }
  };
}

function parseOfficialVoiceCatalog(markdown) {
  const source = String(markdown || "");
  const firstSection = source.search(/^## .*豆包语音合成模型2\.0.*音色列表.*$/m);
  if (firstSection < 0) return [];
  const remainder = source.slice(firstSection);
  const boundaryMatch = remainder.match(/^## .*端到端实时语音大模型.*$/m) || remainder.match(/^## .*豆包语音合成模型1\.0.*$/m);
  const section = boundaryMatch ? remainder.slice(0, boundaryMatch.index) : remainder;
  const voices = [];
  let lastVoice = null;
  for (const line of section.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.replace(/\\\s*$/, "").split("|").slice(1, -1).map(cleanCell);
    const [scene, name, voiceId, languages] = cells;
    if (voiceId && /[A-Za-z0-9]/.test(voiceId) && /^[A-Za-z0-9_-]{3,}$/.test(voiceId) && voiceId !== "voice_type") {
      lastVoice = { scene: normalizeScene(scene), name: name || voiceId, voiceId, languages: languages || "未标注" };
      voices.push(lastVoice);
    } else if (lastVoice && !scene && !name && !voiceId && languages) {
      lastVoice.languages = `${lastVoice.languages}；${languages}`;
    }
  }
  return voices;
}

function normalizeSubtitle(value) {
  if (!value || typeof value !== "object") return null;
  return {
    text: String(value.text || ""),
    sentences: Array.isArray(value.sentences) ? value.sentences.map((sentence) => ({
      start_time: finiteInteger(sentence.start_time),
      end_time: finiteInteger(sentence.end_time),
      text: String(sentence.text || ""),
      words: Array.isArray(sentence.words) ? sentence.words.map((word) => ({
        start_time: finiteInteger(word.start_time),
        end_time: finiteInteger(word.end_time),
        text: String(word.text || "")
      })) : []
    })) : []
  };
}

function normalizeBase64(value, label) {
  const source = String(value || "").trim();
  if (!source) return "";
  if (/^data:/i.test(source)) throw new Error(`${label}必须使用纯 Base64，不能传 URL 或 Data URL。`);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(source) || source.length % 4 === 1) throw new Error(`${label}的 Base64 数据无效。`);
  return source;
}

function assertBase64Size(value, maxBytes, message) {
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  const bytes = Math.floor(value.length * 3 / 4) - padding;
  if (bytes > maxBytes) throw new Error(message);
}

function fileExtension(filename) {
  const match = String(filename).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

function integerInRange(value, fallback, min, max, label) {
  const number = value === undefined || value === null || value === "" ? fallback : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new Error(`${label}必须是 ${min} 到 ${max} 之间的整数。`);
  return number;
}

function integerInSet(value, fallback, allowed, label) {
  const number = value === undefined || value === null || value === "" ? fallback : Number(value);
  if (!Number.isInteger(number) || !allowed.has(number)) throw new Error(`${label}不受支持。`);
  return number;
}

function cleanMetadata(value) {
  const text = String(value || "").trim();
  if (text.length > 500) throw new Error("水印元数据的单项内容不能超过 500 个字符。");
  return text;
}

function cleanCell(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\\/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeScene(value) {
  const parts = String(value || "").split(/[,，]/).map((part) => part.trim()).filter(Boolean);
  const primary = parts.find((part) => !["多语种", "S2S-SC"].includes(part) && !/语$/.test(part));
  return primary || parts[0] || "其他";
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function finiteInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : 0;
}

module.exports = {
  MODELS,
  buildPayload,
  createClient,
  normalizeBaseUrl,
  parseOfficialVoiceCatalog,
  validateRequest
};

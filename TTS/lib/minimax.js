const MINIMAX_MODEL = "speech-2.8-hd";

const LANGUAGE_BOOSTS = new Set([
  "auto", "Chinese", "Chinese,Yue", "English", "Arabic", "Russian", "Spanish", "French",
  "Portuguese", "German", "Turkish", "Dutch", "Ukrainian", "Vietnamese", "Indonesian",
  "Japanese", "Italian", "Korean", "Thai", "Polish", "Romanian", "Greek", "Czech",
  "Finnish", "Hindi", "Bulgarian", "Danish", "Hebrew", "Malay", "Persian", "Slovak",
  "Swedish", "Croatian", "Filipino", "Hungarian", "Norwegian", "Slovenian", "Catalan",
  "Nynorsk", "Tamil", "Afrikaans"
]);
const EMOTIONS = new Set(["", "happy", "sad", "angry", "fearful", "disgusted", "surprised", "calm", "fluent"]);
const FORMATS = new Set(["mp3", "pcm", "flac", "wav", "pcmu_raw", "pcmu_wav", "opus"]);
const SOUND_EFFECTS = new Set(["", "spacious_echo", "auditorium_echo", "lofi_telephone", "robotic"]);
const BITRATES = new Set([32000, 64000, 128000, 256000]);
const STANDARD_SAMPLE_RATES = new Set([8000, 16000, 22050, 24000, 32000, 44100]);
const OPUS_SAMPLE_RATES = new Set([8000, 12000, 16000, 24000, 48000]);
const VOICE_LANGUAGE_LABELS = new Map([
  ["Chinese (Mandarin)", "普通话"], ["Chinese (Cantonese)", "粤语"], ["English", "英语"],
  ["Spanish", "西班牙语"], ["French", "法语"], ["Russian", "俄语"], ["German", "德语"],
  ["Portuguese", "葡萄牙语"], ["Arabic", "阿拉伯语"], ["Italian", "意大利语"],
  ["Japanese", "日语"], ["Korean", "韩语"], ["Indonesian", "印尼语"], ["Vietnamese", "越南语"],
  ["Turkish", "土耳其语"], ["Dutch", "荷兰语"], ["Ukrainian", "乌克兰语"], ["Thai", "泰语"],
  ["Polish", "波兰语"], ["Romanian", "罗马尼亚语"], ["Greek", "希腊语"], ["Czech", "捷克语"],
  ["Finnish", "芬兰语"], ["Hindi", "印地语"], ["Bulgarian", "保加利亚语"], ["Danish", "丹麦语"],
  ["Hebrew", "希伯来语"], ["Malay", "马来语"], ["Persian", "波斯语"], ["Slovak", "斯洛伐克语"],
  ["Swedish", "瑞典语"], ["Croatian", "克罗地亚语"], ["Filipino", "菲律宾语"],
  ["Hungarian", "匈牙利语"], ["Norwegian", "挪威语"], ["Slovenian", "斯洛文尼亚语"],
  ["Catalan", "加泰罗尼亚语"], ["Nynorsk", "尼诺斯克语"], ["Tamil", "泰米尔语"],
  ["Afrikaans", "阿非利卡语"]
]);

function normalizeBaseUrl(value) {
  const base = String(value || "https://api.minimaxi.com/v1").trim().replace(/\/+$/, "");
  return /\/v1$/i.test(base) ? base : `${base}/v1`;
}

function validateRequest(body = {}) {
  const text = String(body.text || "").trim();
  const file = body.file && typeof body.file === "object" ? body.file : null;
  if (!text && !file) throw new Error("请填写文本或上传 TXT/ZIP 文件。");
  if (text && file) throw new Error("文本和文件只能选择一种输入方式。");
  if (text.length > 50000) throw new Error("直接输入的文本不能超过 50,000 个字符。");
  if (file) {
    const name = String(file.name || "").trim();
    if (!/\.(txt|zip)$/i.test(name)) throw new Error("只支持 TXT 或 ZIP 文本文件。");
    if (!/^data:[^,]*;base64,/i.test(String(file.dataUrl || ""))) throw new Error("上传文件内容无效。");
    if (decodeDataUrl(file.dataUrl).buffer.length > 10 * 1024 * 1024) {
      throw new Error("上传的文本文件不能超过 10 MB。");
    }
  }

  const voiceId = String(body.voiceId || "").trim();
  if (!voiceId || voiceId.length > 200) throw new Error("请选择 MiniMax 官方音色。");
  const languageBoost = String(body.languageBoost || "auto");
  if (!LANGUAGE_BOOSTS.has(languageBoost)) throw new Error("不支持这个语种增强选项。");

  const speed = numberInRange(body.speed, 1, 0.5, 2, "语速");
  const volume = numberInRange(body.volume, 1, Number.EPSILON, 10, "音量");
  const pitch = integerInRange(body.pitch, 0, -12, 12, "语调");
  const emotion = String(body.emotion || "");
  if (!EMOTIONS.has(emotion)) throw new Error("speech-2.8-hd 不支持这个情绪选项。");

  const format = String(body.format || "mp3").toLowerCase();
  if (!FORMATS.has(format)) throw new Error("不支持这个音频格式。");
  const defaultSampleRate = format === "opus" ? 24000 : format.startsWith("pcmu_") ? 8000 : 32000;
  const sampleRate = integerInRange(body.sampleRate, defaultSampleRate, 8000, 48000, "采样率");
  if (format === "opus" && !OPUS_SAMPLE_RATES.has(sampleRate)) throw new Error("Opus 格式不支持这个采样率。");
  if (format.startsWith("pcmu_") && sampleRate !== 8000) throw new Error("G.711 格式的采样率必须是 8,000 Hz。");
  if (format !== "opus" && !format.startsWith("pcmu_") && !STANDARD_SAMPLE_RATES.has(sampleRate)) {
    throw new Error("这个音频格式不支持所选采样率。");
  }
  const bitrate = integerInRange(body.bitrate, 128000, 32000, 256000, "比特率");
  if (!BITRATES.has(bitrate)) throw new Error("不支持这个 MP3 比特率。");
  const channel = integerInRange(body.channel, 2, 1, 2, "声道数");

  const modifyPitch = integerInRange(body.modifyPitch, 0, -100, 100, "音高调整");
  const modifyIntensity = integerInRange(body.modifyIntensity, 0, -100, 100, "强度调整");
  const modifyTimbre = integerInRange(body.modifyTimbre, 0, -100, 100, "音色调整");
  const soundEffect = String(body.soundEffect || "");
  if (!SOUND_EFFECTS.has(soundEffect)) throw new Error("不支持这个声音效果。");
  const hasVoiceModify = Boolean(modifyPitch || modifyIntensity || modifyTimbre || soundEffect);
  if (hasVoiceModify && !["mp3", "wav", "flac"].includes(format)) {
    throw new Error("音效器只支持 MP3、WAV 和 FLAC 格式。");
  }

  const pronunciationRules = Array.isArray(body.pronunciationRules)
    ? body.pronunciationRules.map((rule) => String(rule).trim()).filter(Boolean)
    : [];
  if (pronunciationRules.length > 50) throw new Error("发音词典最多填写 50 条规则。");
  if (pronunciationRules.some((rule) => !rule.includes("/") || rule.length > 120)) {
    throw new Error("每条发音规则都要使用“原文/发音”格式，并控制在 120 个字符内。");
  }

  return {
    model: MINIMAX_MODEL,
    text,
    file,
    voiceId,
    languageBoost,
    speed,
    volume,
    pitch,
    emotion,
    englishNormalization: body.englishNormalization === true,
    pronunciationRules,
    format,
    sampleRate,
    bitrate,
    channel,
    modifyPitch,
    modifyIntensity,
    modifyTimbre,
    soundEffect,
    aigcWatermark: body.aigcWatermark === true
  };
}

function buildPayload(request, textFileId) {
  const payload = {
    model: MINIMAX_MODEL,
    language_boost: request.languageBoost,
    voice_setting: {
      voice_id: request.voiceId,
      speed: request.speed,
      vol: request.volume,
      pitch: request.pitch,
      english_normalization: request.englishNormalization
    },
    audio_setting: {
      audio_sample_rate: request.sampleRate,
      format: request.format,
      channel: request.channel
    },
    aigc_watermark: request.aigcWatermark
  };
  if (textFileId !== undefined && textFileId !== null) payload.text_file_id = Number(textFileId);
  else payload.text = request.text;
  if (request.emotion) payload.voice_setting.emotion = request.emotion;
  if (request.format === "mp3") payload.audio_setting.bitrate = request.bitrate;
  if (request.pronunciationRules.length) payload.pronunciation_dict = { tone: request.pronunciationRules };
  if (request.modifyPitch || request.modifyIntensity || request.modifyTimbre || request.soundEffect) {
    payload.voice_modify = {
      pitch: request.modifyPitch,
      intensity: request.modifyIntensity,
      timbre: request.modifyTimbre
    };
    if (request.soundEffect) payload.voice_modify.sound_effects = request.soundEffect;
  }
  return payload;
}

function createClient({ baseUrl, apiKey, fetchImpl = globalThis.fetch } = {}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (typeof fetchImpl !== "function") throw new Error("当前 Node.js 环境不支持 fetch。");

  async function requestJson(url, options = {}) {
    let response;
    try {
      response = await fetchImpl(url, options);
    } catch (error) {
      throw new Error(`无法连接 MiniMax 服务：${error.message}`);
    }
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
    const code = Number(data.base_resp?.status_code || 0);
    if (!response.ok || code !== 0) {
      const message = data.base_resp?.status_msg || data.message || data.error?.message || raw.slice(0, 240) || `HTTP ${response.status}`;
      throw new Error(`MiniMax 请求失败：${message}${code ? `（${code}）` : ""}`);
    }
    return { data, response };
  }

  function authHeaders(extra = {}) {
    if (!apiKey) throw new Error("未配置 MINIMAX_API_KEY。");
    return { Authorization: `Bearer ${apiKey}`, ...extra };
  }

  return {
    async getSystemVoices() {
      const { data } = await requestJson(`${normalizedBaseUrl}/get_voice`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ voice_type: "system" })
      });
      return (Array.isArray(data.system_voice) ? data.system_voice : [])
        .map((voice) => {
          const id = String(voice.voice_id || "").trim();
          const name = String(voice.voice_name || voice.voice_id || "未命名音色").trim();
          return { id, name, description: describeSystemVoice(voice, id, name) };
        })
        .filter((voice) => voice.id);
    },

    async uploadTextFile(file) {
      const decoded = decodeDataUrl(file.dataUrl);
      const form = new FormData();
      form.append("purpose", "t2a_async_input");
      form.append("file", new Blob([decoded.buffer], { type: decoded.mime }), String(file.name));
      const { data } = await requestJson(`${normalizedBaseUrl}/files/upload`, {
        method: "POST",
        headers: authHeaders(),
        body: form
      });
      if (data.file?.file_id === undefined || data.file?.file_id === null) throw new Error("MiniMax 未返回上传文件 ID。");
      return Number(data.file.file_id);
    },

    async createTask(payload) {
      const { data } = await requestJson(`${normalizedBaseUrl}/t2a_async_v2`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
      });
      if (data.task_id === undefined || data.task_id === null) throw new Error("MiniMax 未返回语音任务 ID。");
      return {
        taskId: String(data.task_id),
        fileId: data.file_id === undefined || data.file_id === null ? null : String(data.file_id),
        usageCharacters: Number(data.usage_characters || 0)
      };
    },

    async queryTask(taskId) {
      const { data } = await requestJson(`${normalizedBaseUrl}/query/t2a_async_query_v2?task_id=${encodeURIComponent(taskId)}`, {
        method: "GET",
        headers: authHeaders({ "Content-Type": "application/json" })
      });
      return {
        taskId: String(data.task_id ?? taskId),
        status: String(data.status || "processing").toLowerCase(),
        fileId: data.file_id === undefined || data.file_id === null ? null : String(data.file_id)
      };
    },

    async retrieveFile(fileId) {
      const { data } = await requestJson(`${normalizedBaseUrl}/files/retrieve?file_id=${encodeURIComponent(fileId)}`, {
        method: "GET",
        headers: authHeaders({ "Content-Type": "application/json" })
      });
      if (!data.file) throw new Error("MiniMax 未返回生成文件信息。");
      return {
        fileId: String(data.file.file_id ?? fileId),
        filename: String(data.file.filename || "minimax-result"),
        downloadUrl: String(data.file.download_url || ""),
        bytes: Number(data.file.bytes || 0)
      };
    },

    async downloadFile(file) {
      const url = file.downloadUrl || `${normalizedBaseUrl}/files/retrieve_content?file_id=${encodeURIComponent(file.fileId)}`;
      let response;
      try {
        response = await fetchImpl(url, { method: "GET", headers: file.downloadUrl ? {} : authHeaders() });
      } catch (error) {
        throw new Error(`无法下载 MiniMax 生成文件：${error.message}`);
      }
      if (!response.ok) throw new Error(`下载 MiniMax 生成文件失败（HTTP ${response.status}）。`);
      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        contentType: String(response.headers.get("content-type") || "").split(";")[0].trim(),
        filename: file.filename
      };
    }
  };
}

function describeSystemVoice(voice, id, name) {
  const provided = (Array.isArray(voice.description) ? voice.description : [voice.description])
    .map((item) => String(item || "").trim()).filter(Boolean).join(" ");
  if (provided) return provided;
  const prefix = String(id).split("_")[0];
  const language = /^(?:male|female)-/i.test(id) ? "普通话" : VOICE_LANGUAGE_LABELS.get(prefix) || "系统";
  const style = String(name).replace(/(?:音色)?(?:-beta)?$/i, "") || name;
  return `MiniMax 官方${language}音色，声音风格：${style}。`;
}

function extractAudioResult(value, { contentType = "", filename = "", requestedFormat = "mp3" } = {}) {
  const buffer = Buffer.from(value);
  const isZip = buffer.length >= 4 && buffer.readUInt32LE(0) === 0x04034b50
    || /(?:application\/zip|\.zip$)/i.test(`${contentType} ${filename}`);
  if (!isZip) {
    return {
      buffer,
      mime: /^audio\//i.test(contentType) ? contentType : mimeForFormat(requestedFormat),
      filename: filename || `minimax-tts.${requestedFormat}`
    };
  }

  const endOffset = findSignatureFromEnd(buffer, 0x06054b50);
  if (endOffset < 0 || endOffset + 22 > buffer.length) throw new Error("MiniMax 返回的 ZIP 文件不完整。");
  const entryCount = buffer.readUInt16LE(endOffset + 10);
  let offset = buffer.readUInt32LE(endOffset + 16);
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const entryName = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    if (isAudioFilename(entryName)) {
      if (localOffset + 30 > buffer.length || buffer.readUInt32LE(localOffset) !== 0x04034b50) {
        throw new Error("MiniMax ZIP 中的音频索引无效。");
      }
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
      const audio = method === 0 ? Buffer.from(compressed) : method === 8 ? zlib.inflateRawSync(compressed) : null;
      if (!audio || audio.length !== uncompressedSize) throw new Error("MiniMax ZIP 使用了不支持的压缩方式。");
      const extension = entryName.split(".").pop().toLowerCase();
      return { buffer: audio, mime: mimeForFormat(extension), filename: entryName.split(/[\\/]/).pop() };
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error("MiniMax 生成文件中没有找到可用音频。");
}

function decodeDataUrl(value) {
  const match = String(value || "").match(/^data:([^;,]+)?;base64,([A-Za-z0-9+/=\r\n]+)$/i);
  if (!match) throw new Error("上传文件内容无效。");
  return { mime: match[1] || "application/octet-stream", buffer: Buffer.from(match[2], "base64") };
}

function findSignatureFromEnd(buffer, signature) {
  for (let offset = Math.max(0, buffer.length - 65557); offset <= buffer.length - 4; offset += 1) {
    const candidate = buffer.length - 4 - (offset - Math.max(0, buffer.length - 65557));
    if (buffer.readUInt32LE(candidate) === signature) return candidate;
  }
  return -1;
}

function isAudioFilename(filename) {
  return /\.(?:mp3|wav|flac|opus|ogg|pcm|pcmu_raw|pcmu_wav)$/i.test(filename);
}

function mimeForFormat(format) {
  return ({
    mp3: "audio/mpeg",
    wav: "audio/wav",
    flac: "audio/flac",
    opus: "audio/ogg",
    ogg: "audio/ogg",
    pcm: "audio/L16",
    pcmu_raw: "audio/basic",
    pcmu_wav: "audio/wav"
  })[String(format || "").toLowerCase()] || "application/octet-stream";
}

function numberInRange(value, fallback, min, max, label) {
  const number = value === undefined || value === null || value === "" ? fallback : Number(value);
  if (!Number.isFinite(number) || number < min || number > max) throw new Error(`${label}参数超出支持范围。`);
  return number;
}

function integerInRange(value, fallback, min, max, label) {
  const number = numberInRange(value, fallback, min, max, label);
  if (!Number.isInteger(number)) throw new Error(`${label}必须是整数。`);
  return number;
}

module.exports = {
  MINIMAX_MODEL,
  buildPayload,
  createClient,
  extractAudioResult,
  mimeForFormat,
  normalizeBaseUrl,
  validateRequest
};
const zlib = require("node:zlib");

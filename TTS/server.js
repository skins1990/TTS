const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const {
  MINIMAX_MODEL,
  buildPayload: buildMinimaxPayload,
  createClient: createMinimaxClient,
  extractAudioResult: extractMinimaxAudio,
  normalizeBaseUrl: normalizeMinimaxBase,
  validateRequest: validateMinimaxRequest
} = require("./lib/minimax");
const {
  MODELS: SEED_AUDIO_MODELS,
  buildPayload: buildSeedAudioPayload,
  createClient: createSeedAudioClient,
  parseOfficialVoiceCatalog,
  validateRequest: validateSeedAudioRequest
} = require("./lib/seed-audio");

loadEnvFile();

const PORT = Number(process.env.PORT) || 4173;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "data");
const API_BASE = (process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/api/v1").replace(/\/$/, "");
const STEPFUN_BASE = normalizeStepfunBase(process.env.STEPFUN_BASE_URL || "https://api.stepfun.com/v1");
const MINIMAX_BASE = normalizeMinimaxBase(process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com/v1");
const SEED_AUDIO_BASE = process.env.SEED_AUDIO_BASE_URL || "https://openspeech.bytedance.com";
const requestedMinimaxPollInterval = Number(process.env.MINIMAX_POLL_INTERVAL_MS) || 2000;
const MINIMAX_POLL_INTERVAL = process.env.NODE_ENV === "test"
  ? Math.max(10, requestedMinimaxPollInterval)
  : Math.max(2000, requestedMinimaxPollInterval);
const VD_MODEL = "qwen3-tts-vd-2026-01-26";
const VC_MODEL = "qwen3-tts-vc-2026-01-22";
const FLASH_MODEL = "qwen3-tts-flash";
const INSTRUCT_MODEL = "qwen3-tts-instruct-flash";
const STEPFUN_MODEL = "stepaudio-2.5-tts";
const minimaxClient = createMinimaxClient({
  baseUrl: MINIMAX_BASE,
  apiKey: process.env.MINIMAX_API_KEY
});
const seedAudioClient = createSeedAudioClient({
  baseUrl: SEED_AUDIO_BASE,
  apiKey: process.env.SEED_AUDIO_API_KEY
});
const activeMinimaxTasks = new Set();
let minimaxVoiceCache = { voices: [], expiresAt: 0, pending: null };
let seedAudioVoiceCache = { voices: [], expiresAt: 0, pending: null };

const INSTRUCT_VOICES = [
  ["芊悦", "Cherry", "阳光积极、亲切自然小姐姐（女性）"],
  ["苏瑶", "Serena", "温柔小姐姐（女性）"],
  ["晨煦", "Ethan", "标准普通话，带部分北方口音。阳光、温暖、活力、朝气（男性）"],
  ["千雪", "Chelsie", "二次元虚拟女友（女性）"],
  ["茉兔", "Momo", "撒娇搞怪，逗你开心（女性）"],
  ["十三", "Vivian", "拽拽的、可爱的小暴躁（女性）"],
  ["月白", "Moon", "率性帅气的月白（男性）"],
  ["四月", "Maia", "知性与温柔的碰撞（女性）"],
  ["凯", "Kai", "耳朵的一场舒适旅行"],
  ["不吃鱼", "Nofish", "不会翘舌音的设计师（男性）"],
  ["萌宝", "Bella", "喝酒不打醉拳的小萝莉（女性）"],
  ["沧明子", "Eldric Sage", "沉稳睿智的老者，沧桑如松却心明如镜（男性）"],
  ["乖小妹", "Mia", "温顺如春水，乖巧如初雪（女性）"],
  ["沙小弥", "Mochi", "聪明伶俐的小大人，童真未泯却早慧如禅（男性）"],
  ["燕铮莺", "Bellona", "声音洪亮，吐字清晰，人物鲜活，听得人热血沸腾（女性）"],
  ["田叔", "Vincent", "一口独特的沙哑烟嗓，尽显江湖豪情（男性）"],
  ["萌小姬", "Bunny", "萌属性爆棚的小萝莉（女性）"],
  ["阿闻", "Neil", "平直基线语调，字正腔圆的专业新闻主持人（男性）"],
  ["墨讲师", "Elias", "严谨清晰，适合知识讲解的女声（女性）"],
  ["徐大爷", "Arthur", "质朴从容、适合乡土故事的长者男声"],
  ["邻家妹妹", "Nini", "糯米糍一样又软又黏的甜美女声"],
  ["小婉", "Seren", "温和舒缓，适合睡前陪伴的女声"],
  ["顽屁小孩", "Pip", "调皮捣蛋却充满童真的男孩声"],
  ["少女阿月", "Stella", "甜美迷糊又富有正义感的少女声"]
];

const STEPFUN_VOICES = [
  ["气质温婉", "elegantgentle-female", "女，真诚温柔，亲和力强，给人安全感", "客服、口播、教育、情感陪伴"],
  ["活力轻快", "livelybreezy-female", "女，有感染力、说服力和亲和力，富有活力", "情感陪伴、教育、营销"],
  ["温柔男声", "wenrounansheng", "男，温柔亲和，表达自然", "口播、情感陪伴、客服、教育"],
  ["温柔公子", "wenrougongzi", "男，沉稳温柔，叙述感强", "情感陪伴、有声书"],
  ["元气男声", "yuanqinansheng", "男，情绪饱满有活力", "有声书、口播、客服"],
  ["经典女声", "jingdiannvsheng", "女，语速舒缓，真诚温柔", "客服、情感陪伴"],
  ["温柔熟女", "wenroushunv", "女，成熟稳重，温柔有亲和力", "客服、口播、教育"],
  ["甜美女声", "tianmeinvsheng", "女，甜美温柔，亲和力强", "情感陪伴、客服"],
  ["清纯少女", "qingchunshaonv", "女，温柔轻盈，有活力和亲和力", "客服、语音助手"],
  ["磁性男声", "cixingnansheng", "男，深情厚重，有感染力，带霸总感", "有声书、情感陪伴"],
  ["元气少女", "yuanqishaonv", "女，声线细腻，甜美灵动", "有声书、情感陪伴、语音助手"],
  ["邻家姐姐", "linjiajiejie", "女，亲和自然，给人安全感", "口播、情感陪伴、语音助手、视频配音"],
  ["正派青年", "zhengpaiqingnian", "男，有感染力、说服力和亲和力，富有激情", "营销、有声书"],
  ["青年大学生", "qingniandaxuesheng", "男，沉稳厚实，具有播音专业感", "口播、视频配音"],
  ["播音男声", "boyinnansheng", "男，播音腔，中正平稳", "有声书、口播"],
  ["儒雅男士", "ruyananshi", "男，沉稳厚重，叙述感和陪伴感强", "有声书、情感陪伴、口播、语音助手"],
  ["深沉男音", "shenchennanyin", "男，感情充沛，代入感强，给人信心", "情感陪伴、有声书"],
  ["亲切女声", "qinqienvsheng", "女，温柔略带甜美，亲和而有邻家感", "口播、情感陪伴、语音助手"],
  ["温柔女声", "wenrounvsheng", "女，温柔甜美，叙述感强，富有关怀感", "有声书、情感陪伴"],
  ["机灵少女", "jilingshaonv", "女，声线细腻，机灵有活力", "语音助手、口播"],
  ["软萌女声", "ruanmengnvsheng", "女，可爱、甜美、软萌", "情感陪伴、语音助手、视频配音"],
  ["优雅女声", "youyanvsheng", "女，成熟亲和，给人踏实感", "视频配音"],
  ["冷艳御姐", "lengyanyujie", "女，具有播音感，专业又不失亲和", "视频配音"],
  ["爽快姐姐", "shuangkuaijiejie", "女，声线清澈，爽朗有活力", "口播、语音助手"],
  ["文静学姐", "wenjingxuejie", "女，冷静沉稳，吐字清晰稳定", "口播、语音助手"],
  ["邻家妹妹", "linjiameimei", "女，可爱亲和，带一点稚气感", "视频配音、口播、语音助手"],
  ["知性姐姐", "zhixingjiejie", "女，成熟沉稳，叙述富有画面感", "视频配音、口播、语音助手"],
  ["爽快男声", "shuangkuainansheng", "男，沉稳冷静，慢条斯理，专业感强", "客服、语音助手"],
  ["干练女声", "ganliannvsheng", "女，沉稳冷静，表达利落，专业感强", "客服、语音助手"],
  ["亲和女声", "qinhenvsheng", "女，冷静温柔，富有亲和力", "客服、语音助手"],
  ["活力女声", "huolinvsheng", "女，轻盈有活力，亲和力强", "客服、语音助手"],
  ["自信男声", "zixinnansheng", "男，真诚亲和，自信有活力", "有声书、情感陪伴、教育、营销"],
  ["活力青年（英文）", "vibrant-youth", "男，英文音色，温柔亲和", "有声书、视频配音"],
  ["活力女孩（英文）", "lively-girl", "女，英文音色，亲和而有活力", "有声书、视频配音"],
  ["温柔绅士（英文）", "soft-spoken-gentleman", "男，英文音色，沉稳温柔，给人安全感", "情感陪伴、有声书"],
  ["磁性男声（英文）", "magnetic-voiced-male", "男，英文音色，沉稳厚重感强", "有声书、视频配音"]
];

const STEPFUN_EMOTIONS = new Set(["自动", "高兴", "非常高兴", "悲伤", "生气", "非常生气", "撒娇", "恐惧", "惊讶", "兴奋", "钦佩", "困惑"]);
const STEPFUN_STYLES = new Set(["自动", "慢速", "极慢", "快速", "极快", "冷漠", "尴尬", "沮丧", "骄傲", "温柔", "甜美", "豪爽", "严肃", "傲慢", "老年", "吼叫", "阴阳怪气", "磕巴"]);
const STEPFUN_LANGUAGES = new Map([
  ["自动", ""],
  ["中文", "以自然标准的中文表达"],
  ["英文", "以自然地道的英文表达"],
  ["中英混合", "中英文切换自然，英文发音地道"],
  ["日语", "以自然地道的日语表达"]
]);

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, "qwen-tts.db"));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS voices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    voice_id TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('vd', 'vc')),
    prompt TEXT,
    source_hash TEXT UNIQUE,
    source_filename TEXT,
    preview_audio BLOB,
    preview_mime TEXT,
    is_official INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    expires_at TEXT,
    voice_db_id INTEGER,
    voice_name TEXT NOT NULL,
    mode TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (voice_db_id) REFERENCES voices(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS minimax_tasks (
    task_id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK(status IN ('processing', 'success', 'failed', 'expired')),
    source_text TEXT NOT NULL,
    voice_id TEXT NOT NULL,
    voice_name TEXT NOT NULL,
    settings_json TEXT NOT NULL,
    file_id TEXT,
    generation_id INTEGER,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (generation_id) REFERENCES generations(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_voices_type_created ON voices(type, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_generations_created ON generations(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_minimax_tasks_status_updated ON minimax_tasks(status, updated_at DESC);
`);

const voiceColumns = db.prepare("PRAGMA table_info(voices)").all();
if (!voiceColumns.some((column) => column.name === "is_official")) {
  db.exec("ALTER TABLE voices ADD COLUMN is_official INTEGER NOT NULL DEFAULT 0");
}
const generationColumns = db.prepare("PRAGMA table_info(generations)").all();
if (!generationColumns.some((column) => column.name === "audio_data")) db.exec("ALTER TABLE generations ADD COLUMN audio_data BLOB");
if (!generationColumns.some((column) => column.name === "audio_mime")) db.exec("ALTER TABLE generations ADD COLUMN audio_mime TEXT");
if (!generationColumns.some((column) => column.name === "settings_json")) db.exec("ALTER TABLE generations ADD COLUMN settings_json TEXT");
// Legacy databases did not have the flag; classify their system voices before listing the library.
db.prepare("UPDATE voices SET is_official = 1 WHERE model = ?").run(FLASH_MODEL);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/api/status") {
      return sendJson(res, 200, {
        configured: Boolean(process.env.DASHSCOPE_API_KEY && process.env.STEPFUN_API_KEY && process.env.MINIMAX_API_KEY && process.env.SEED_AUDIO_API_KEY),
        qwenConfigured: Boolean(process.env.DASHSCOPE_API_KEY),
        stepfunConfigured: Boolean(process.env.STEPFUN_API_KEY),
        minimaxConfigured: Boolean(process.env.MINIMAX_API_KEY),
        seedAudioConfigured: Boolean(process.env.SEED_AUDIO_API_KEY),
        database: "sqlite",
        vdModel: VD_MODEL,
        vcModel: VC_MODEL,
        officialModel: FLASH_MODEL,
        instructModel: INSTRUCT_MODEL,
        instructVoiceCount: INSTRUCT_VOICES.length,
        stepfunModel: STEPFUN_MODEL,
        stepfunVoiceCount: STEPFUN_VOICES.length,
        minimaxModel: MINIMAX_MODEL,
        seedAudioModels: SEED_AUDIO_MODELS
      });
    }

    if (req.method === "GET" && pathname === "/api/voices") {
      return listVoices(res, url.searchParams.get("type"));
    }
    if (req.method === "GET" && pathname === "/api/instruct-voices") return listInstructVoices(res);
    if (req.method === "GET" && pathname === "/api/step-voices") return listStepfunVoices(res);
    if (req.method === "GET" && pathname === "/api/minimax/voices") return await listMinimaxVoices(res);
    if (req.method === "GET" && pathname === "/api/seed-audio/voices") return await listSeedAudioVoices(res);

    const previewMatch = pathname.match(/^\/api\/voices\/(\d+)\/preview$/);
    if (req.method === "GET" && previewMatch) return serveVoicePreview(res, Number(previewMatch[1]));

    const voiceMatch = pathname.match(/^\/api\/voices\/(\d+)$/);
    if (req.method === "PATCH" && voiceMatch) return await renameVoice(req, res, Number(voiceMatch[1]));
    if (req.method === "DELETE" && voiceMatch) return await deleteVoice(res, Number(voiceMatch[1]));

    if (req.method === "POST" && pathname === "/api/voices/design") return await createDesignedVoice(req, res);
    if (req.method === "POST" && pathname === "/api/voices/clone") return await createClonedVoice(req, res);

    if (req.method === "GET" && pathname === "/api/generations") return listGenerations(res, url.searchParams.get("mode"));
    if (req.method === "DELETE" && pathname === "/api/generations") {
      return clearGenerations(res, url.searchParams.get("mode"));
    }
    if (req.method === "POST" && pathname === "/api/generate") return await generateSpeech(req, res);
    if (req.method === "POST" && pathname === "/api/generate-instruct") return await generateInstructSpeech(req, res);
    if (req.method === "POST" && pathname === "/api/generate-step") return await generateStepfunSpeech(req, res);
    if (req.method === "POST" && pathname === "/api/minimax/generations") return await createMinimaxGeneration(req, res);
    if (req.method === "POST" && pathname === "/api/seed-audio/generations") return await createSeedAudioGeneration(req, res);

    const minimaxTaskMatch = pathname.match(/^\/api\/minimax\/tasks\/([^/]+)$/);
    if (req.method === "GET" && minimaxTaskMatch) {
      return getMinimaxTask(res, decodeURIComponent(minimaxTaskMatch[1]));
    }

    const generationAudioMatch = pathname.match(/^\/api\/generations\/(\d+)\/audio$/);
    if ((req.method === "GET" || req.method === "HEAD") && generationAudioMatch) {
      return serveGenerationAudio(req, res, Number(generationAudioMatch[1]), url.searchParams.get("download") === "1");
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return sendJson(res, 405, { error: "不支持这个请求方式。" });
    }
    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    const status = error.message === "Request body too large" ? 413 : 500;
    return sendJson(res, status, { error: status === 413 ? "上传内容过大。" : "服务暂时不可用，请稍后重试。" });
  }
});

function listVoices(res, requestedType) {
  const type = requestedType === "vc" ? "vc" : requestedType === "vd" ? "vd" : null;
  const rows = type
    ? db.prepare("SELECT id, name, voice_id, model, type, prompt, source_filename, is_official, preview_audio IS NOT NULL AS has_preview, created_at FROM voices WHERE type = ? AND model <> ? ORDER BY is_official ASC, created_at DESC").all(type, INSTRUCT_MODEL)
    : db.prepare("SELECT id, name, voice_id, model, type, prompt, source_filename, is_official, preview_audio IS NOT NULL AS has_preview, created_at FROM voices WHERE model <> ? ORDER BY is_official ASC, created_at DESC").all(INSTRUCT_MODEL);
  return sendJson(res, 200, { voices: rows.map(serializeVoice) });
}

function listInstructVoices(res) {
  return sendJson(res, 200, {
    model: INSTRUCT_MODEL,
    voices: INSTRUCT_VOICES.map(([name, voiceId, description]) => ({
      name, voiceId, description, model: INSTRUCT_MODEL, isOfficial: true
    }))
  });
}

function listStepfunVoices(res) {
  return sendJson(res, 200, {
    model: STEPFUN_MODEL,
    voices: STEPFUN_VOICES.map(([name, voiceId, description, scene]) => ({
      name, voiceId, description, scene, model: STEPFUN_MODEL, isOfficial: true
    }))
  });
}

async function listMinimaxVoices(res) {
  if (!hasMinimaxApiKey(res)) return;
  try {
    const voices = await getMinimaxVoices();
    return sendJson(res, 200, {
      model: MINIMAX_MODEL,
      voices: voices.map((voice) => ({ voiceId: voice.id, name: voice.name, description: voice.description }))
    });
  } catch (error) {
    console.error("MiniMax voice list error", error);
    return sendJson(res, 502, { error: error.message || "读取 MiniMax 官方音色失败。" });
  }
}

async function getMinimaxVoices() {
  if (minimaxVoiceCache.voices.length && minimaxVoiceCache.expiresAt > Date.now()) {
    return minimaxVoiceCache.voices;
  }
  if (!minimaxVoiceCache.pending) {
    minimaxVoiceCache.pending = minimaxClient.getSystemVoices()
      .then((voices) => {
        minimaxVoiceCache = { voices, expiresAt: Date.now() + 30 * 60 * 1000, pending: null };
        return voices;
      })
      .catch((error) => {
        minimaxVoiceCache.pending = null;
        throw error;
      });
  }
  return await minimaxVoiceCache.pending;
}

async function listSeedAudioVoices(res) {
  try {
    const voices = await getSeedAudioVoices();
    return sendJson(res, 200, { voices, models: SEED_AUDIO_MODELS });
  } catch (error) {
    console.error("Seed Audio voice list error", error);
    return sendJson(res, 200, { voices: fallbackSeedAudioVoices(), models: SEED_AUDIO_MODELS, warning: "官方音色目录暂时无法更新，当前显示常用音色。" });
  }
}

async function getSeedAudioVoices() {
  if (seedAudioVoiceCache.voices.length && seedAudioVoiceCache.expiresAt > Date.now()) {
    return seedAudioVoiceCache.voices;
  }
  if (!seedAudioVoiceCache.pending) {
    seedAudioVoiceCache.pending = fetch("https://www.volcengine.com/api/doc/getDocDetail?DocumentID=1257544&LibraryID=6561", { signal: AbortSignal.timeout(10000) })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const voices = parseOfficialVoiceCatalog(data?.Result?.Content);
        if (!voices.length) throw new Error("官方文档中没有可用音色。");
        seedAudioVoiceCache = { voices, expiresAt: Date.now() + 6 * 60 * 60 * 1000, pending: null };
        return voices;
      })
      .catch((error) => {
        seedAudioVoiceCache.pending = null;
        throw error;
      });
  }
  return await seedAudioVoiceCache.pending;
}

async function createSeedAudioGeneration(req, res) {
  if (!hasSeedAudioApiKey(res)) return;
  const body = await readJson(req, 48 * 1024 * 1024);
  let request;
  try {
    request = validateSeedAudioRequest(body);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const requestId = String(req.headers["x-request-id"] || crypto.randomUUID()).slice(0, 200);
  try {
    const result = await seedAudioClient.create(buildSeedAudioPayload(request), requestId);
    if (!result.audio) return sendJson(res, 502, { error: "Seed Audio 已响应，但没有返回音频数据。", requestId, logId: result.logId });
    let audioBuffer;
    try { audioBuffer = Buffer.from(result.audio, "base64"); } catch { audioBuffer = Buffer.alloc(0); }
    if (!audioBuffer.length) return sendJson(res, 502, { error: "Seed Audio 返回的音频 Base64 无效。", requestId, logId: result.logId });

    const referenceMode = request.references[0]?.kind || "text";
    const voiceName = referenceMode === "image"
      ? "图片参考生成"
      : referenceMode === "audio"
        ? seedAudioReferenceLabel(request.references)
        : "纯文本生成";
    const now = new Date().toISOString();
    const settings = {
      model: request.model,
      referenceMode,
      references: request.references.map((reference, index) => ({
        index: index + 1,
        kind: reference.kind,
        speaker: reference.speaker || null,
        filename: reference.filename || null
      })),
      responseFormat: request.format,
      sampleRate: request.sampleRate,
      speechRate: request.speechRate,
      loudnessRate: request.loudnessRate,
      pitchRate: request.pitchRate,
      enableSubtitle: request.enableSubtitle,
      aigcWatermark: request.aigcWatermark,
      metadataEnabled: request.metadataEnabled,
      metadata: request.metadataEnabled ? request.metadata : null,
      duration: result.duration,
      originalDuration: result.originalDuration,
      subtitle: result.subtitle,
      requestId: result.requestId,
      logId: result.logId
    };
    const inserted = db.prepare(`
      INSERT INTO generations
        (text, audio_url, expires_at, voice_db_id, voice_name, mode, audio_data, audio_mime, settings_json, created_at)
      VALUES (?, '', NULL, NULL, ?, 'seed-audio', ?, ?, ?, ?)
    `).run(request.textPrompt, voiceName, audioBuffer, seedAudioMime(request.format), JSON.stringify(settings), now);
    const id = Number(inserted.lastInsertRowid);
    const audioUrl = `/api/generations/${id}/audio`;
    db.prepare("UPDATE generations SET audio_url = ? WHERE id = ?").run(audioUrl, id);
    return sendJson(res, 200, {
      generation: {
        id,
        text: request.textPrompt,
        audioUrl,
        downloadUrl: `${audioUrl}?download=1`,
        expiresAt: null,
        voiceId: null,
        voiceName,
        mode: "seed-audio",
        settings,
        createdAt: now
      },
      requestId,
      logId: result.logId
    });
  } catch (error) {
    console.error("Seed Audio synthesis error", error);
    return sendJson(res, 502, { error: error.message || "Seed Audio 生成失败，请检查参数与 API Key。", requestId });
  }
}

async function createMinimaxGeneration(req, res) {
  if (!hasMinimaxApiKey(res)) return;
  const body = await readJson(req, 16 * 1024 * 1024);
  let request;
  try {
    request = validateMinimaxRequest(body);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  let voices;
  try {
    voices = await getMinimaxVoices();
  } catch (error) {
    console.error("MiniMax voice validation error", error);
    return sendJson(res, 502, { error: error.message || "无法校验 MiniMax 官方音色。" });
  }
  const voice = voices.find((item) => item.id === request.voiceId);
  if (!voice) return sendJson(res, 400, { error: "请选择当前账号可用的 MiniMax 官方音色。" });

  try {
    const textFileId = request.file ? await minimaxClient.uploadTextFile(request.file) : null;
    const upstreamTask = await minimaxClient.createTask(buildMinimaxPayload(request, textFileId));
    const now = new Date().toISOString();
    const settings = {
      model: MINIMAX_MODEL,
      voiceId: voice.id,
      voiceName: voice.name,
      languageBoost: request.languageBoost,
      speed: request.speed,
      volume: request.volume,
      pitch: request.pitch,
      emotion: request.emotion,
      englishNormalization: request.englishNormalization,
      pronunciationRules: request.pronunciationRules,
      responseFormat: request.format,
      sampleRate: request.sampleRate,
      bitrate: request.bitrate,
      channel: request.channel,
      modifyPitch: request.modifyPitch,
      modifyIntensity: request.modifyIntensity,
      modifyTimbre: request.modifyTimbre,
      soundEffect: request.soundEffect,
      aigcWatermark: request.aigcWatermark,
      inputType: request.file ? "file" : "text",
      sourceFilename: request.file?.name || null,
      usageCharacters: upstreamTask.usageCharacters
    };
    const sourceText = request.text || `文件：${request.file.name}`;
    db.prepare(`
      INSERT INTO minimax_tasks
        (task_id, status, source_text, voice_id, voice_name, settings_json, file_id, generation_id, error, created_at, updated_at)
      VALUES (?, 'processing', ?, ?, ?, ?, ?, NULL, NULL, ?, ?)
    `).run(upstreamTask.taskId, sourceText, voice.id, voice.name, JSON.stringify(settings), upstreamTask.fileId, now, now);
    runMinimaxTask(upstreamTask.taskId);
    return sendJson(res, 202, { task: serializeMinimaxTask(getMinimaxTaskRow(upstreamTask.taskId)) });
  } catch (error) {
    console.error("MiniMax task creation error", error);
    return sendJson(res, 502, { error: error.message || "创建 MiniMax 语音任务失败。" });
  }
}

function getMinimaxTask(res, taskId) {
  const row = getMinimaxTaskRow(taskId);
  if (!row) return sendJson(res, 404, { error: "找不到这个 MiniMax 语音任务。" });
  return sendJson(res, 200, { task: serializeMinimaxTask(row) });
}

function getMinimaxTaskRow(taskId) {
  return db.prepare(`
    SELECT task_id, status, source_text, voice_id, voice_name, settings_json, file_id,
      generation_id, error, created_at, updated_at
    FROM minimax_tasks WHERE task_id = ?
  `).get(String(taskId));
}

function serializeMinimaxTask(row) {
  const generation = row.generation_id ? getGenerationRow(row.generation_id) : null;
  return {
    taskId: row.task_id,
    status: row.status,
    fileId: row.file_id || null,
    error: row.error || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    generation: generation ? serializeGeneration(generation) : null
  };
}

function runMinimaxTask(taskId) {
  const normalizedTaskId = String(taskId);
  if (activeMinimaxTasks.has(normalizedTaskId)) return;
  activeMinimaxTasks.add(normalizedTaskId);
  void processMinimaxTask(normalizedTaskId).finally(() => activeMinimaxTasks.delete(normalizedTaskId));
}

async function processMinimaxTask(taskId) {
  let transientFailures = 0;
  while (true) {
    const row = getMinimaxTaskRow(taskId);
    if (!row || row.status !== "processing") return;
    try {
      const upstream = await minimaxClient.queryTask(taskId);
      const now = new Date().toISOString();
      if (upstream.status === "processing") {
        db.prepare("UPDATE minimax_tasks SET file_id = COALESCE(?, file_id), updated_at = ? WHERE task_id = ?")
          .run(upstream.fileId, now, taskId);
        transientFailures = 0;
        await delay(MINIMAX_POLL_INTERVAL);
        continue;
      }
      if (upstream.status === "success") {
        await completeMinimaxTask(row, upstream.fileId || row.file_id);
        return;
      }
      const status = upstream.status === "expired" ? "expired" : "failed";
      const message = status === "expired" ? "MiniMax 语音任务已过期。" : "MiniMax 语音生成失败。";
      db.prepare("UPDATE minimax_tasks SET status = ?, file_id = COALESCE(?, file_id), error = ?, updated_at = ? WHERE task_id = ?")
        .run(status, upstream.fileId, message, now, taskId);
      return;
    } catch (error) {
      transientFailures += 1;
      if (transientFailures < 3) {
        await delay(MINIMAX_POLL_INTERVAL);
        continue;
      }
      console.error("MiniMax task processing error", taskId, error);
      db.prepare("UPDATE minimax_tasks SET status = 'failed', error = ?, updated_at = ? WHERE task_id = ?")
        .run(error.message || "MiniMax 语音任务处理失败。", new Date().toISOString(), taskId);
      return;
    }
  }
}

async function completeMinimaxTask(taskRow, fileId) {
  if (!fileId) throw new Error("MiniMax 任务完成但没有返回文件 ID。");
  const file = await minimaxClient.retrieveFile(fileId);
  const downloaded = await minimaxClient.downloadFile(file);
  const settings = parseSettings(taskRow.settings_json);
  const audio = extractMinimaxAudio(downloaded.buffer, {
    contentType: downloaded.contentType,
    filename: downloaded.filename,
    requestedFormat: settings.responseFormat
  });
  if (!audio.buffer.length) throw new Error("MiniMax 生成文件中没有可用音频内容。");

  const now = new Date().toISOString();
  const inserted = db.prepare(`
    INSERT INTO generations
      (text, audio_url, expires_at, voice_db_id, voice_name, mode, audio_data, audio_mime, settings_json, created_at)
    VALUES (?, '', NULL, NULL, ?, 'minimax', ?, ?, ?, ?)
  `).run(taskRow.source_text, taskRow.voice_name, audio.buffer, audio.mime, taskRow.settings_json, now);
  const generationId = Number(inserted.lastInsertRowid);
  const audioUrl = `/api/generations/${generationId}/audio`;
  db.prepare("UPDATE generations SET audio_url = ? WHERE id = ?").run(audioUrl, generationId);
  db.prepare(`
    UPDATE minimax_tasks SET status = 'success', file_id = ?, generation_id = ?, error = NULL, updated_at = ?
    WHERE task_id = ?
  `).run(String(fileId), generationId, now, taskRow.task_id);
}

function getGenerationRow(id) {
  return db.prepare(`
    SELECT id, text, audio_url, expires_at, voice_db_id, voice_name, mode, settings_json,
      audio_data IS NOT NULL AS has_audio, created_at
    FROM generations WHERE id = ?
  `).get(id);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function serveVoicePreview(res, id) {
  const row = db.prepare("SELECT preview_audio, preview_mime FROM voices WHERE id = ?").get(id);
  if (!row?.preview_audio) return sendJson(res, 404, { error: "这个音色没有试听音频。" });
  res.writeHead(200, {
    "Content-Type": row.preview_mime || "audio/wav",
    "Content-Length": row.preview_audio.length,
    "Cache-Control": "private, max-age=86400"
  });
  res.end(row.preview_audio);
}

async function createDesignedVoice(req, res) {
  if (!hasApiKey(res)) return;
  const body = await readJson(req, 128 * 1024);
  const name = String(body.name || "").trim().slice(0, 40);
  const voicePrompt = String(body.voicePrompt || "").trim();
  const previewText = String(body.previewText || "大家好，很高兴用这个新声音与你见面。").trim();
  if (!name) return sendJson(res, 400, { error: "请给设计音色起一个名字。" });
  if (!voicePrompt) return sendJson(res, 400, { error: "请填写声音描述。" });
  if (voicePrompt.length > 2048) return sendJson(res, 400, { error: "声音描述不能超过 2,048 个字符。" });
  if (!previewText || previewText.length > 300) return sendJson(res, 400, { error: "试听文本请控制在 300 字以内。" });

  const result = await callCustomization({
    model: "qwen-voice-design",
    input: {
      action: "create",
      target_model: VD_MODEL,
      preferred_name: `vd_${crypto.randomBytes(4).toString("hex")}`,
      voice_prompt: voicePrompt,
      preview_text: previewText
    },
    parameters: { sample_rate: 24000, response_format: "wav" }
  });
  if (result.error) return sendJson(res, result.status, { error: result.error, requestId: result.requestId });

  const voiceId = result.data.output?.voice;
  if (!voiceId) return sendJson(res, 502, { error: "声音设计成功响应中缺少音色 ID。" });
  const previewBase64 = result.data.output?.preview_audio?.data;
  const previewBuffer = previewBase64 ? Buffer.from(previewBase64, "base64") : null;
  const now = new Date().toISOString();
  const inserted = db.prepare(`
    INSERT INTO voices (name, voice_id, model, type, prompt, preview_audio, preview_mime, created_at)
    VALUES (?, ?, ?, 'vd', ?, ?, 'audio/wav', ?)
  `).run(name, voiceId, VD_MODEL, voicePrompt, previewBuffer, now);
  const voice = db.prepare("SELECT id, name, voice_id, model, type, prompt, is_official, preview_audio IS NOT NULL AS has_preview, created_at FROM voices WHERE id = ?").get(Number(inserted.lastInsertRowid));
  return sendJson(res, 201, { voice: serializeVoice(voice) });
}

async function createClonedVoice(req, res) {
  if (!hasApiKey(res)) return;
  const body = await readJson(req, 14 * 1024 * 1024);
  const name = String(body.name || "").trim().slice(0, 40);
  const audioData = String(body.audioData || "");
  const sourceFilename = String(body.filename || "参考音频").slice(0, 160);
  if (!name) return sendJson(res, 400, { error: "请给复刻音色起一个名字。" });
  if (!/^data:audio\/(?:wav|x-wav|vnd\.wave|mpeg|mp3|mp4|m4a|x-m4a);base64,/i.test(audioData)) {
    return sendJson(res, 400, { error: "请上传 WAV、MP3 或 M4A 格式的参考音频。" });
  }
  const base64 = audioData.slice(audioData.indexOf(",") + 1);
  if (base64.length > Math.ceil(10 * 1024 * 1024 * 4 / 3) + 8) {
    return sendJson(res, 400, { error: "参考音频不能超过 10 MB。" });
  }

  const sourceHash = crypto.createHash("sha256").update(base64).digest("hex");
  const existing = db.prepare("SELECT id, name, voice_id, model, type, source_filename, created_at FROM voices WHERE source_hash = ?").get(sourceHash);
  if (existing) return sendJson(res, 200, { voice: serializeVoice(existing), reused: true });

  const result = await callCustomization({
    model: "qwen-voice-enrollment",
    input: {
      action: "create",
      target_model: VC_MODEL,
      preferred_name: `vc_${sourceHash.slice(0, 8)}`,
      audio: { data: audioData }
    }
  });
  if (result.error) return sendJson(res, result.status, { error: result.error, requestId: result.requestId });

  const voiceId = result.data.output?.voice;
  if (!voiceId) return sendJson(res, 502, { error: "声音复刻成功响应中缺少音色 ID。" });
  const now = new Date().toISOString();
  const inserted = db.prepare(`
    INSERT INTO voices (name, voice_id, model, type, source_hash, source_filename, created_at)
    VALUES (?, ?, ?, 'vc', ?, ?, ?)
  `).run(name, voiceId, VC_MODEL, sourceHash, sourceFilename, now);
  const voice = db.prepare("SELECT id, name, voice_id, model, type, source_filename, created_at FROM voices WHERE id = ?").get(Number(inserted.lastInsertRowid));
  return sendJson(res, 201, { voice: serializeVoice(voice), reused: false });
}

async function generateSpeech(req, res) {
  if (!hasApiKey(res)) return;
  const body = await readJson(req, 128 * 1024);
  const text = String(body.text || "").trim();
  const voiceDbId = Number(body.voiceId);
  if (!text) return sendJson(res, 400, { error: "请先输入要生成的文字。" });
  if (text.length > 10000) return sendJson(res, 400, { error: "单次文本请控制在 10,000 字符以内。" });
  if (!Number.isInteger(voiceDbId)) return sendJson(res, 400, { error: "请选择一个已保存的音色。" });

  const voice = db.prepare("SELECT id, name, voice_id, model, type, is_official FROM voices WHERE id = ?").get(voiceDbId);
  if (!voice) return sendJson(res, 404, { error: "找不到这个音色，请重新选择。" });
  if (![FLASH_MODEL, VD_MODEL, VC_MODEL].includes(voice.model)) return sendJson(res, 400, { error: "普通生成只支持 VD、VC 或官方系统音色。" });

  const response = await fetch(`${API_BASE}/services/aigc/multimodal-generation/generation`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: voice.model, input: { text, voice: voice.voice_id } })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.code) {
    console.error("DashScope synthesis error", response.status, result);
    return sendJson(res, response.status >= 500 ? 502 : 400, {
      error: result.message || "语音生成失败，请检查音色与 API Key。",
      requestId: result.request_id || result.requestId
    });
  }

  const audio = result.output?.audio;
  if (!audio?.url) return sendJson(res, 502, { error: "模型已响应，但没有返回可用的音频地址。" });
  const now = new Date().toISOString();
  const expiresAt = audio.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const inserted = db.prepare(`
    INSERT INTO generations (text, audio_url, expires_at, voice_db_id, voice_name, mode, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(text, audio.url, expiresAt, voice.id, voice.name, voice.is_official ? "official" : voice.type, now);
  return sendJson(res, 200, {
    generation: {
      id: Number(inserted.lastInsertRowid), text, audioUrl: audio.url, expiresAt,
      voiceId: voice.id, voiceName: voice.name, mode: voice.is_official ? "official" : voice.type, createdAt: now
    },
    requestId: result.request_id || result.requestId || null
  });
}

async function generateInstructSpeech(req, res) {
  if (!hasApiKey(res)) return;
  const body = await readJson(req, 128 * 1024);
  const text = String(body.text || "").trim();
  const voiceId = String(body.voiceId || "").trim();
  const instructions = String(body.instructions || "").trim();
  const voice = INSTRUCT_VOICES.find(([, id]) => id === voiceId);
  if (!text) return sendJson(res, 400, { error: "请先输入要生成的文字。" });
  if (text.length > 10000) return sendJson(res, 400, { error: "单次文本请控制在 10,000 字符以内。" });
  if (!voice) return sendJson(res, 400, { error: "请选择一个 Instruct 官方音色。" });
  if (!instructions) return sendJson(res, 400, { error: "请填写语气指令。" });
  if (instructions.length > 4000) return sendJson(res, 400, { error: "语气指令请控制在 4,000 字符以内。" });

  const response = await fetch(`${API_BASE}/services/aigc/multimodal-generation/generation`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: INSTRUCT_MODEL,
      input: { text, voice: voice[1] },
      parameters: {
        instructions,
        optimize_instructions: body.optimizeInstructions !== false
      }
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.code) {
    console.error("DashScope instruct synthesis error", response.status, result);
    return sendJson(res, response.status >= 500 ? 502 : 400, {
      error: result.message || "语气控制生成失败，请检查官方音色、指令与 API Key。",
      requestId: result.request_id || result.requestId
    });
  }

  const audio = result.output?.audio;
  if (!audio?.url) return sendJson(res, 502, { error: "模型已响应，但没有返回可用的音频地址。" });
  const now = new Date().toISOString();
  const expiresAt = audio.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const inserted = db.prepare(`
    INSERT INTO generations (text, audio_url, expires_at, voice_db_id, voice_name, mode, created_at)
    VALUES (?, ?, ?, NULL, ?, 'instruct', ?)
  `).run(text, audio.url, expiresAt, voice[0], now);
  return sendJson(res, 200, {
    generation: {
      id: Number(inserted.lastInsertRowid), text, audioUrl: audio.url, expiresAt,
      voiceId: voice[1], voiceName: voice[0], mode: "instruct", createdAt: now
    },
    requestId: result.request_id || result.requestId || null
  });
}

async function generateStepfunSpeech(req, res) {
  if (!hasStepfunApiKey(res)) return;
  const body = await readJson(req, 128 * 1024);
  const text = String(body.text || "").trim();
  const voiceId = String(body.voiceId || "").trim();
  const voice = STEPFUN_VOICES.find(([, id]) => id === voiceId);
  const emotion = String(body.emotion || "自动").trim();
  const style = String(body.style || "自动").trim();
  const language = String(body.language || "自动").trim();
  const customInstruction = String(body.instruction || "").trim();
  const speed = Number(body.speed ?? 1);
  const volume = Number(body.volume ?? 1);
  const responseFormat = String(body.responseFormat || "mp3").toLowerCase();
  const sampleRate = Number(body.sampleRate ?? 24000);
  const textNormalization = String(body.textNormalization || "standard");
  const markdownFilter = body.markdownFilter === true;
  const pronunciationRules = Array.isArray(body.pronunciationRules)
    ? body.pronunciationRules.map((rule) => String(rule).trim()).filter(Boolean)
    : [];

  if (!text) return sendJson(res, 400, { error: "请先输入要生成的文字。" });
  if (text.length > 1000) return sendJson(res, 400, { error: "StepAudio 2.5 单次文本不能超过 1,000 个字符。" });
  if (!voice) return sendJson(res, 400, { error: "请选择一个阶跃官方音色。" });
  if (!STEPFUN_EMOTIONS.has(emotion)) return sendJson(res, 400, { error: "不支持这个情绪选项。" });
  if (!STEPFUN_STYLES.has(style)) return sendJson(res, 400, { error: "不支持这个演绎风格。" });
  if (!STEPFUN_LANGUAGES.has(language)) return sendJson(res, 400, { error: "不支持这个语言倾向。" });
  if (!Number.isFinite(speed) || speed < 0.5 || speed > 2) return sendJson(res, 400, { error: "语速必须在 0.5 到 2.0 之间。" });
  if (!Number.isFinite(volume) || volume < 0.1 || volume > 2) return sendJson(res, 400, { error: "音量必须在 0.1 到 2.0 之间。" });
  if (!["wav", "mp3", "flac", "opus", "pcm"].includes(responseFormat)) return sendJson(res, 400, { error: "不支持这个音频格式。" });
  if (![8000, 16000, 22050, 24000, 48000].includes(sampleRate)) return sendJson(res, 400, { error: "不支持这个采样率。" });
  if (!["standard", "enhanced"].includes(textNormalization)) return sendJson(res, 400, { error: "不支持这个文本归一化策略。" });
  if (pronunciationRules.length > 50) return sendJson(res, 400, { error: "发音映射最多填写 50 条。" });
  if (pronunciationRules.some((rule) => !rule.includes("/") || rule.length > 120)) {
    return sendJson(res, 400, { error: "每条发音映射都要使用“原文/发音”格式，并控制在 120 字符以内。" });
  }

  const instructionParts = [];
  if (emotion !== "自动") instructionParts.push(`整体情绪为${emotion}`);
  if (style !== "自动") instructionParts.push(`使用${style}的演绎风格`);
  if (STEPFUN_LANGUAGES.get(language)) instructionParts.push(STEPFUN_LANGUAGES.get(language));
  if (customInstruction) instructionParts.push(customInstruction);
  const instruction = instructionParts.join("；");
  if (instruction.length > 200) return sendJson(res, 400, { error: "组合后的全局指令超过 200 字，请缩短补充指令。" });

  const payload = {
    model: STEPFUN_MODEL,
    input: text,
    voice: voice[1],
    response_format: responseFormat,
    speed,
    volume,
    sample_rate: sampleRate,
    text_normalization: textNormalization,
    markdown_filter: markdownFilter
  };
  if (instruction) payload.instruction = instruction;
  if (pronunciationRules.length) payload.pronunciation_map = { tone: pronunciationRules };

  let response;
  try {
    response = await fetch(`${STEPFUN_BASE}/audio/speech`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.STEPFUN_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("StepFun synthesis connection error", error);
    return sendJson(res, 502, { error: "无法连接阶跃语音服务，请检查 STEPFUN_BASE_URL。" });
  }

  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    let errorData = {};
    try { errorData = JSON.parse(raw); } catch { errorData = {}; }
    console.error("StepFun synthesis error", response.status, errorData || raw);
    return sendJson(res, response.status >= 500 ? 502 : 400, {
      error: errorData.error?.message || errorData.message || raw.slice(0, 300) || "阶跃语音生成失败，请检查参数与 API Key。",
      requestId: response.headers.get("x-request-id") || errorData.request_id || null
    });
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  if (!audioBuffer.length) return sendJson(res, 502, { error: "阶跃服务已响应，但没有返回音频内容。" });
  const responseMime = String(response.headers.get("content-type") || "").split(";")[0].trim();
  const audioMime = responseMime.startsWith("audio/") ? responseMime : audioMimeForFormat(responseFormat);
  const now = new Date().toISOString();
  const settings = {
    model: STEPFUN_MODEL,
    voiceId: voice[1],
    emotion,
    style,
    language,
    instruction,
    speed,
    volume,
    responseFormat,
    sampleRate,
    textNormalization,
    pronunciationRules,
    markdownFilter
  };
  const inserted = db.prepare(`
    INSERT INTO generations
      (text, audio_url, expires_at, voice_db_id, voice_name, mode, audio_data, audio_mime, settings_json, created_at)
    VALUES (?, '', NULL, NULL, ?, 'stepfun', ?, ?, ?, ?)
  `).run(text, voice[0], audioBuffer, audioMime, JSON.stringify(settings), now);
  const id = Number(inserted.lastInsertRowid);
  const audioUrl = `/api/generations/${id}/audio`;
  db.prepare("UPDATE generations SET audio_url = ? WHERE id = ?").run(audioUrl, id);
  return sendJson(res, 200, {
    generation: {
      id, text, audioUrl, downloadUrl: `${audioUrl}?download=1`, expiresAt: null,
      voiceId: voice[1], voiceName: voice[0], mode: "stepfun", settings, createdAt: now
    },
    requestId: response.headers.get("x-request-id") || null
  });
}

function serveGenerationAudio(req, res, id, asAttachment) {
  const row = db.prepare("SELECT audio_data, audio_mime, voice_name, mode, settings_json FROM generations WHERE id = ?").get(id);
  if (!row?.audio_data) return sendJson(res, 404, { error: "找不到这条本地音频。" });
  const audio = row.audio_data;
  const mime = row.audio_mime || "application/octet-stream";
  const settings = parseSettings(row.settings_json);
  const requestedExtension = settings.responseFormat || extensionForAudioMime(mime);
  const extension = requestedExtension === "ogg_opus" ? "opus" : requestedExtension;
  const defaultName = row.mode === "seed-audio" ? "seed-audio" : row.mode === "minimax" ? "minimax-tts" : "stepfun-tts";
  const filename = `${String(row.voice_name || defaultName).replace(/[\\/:*?"<>|]/g, "-")}.${extension}`;
  const headers = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=86400",
    "Content-Disposition": `${asAttachment ? "attachment" : "inline"}; filename="${defaultName}.${extension}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  };
  const range = String(req.headers.range || "");
  if (!range) {
    res.writeHead(200, { ...headers, "Content-Length": audio.length });
    return req.method === "HEAD" ? res.end() : res.end(audio);
  }
  const match = range.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) {
    res.writeHead(416, { "Content-Range": `bytes */${audio.length}` });
    return res.end();
  }
  const suffixLength = !match[1] && match[2] ? Number(match[2]) : null;
  const start = suffixLength !== null ? Math.max(audio.length - suffixLength, 0) : (match[1] ? Number(match[1]) : 0);
  const end = suffixLength !== null ? audio.length - 1 : (match[2] ? Math.min(Number(match[2]), audio.length - 1) : audio.length - 1);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > end || start >= audio.length) {
    res.writeHead(416, { "Content-Range": `bytes */${audio.length}` });
    return res.end();
  }
  const chunk = audio.subarray(start, end + 1);
  res.writeHead(206, { ...headers, "Content-Length": chunk.length, "Content-Range": `bytes ${start}-${end}/${audio.length}` });
  return req.method === "HEAD" ? res.end() : res.end(chunk);
}

function listGenerations(res, requestedMode) {
  const mode = ["instruct", "regular", "stepfun", "minimax", "seed-audio"].includes(requestedMode) ? requestedMode : null;
  const rows = mode === "instruct"
    ? db.prepare(`
      SELECT id, text, audio_url, expires_at, voice_db_id, voice_name, mode, settings_json,
        audio_data IS NOT NULL AS has_audio, created_at
      FROM generations WHERE mode = ? ORDER BY created_at DESC LIMIT 50
    `).all(mode)
    : mode === "stepfun"
      ? db.prepare(`
        SELECT id, text, audio_url, expires_at, voice_db_id, voice_name, mode, settings_json,
          audio_data IS NOT NULL AS has_audio, created_at
        FROM generations WHERE mode = ? ORDER BY created_at DESC LIMIT 50
      `).all(mode)
    : mode === "minimax"
      ? db.prepare(`
        SELECT id, text, audio_url, expires_at, voice_db_id, voice_name, mode, settings_json,
          audio_data IS NOT NULL AS has_audio, created_at
        FROM generations WHERE mode = ? ORDER BY created_at DESC LIMIT 50
      `).all(mode)
    : mode === "seed-audio"
      ? db.prepare(`
        SELECT id, text, audio_url, expires_at, voice_db_id, voice_name, mode, settings_json,
          audio_data IS NOT NULL AS has_audio, created_at
        FROM generations WHERE mode = ? ORDER BY created_at DESC LIMIT 50
      `).all(mode)
    : mode === "regular"
      ? db.prepare(`
        SELECT id, text, audio_url, expires_at, voice_db_id, voice_name, mode, settings_json,
          audio_data IS NOT NULL AS has_audio, created_at
        FROM generations WHERE mode IN ('vd', 'vc', 'official') ORDER BY created_at DESC LIMIT 50
      `).all()
      : db.prepare(`
        SELECT id, text, audio_url, expires_at, voice_db_id, voice_name, mode, settings_json,
          audio_data IS NOT NULL AS has_audio, created_at
        FROM generations ORDER BY created_at DESC LIMIT 50
      `).all();
  return sendJson(res, 200, { generations: rows.map(serializeGeneration) });
}

function clearGenerations(res, requestedMode) {
  if (requestedMode === "instruct") db.prepare("DELETE FROM generations WHERE mode = ?").run("instruct");
  else if (requestedMode === "stepfun") db.prepare("DELETE FROM generations WHERE mode = ?").run("stepfun");
  else if (requestedMode === "minimax") {
    db.prepare("DELETE FROM minimax_tasks WHERE status <> 'processing'").run();
    db.prepare("DELETE FROM generations WHERE mode = ?").run("minimax");
  }
  else if (requestedMode === "seed-audio") db.prepare("DELETE FROM generations WHERE mode = ?").run("seed-audio");
  else if (requestedMode === "regular") db.prepare("DELETE FROM generations WHERE mode IN ('vd', 'vc', 'official')").run();
  else db.exec("DELETE FROM generations");
  return sendJson(res, 200, { ok: true });
}

async function callCustomization(payload) {
  const response = await fetch(`${API_BASE}/services/audio/tts/customization`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.code) {
    console.error("DashScope customization error", response.status, data);
    return {
      error: data.message || "创建音色失败，请检查输入内容与 API Key。",
      status: response.status >= 500 ? 502 : 400,
      requestId: data.request_id || data.requestId
    };
  }
  return { data };
}

async function deleteVoice(res, id) {
  if (!hasApiKey(res)) return;
  const voice = db.prepare("SELECT id, voice_id, type, is_official FROM voices WHERE id = ?").get(id);
  if (!voice) return sendJson(res, 404, { error: "找不到这个音色。" });
  if (voice.is_official) return sendJson(res, 403, { error: "官方系统音色不能删除。" });

  const result = await callCustomization({
    model: voice.type === "vc" ? "qwen-voice-enrollment" : "qwen-voice-design",
    input: { action: "delete", voice: voice.voice_id }
  });
  if (result.error) return sendJson(res, result.status, { error: result.error, requestId: result.requestId });
  db.prepare("DELETE FROM voices WHERE id = ?").run(id);
  return sendJson(res, 200, { ok: true });
}

async function renameVoice(req, res, id) {
  const body = await readJson(req, 16 * 1024);
  const name = String(body.name || "").trim().slice(0, 40);
  if (!name) return sendJson(res, 400, { error: "请输入音色名称。" });
  const voice = db.prepare(`
    SELECT id, name, voice_id, model, type, prompt, source_filename, is_official,
      preview_audio IS NOT NULL AS has_preview, created_at
    FROM voices WHERE id = ?
  `).get(id);
  if (!voice) return sendJson(res, 404, { error: "找不到这个音色。" });
  if (voice.is_official) return sendJson(res, 403, { error: "官方系统音色不能改名。" });
  db.prepare("UPDATE voices SET name = ? WHERE id = ?").run(name, id);
  voice.name = name;
  return sendJson(res, 200, { voice: serializeVoice(voice) });
}

function serializeVoice(row) {
  return {
    id: row.id, name: row.name, voiceId: row.voice_id, model: row.model, type: row.type,
    prompt: row.prompt || null, sourceFilename: row.source_filename || null, isOfficial: Boolean(row.is_official),
    hasPreview: Boolean(row.has_preview), previewUrl: row.has_preview ? `/api/voices/${row.id}/preview` : null,
    createdAt: row.created_at
  };
}

function serializeGeneration(row) {
  const hasAudio = Boolean(row.has_audio);
  const audioUrl = hasAudio ? `/api/generations/${row.id}/audio` : row.audio_url;
  const settings = parseSettings(row.settings_json);
  return {
    id: row.id, text: row.text, audioUrl, downloadUrl: hasAudio ? `${audioUrl}?download=1` : row.audio_url,
    expiresAt: row.expires_at, voiceId: row.voice_db_id || settings.voiceId || null, voiceName: row.voice_name,
    mode: row.mode, settings, createdAt: row.created_at
  };
}

function parseSettings(value) {
  if (!value) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function hasApiKey(res) {
  if (process.env.DASHSCOPE_API_KEY) return true;
  sendJson(res, 503, { error: "尚未配置 DASHSCOPE_API_KEY，请先在服务端设置密钥。" });
  return false;
}

function hasStepfunApiKey(res) {
  if (process.env.STEPFUN_API_KEY) return true;
  sendJson(res, 503, { error: "尚未配置 STEPFUN_API_KEY，请先在服务端设置密钥。" });
  return false;
}

function hasMinimaxApiKey(res) {
  if (process.env.MINIMAX_API_KEY) return true;
  sendJson(res, 503, { error: "尚未配置 MINIMAX_API_KEY，请先在服务端设置密钥。" });
  return false;
}

function hasSeedAudioApiKey(res) {
  if (process.env.SEED_AUDIO_API_KEY) return true;
  sendJson(res, 503, { error: "尚未配置 SEED_AUDIO_API_KEY，请先在服务端设置密钥。" });
  return false;
}

function fallbackSeedAudioVoices() {
  return [
    { scene: "通用场景", name: "Vivi 2.0", voiceId: "zh_female_vv_uranus_bigtts", languages: "中文、日文、印尼语、墨西哥西班牙语；四川、陕西、东北方言" },
    { scene: "通用场景", name: "小何 2.0", voiceId: "zh_female_xiaohe_uranus_bigtts", languages: "中文" },
    { scene: "通用场景", name: "云舟 2.0", voiceId: "zh_male_m191_uranus_bigtts", languages: "中文" },
    { scene: "通用场景", name: "魅力苏菲 2.0", voiceId: "zh_female_sophie_uranus_bigtts", languages: "中文" },
    { scene: "有声阅读", name: "儿童绘本 2.0", voiceId: "zh_female_xiaoxue_uranus_bigtts", languages: "中文" },
    { scene: "有声阅读", name: "悬疑解说 2.0", voiceId: "zh_male_xuanyijieshuo_uranus_bigtts", languages: "中文" },
    { scene: "多语种", name: "Tim", voiceId: "en_male_tim_uranus_bigtts", languages: "美式英语" },
    { scene: "多语种", name: "Dacey", voiceId: "en_female_dacey_uranus_bigtts", languages: "美式英语" }
  ];
}

function seedAudioReferenceLabel(references) {
  if (references.length === 1 && references[0].speaker) return `音色 ${references[0].speaker}`;
  return `${references.length} 条音频参考`;
}

function seedAudioMime(format) {
  return ({ wav: "audio/wav", mp3: "audio/mpeg", pcm: "application/octet-stream", ogg_opus: "audio/ogg" })[format]
    || "application/octet-stream";
}

function normalizeStepfunBase(value) {
  const base = String(value || "").trim().replace(/\/+$/, "");
  return /\/v1$/i.test(base) ? base : `${base}/v1`;
}

function audioMimeForFormat(format) {
  return ({ wav: "audio/wav", mp3: "audio/mpeg", flac: "audio/flac", opus: "audio/ogg", pcm: "application/octet-stream" })[format]
    || "application/octet-stream";
}

function extensionForAudioMime(mime) {
  return ({ "audio/wav": "wav", "audio/x-wav": "wav", "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/flac": "flac", "audio/ogg": "opus", "audio/opus": "opus" })[mime]
    || "pcm";
}

function serveStatic(req, res) {
  const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const filePath = path.resolve(PUBLIC_DIR, relativePath);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== path.join(PUBLIC_DIR, "index.html")) {
    return sendJson(res, 403, { error: "禁止访问。" });
  }
  fs.readFile(filePath, (error, content) => {
    if (error) return sendJson(res, error.code === "ENOENT" ? 404 : 500, { error: error.code === "ENOENT" ? "页面不存在。" : "读取页面失败。" });
    res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream", "Cache-Control": "no-cache" });
    if (req.method === "HEAD") return res.end();
    res.end(content);
  });
}

function readJson(req, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    let settled = false;
    req.on("data", (chunk) => {
      if (settled) return;
      body += chunk;
      if (Buffer.byteLength(body) > maxBytes) {
        settled = true;
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (settled) return;
      try { resolve(JSON.parse(body || "{}")); } catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
}

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

setImmediate(() => {
  if (!process.env.MINIMAX_API_KEY) return;
  const pendingTasks = db.prepare("SELECT task_id FROM minimax_tasks WHERE status = 'processing'").all();
  for (const task of pendingTasks) runMinimaxTask(task.task_id);
});

server.listen(PORT, () => console.log(`Voice Studio running at http://localhost:${PORT}`));

module.exports = server;

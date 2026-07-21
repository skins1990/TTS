const voicePresets = [
  { id: "bright", name: "晴悦", note: "明亮清甜", prompt: "年轻女性声音，音色明亮清甜，中高音自然，吐字清晰，亲和力强。" },
  { id: "gentle", name: "柔知", note: "温柔知性", prompt: "30岁左右的知性女性声音，音色温润柔和，中音稳定，表达细腻耐听。" },
  { id: "clear", name: "清澈", note: "清脆少年感", prompt: "年轻中性声音，清澈干净，略带少年感，气息轻盈，发音自然。" },
  { id: "magnetic", name: "深磁", note: "低沉磁性", prompt: "中年男性声音，低音浑厚有磁性，共鸣充足，沉稳但不压抑。" },
  { id: "sunny", name: "朗川", note: "阳光男声", prompt: "青年男性声音，阳光自然，中音明朗，带有真诚笑意，听感轻松。" },
  { id: "broadcast", name: "正声", note: "标准播音", prompt: "专业播音员声音，中音饱满，字正腔圆，气息稳定，权威而不生硬。" },
  { id: "mature", name: "静雅", note: "成熟女声", prompt: "成熟的女性声音，音色圆润从容，语调平稳，带有可信赖的专业感。" },
  { id: "cute", name: "小桃", note: "可爱活泼", prompt: "年轻女孩声音，音调偏高，清脆活泼，略带俏皮感，但不过分幼态。" },
  { id: "elder", name: "岁叙", note: "长者叙事", prompt: "年长男性声音，略带岁月质感，低沉温和，节奏从容，适合讲述往事。" },
  { id: "cool", name: "冷月", note: "克制清冷", prompt: "年轻女性声音，音色清冷干净，情绪克制，语调平直中保留细微层次。" },
  { id: "soft", name: "眠语", note: "轻柔治愈", prompt: "轻柔治愈的中性声音，气声自然，音量偏轻，听感松弛，适合安静陪伴。" },
  { id: "character", name: "戏声", note: "戏剧角色", prompt: "富有戏剧表现力的青年声音，音色鲜明，情绪转换自然，具有角色塑造感。" }
];

const expressions = [
  { id: "natural", name: "自然讲述", prompt: "语速适中，停顿自然，像面对面交流。" },
  { id: "audiobook", name: "有声书", prompt: "叙述舒缓细腻，重音克制，句间留有呼吸感。" },
  { id: "documentary", name: "纪录片", prompt: "沉稳客观，语速偏慢，画面感强，收尾有余韵。" },
  { id: "news", name: "新闻播报", prompt: "节奏稳定，信息清楚，字正腔圆，表达可信。" },
  { id: "product", name: "产品种草", prompt: "语速偏快，语调轻快上扬，真诚热情，突出重点卖点。" },
  { id: "ad", name: "广告宣传", prompt: "有力量感和号召力，节奏紧凑，关键词清晰突出。" },
  { id: "podcast", name: "播客聊天", prompt: "松弛自然，略带口语感，像与熟悉的听众分享见闻。" },
  { id: "course", name: "课程讲解", prompt: "耐心清晰，语速稍慢，层次分明，便于理解和记忆。" },
  { id: "bedtime", name: "睡前故事", prompt: "音量轻柔，语速缓慢，情绪温暖，停顿舒展。" },
  { id: "drama", name: "短剧情绪", prompt: "情绪饱满，节奏有起伏，转折处停顿明显，具有戏剧张力。" },
  { id: "suspense", name: "悬疑解说", prompt: "语速偏慢，气氛神秘克制，关键信息前后保留停顿。" },
  { id: "healing", name: "治愈陪伴", prompt: "柔和有耐心，带有共情感，语气安定，不刻意煽情。" },
  { id: "energetic", name: "热血激昂", prompt: "语速较快，能量充沛，重音强烈，情绪逐步推高。" },
  { id: "assistant", name: "智能助手", prompt: "简洁友好，发音准确，语调自然，反馈感明确。" },
  { id: "custom", name: "自定义", prompt: "" }
];

const instructionPresets = [
  { id: "natural", name: "自然讲述", prompt: "语速适中，停顿自然，像面对面交流。" },
  { id: "audiobook", name: "有声书", prompt: "叙述舒缓细腻，重音克制，句间留有呼吸感。" },
  { id: "documentary", name: "纪录片", prompt: "沉稳客观，语速偏慢，画面感强，收尾有余韵。" },
  { id: "news", name: "新闻播报", prompt: "节奏稳定，吐字清晰，字正腔圆，表达可信。" },
  { id: "product", name: "产品介绍", prompt: "语速偏快，语调轻快上扬，真诚热情，突出重点。" },
  { id: "ad", name: "广告宣传", prompt: "有力量感和号召力，节奏紧凑，关键词清晰突出。" },
  { id: "podcast", name: "播客聊天", prompt: "松弛自然，略带口语感，像与熟悉的听众分享见闻。" },
  { id: "bedtime", name: "睡前故事", prompt: "音量轻柔，语速缓慢，情绪温暖，停顿舒展。" },
  { id: "drama", name: "短剧情绪", prompt: "情绪饱满，节奏有起伏，转折处停顿明显，具有戏剧张力。" },
  { id: "healing", name: "治愈陪伴", prompt: "柔和有耐心，带有共情感，语气安定，不刻意煽情。" },
  { id: "custom", name: "自定义", prompt: "" }
];

const stepEmotionOptions = ["自动", "高兴", "非常高兴", "悲伤", "生气", "非常生气", "撒娇", "恐惧", "惊讶", "兴奋", "钦佩", "困惑"];
const stepStyleOptions = ["自动", "慢速", "极慢", "快速", "极快", "冷漠", "尴尬", "沮丧", "骄傲", "温柔", "甜美", "豪爽", "严肃", "傲慢", "老年", "吼叫", "阴阳怪气", "磕巴"];
const stepLanguageOptions = ["自动", "中文", "英文", "中英混合", "日语"];
const minimaxLanguageOptions = [
  ["auto", "自动识别"], ["Chinese", "中文"], ["Chinese,Yue", "粤语"], ["English", "英语"],
  ["Arabic", "阿拉伯语"], ["Russian", "俄语"], ["Spanish", "西班牙语"], ["French", "法语"],
  ["Portuguese", "葡萄牙语"], ["German", "德语"], ["Turkish", "土耳其语"], ["Dutch", "荷兰语"],
  ["Ukrainian", "乌克兰语"], ["Vietnamese", "越南语"], ["Indonesian", "印尼语"], ["Japanese", "日语"],
  ["Italian", "意大利语"], ["Korean", "韩语"], ["Thai", "泰语"], ["Polish", "波兰语"],
  ["Romanian", "罗马尼亚语"], ["Greek", "希腊语"], ["Czech", "捷克语"], ["Finnish", "芬兰语"],
  ["Hindi", "印地语"], ["Bulgarian", "保加利亚语"], ["Danish", "丹麦语"], ["Hebrew", "希伯来语"],
  ["Malay", "马来语"], ["Persian", "波斯语"], ["Slovak", "斯洛伐克语"], ["Swedish", "瑞典语"],
  ["Croatian", "克罗地亚语"], ["Filipino", "菲律宾语"], ["Hungarian", "匈牙利语"], ["Norwegian", "挪威语"],
  ["Slovenian", "斯洛文尼亚语"], ["Catalan", "加泰罗尼亚语"], ["Nynorsk", "尼诺斯克语"], ["Tamil", "泰米尔语"],
  ["Afrikaans", "阿非利卡语"]
];

const elements = {
  generateView: document.querySelector("#generateView"), instructView: document.querySelector("#instructView"), stepView: document.querySelector("#stepView"), minimaxView: document.querySelector("#minimaxView"), seedAudioView: document.querySelector("#seedAudioView"), voicesView: document.querySelector("#voicesView"),
  generateForm: document.querySelector("#generateForm"), designForm: document.querySelector("#designForm"),
  text: document.querySelector("#scriptText"), charCount: document.querySelector("#charCount"),
  modelBadge: document.querySelector("#modelBadge"), savedVoice: document.querySelector("#savedVoice"), noVoice: document.querySelector("#noVoice"), selectedVoice: document.querySelector("#selectedVoice"),
  generateButton: document.querySelector("#generateButton"), generateLabel: document.querySelector("#generateLabel"), generateMessage: document.querySelector("#generateMessage"),
  resultPanel: document.querySelector("#resultPanel"), audioPlayer: document.querySelector("#audioPlayer"), resultMeta: document.querySelector("#resultMeta"), download: document.querySelector("#downloadButton"),
  instructForm: document.querySelector("#instructForm"), instructText: document.querySelector("#instructText"), instructCharCount: document.querySelector("#instructCharCount"), instructVoice: document.querySelector("#instructVoice"), instructVoiceDescription: document.querySelector("#instructVoiceDescription"), instructInstructions: document.querySelector("#instructInstructions"), optimizeInstructions: document.querySelector("#optimizeInstructions"), instructButton: document.querySelector("#instructButton"), instructLabel: document.querySelector("#instructLabel"), instructMessage: document.querySelector("#instructMessage"), instructResultPanel: document.querySelector("#instructResultPanel"), instructAudioPlayer: document.querySelector("#instructAudioPlayer"), instructResultMeta: document.querySelector("#instructResultMeta"), instructDownload: document.querySelector("#instructDownloadButton"), instructHistoryList: document.querySelector("#instructHistoryList"), instructHistoryEmpty: document.querySelector("#instructHistoryEmpty"), clearInstructHistory: document.querySelector("#clearInstructHistory"),
  stepForm: document.querySelector("#stepForm"), stepText: document.querySelector("#stepText"), stepCharCount: document.querySelector("#stepCharCount"), stepVoice: document.querySelector("#stepVoice"), stepVoiceDetail: document.querySelector("#stepVoiceDetail"), stepEmotion: document.querySelector("#stepEmotion"), stepStyle: document.querySelector("#stepStyle"), stepLanguage: document.querySelector("#stepLanguage"), stepInstruction: document.querySelector("#stepInstruction"), stepSpeed: document.querySelector("#stepSpeed"), stepSpeedValue: document.querySelector("#stepSpeedValue"), stepVolume: document.querySelector("#stepVolume"), stepVolumeValue: document.querySelector("#stepVolumeValue"), stepFormat: document.querySelector("#stepFormat"), stepSampleRate: document.querySelector("#stepSampleRate"), stepNormalization: document.querySelector("#stepNormalization"), stepPronunciation: document.querySelector("#stepPronunciation"), stepMarkdownFilter: document.querySelector("#stepMarkdownFilter"), stepButton: document.querySelector("#stepButton"), stepLabel: document.querySelector("#stepLabel"), stepMessage: document.querySelector("#stepMessage"), stepResultPanel: document.querySelector("#stepResultPanel"), stepAudioPlayer: document.querySelector("#stepAudioPlayer"), stepResultMeta: document.querySelector("#stepResultMeta"), stepDownload: document.querySelector("#stepDownloadButton"), stepHistoryList: document.querySelector("#stepHistoryList"), stepHistoryEmpty: document.querySelector("#stepHistoryEmpty"), clearStepHistory: document.querySelector("#clearStepHistory"),
  minimaxForm: document.querySelector("#minimaxForm"), minimaxSourceInputs: document.querySelectorAll('input[name="minimaxSource"]'), minimaxTextPanel: document.querySelector("#minimaxTextPanel"), minimaxFilePanel: document.querySelector("#minimaxFilePanel"), minimaxText: document.querySelector("#minimaxText"), minimaxCharCount: document.querySelector("#minimaxCharCount"), minimaxFile: document.querySelector("#minimaxFile"), minimaxUploadZone: document.querySelector("#minimaxUploadZone"), minimaxFilePreview: document.querySelector("#minimaxFilePreview"), minimaxVoiceSearch: document.querySelector("#minimaxVoiceSearch"), minimaxVoice: document.querySelector("#minimaxVoice"), minimaxVoiceDetail: document.querySelector("#minimaxVoiceDetail"),
  minimaxSpeed: document.querySelector("#minimaxSpeed"), minimaxSpeedValue: document.querySelector("#minimaxSpeedValue"), minimaxVolume: document.querySelector("#minimaxVolume"), minimaxVolumeValue: document.querySelector("#minimaxVolumeValue"), minimaxPitch: document.querySelector("#minimaxPitch"), minimaxPitchValue: document.querySelector("#minimaxPitchValue"), minimaxEmotion: document.querySelector("#minimaxEmotion"), minimaxLanguage: document.querySelector("#minimaxLanguage"), minimaxFormat: document.querySelector("#minimaxFormat"), minimaxSampleRate: document.querySelector("#minimaxSampleRate"), minimaxBitrate: document.querySelector("#minimaxBitrate"), minimaxChannel: document.querySelector("#minimaxChannel"), minimaxPronunciation: document.querySelector("#minimaxPronunciation"), minimaxEnglishNormalization: document.querySelector("#minimaxEnglishNormalization"), minimaxWatermark: document.querySelector("#minimaxWatermark"),
  minimaxModifyFieldset: document.querySelector("#minimaxModifyFieldset"), minimaxModifyPitch: document.querySelector("#minimaxModifyPitch"), minimaxModifyPitchValue: document.querySelector("#minimaxModifyPitchValue"), minimaxModifyIntensity: document.querySelector("#minimaxModifyIntensity"), minimaxModifyIntensityValue: document.querySelector("#minimaxModifyIntensityValue"), minimaxModifyTimbre: document.querySelector("#minimaxModifyTimbre"), minimaxModifyTimbreValue: document.querySelector("#minimaxModifyTimbreValue"), minimaxSoundEffect: document.querySelector("#minimaxSoundEffect"), minimaxButton: document.querySelector("#minimaxButton"), minimaxLabel: document.querySelector("#minimaxLabel"), minimaxMessage: document.querySelector("#minimaxMessage"), minimaxResultPanel: document.querySelector("#minimaxResultPanel"), minimaxAudioPlayer: document.querySelector("#minimaxAudioPlayer"), minimaxResultMeta: document.querySelector("#minimaxResultMeta"), minimaxDownload: document.querySelector("#minimaxDownloadButton"), minimaxHistoryList: document.querySelector("#minimaxHistoryList"), minimaxHistoryEmpty: document.querySelector("#minimaxHistoryEmpty"), clearMinimaxHistory: document.querySelector("#clearMinimaxHistory"),
  voiceName: document.querySelector("#voiceName"), voicePrompt: document.querySelector("#voicePrompt"), previewText: document.querySelector("#previewText"),
  customExpressionField: document.querySelector("#customExpressionField"), customExpression: document.querySelector("#customExpression"),
  designButton: document.querySelector("#designButton"), designLabel: document.querySelector("#designLabel"), designMessage: document.querySelector("#designMessage"),
  cloneForm: document.querySelector("#cloneForm"), cloneVoiceName: document.querySelector("#cloneVoiceName"), cloneAudioFile: document.querySelector("#cloneAudioFile"), cloneUploadZone: document.querySelector("#cloneUploadZone"), cloneFilePreview: document.querySelector("#cloneFilePreview"), cloneButton: document.querySelector("#cloneButton"), cloneLabel: document.querySelector("#cloneLabel"), cloneMessage: document.querySelector("#cloneMessage"),
  voiceList: document.querySelector("#voiceList"), voiceEmpty: document.querySelector("#voiceEmpty"), historyList: document.querySelector("#historyList"), historyEmpty: document.querySelector("#historyEmpty")
};

let voices = [];
let instructVoices = [];
let stepVoices = [];
let minimaxVoices = [];
let generations = [];
let instructGenerations = [];
let stepGenerations = [];
let minimaxGenerations = [];
let cloneFile = null;
let minimaxFile = null;
let basePrompt = voicePresets[0].prompt;
let previewAudio = null;
let previewButton = null;

renderPresetControls();
renderInstructionControls();
renderStepControls();
renderMinimaxControls();
composePrompt();
bindEvents();
initialize();

async function initialize() {
  const initialView = location.hash.slice(1);
  if (["generate", "instruct", "step", "minimax", "seed-audio", "voices"].includes(initialView)) showView(initialView);
  await Promise.all([checkConnection(), loadVoices(), loadInstructVoices(), loadStepVoices(), loadMinimaxVoices(), loadGenerations()]);
}

function bindEvents() {
  document.querySelectorAll(".nav-tab").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
  document.querySelectorAll("[data-open-voices]").forEach((button) => button.addEventListener("click", () => showView("voices")));
  document.querySelectorAll("[data-builder]").forEach((button) => button.addEventListener("click", () => showVoiceBuilder(button.dataset.builder)));
  document.querySelector("#fillExample").addEventListener("click", () => {
    elements.text.value = "傍晚的风穿过街角，带来一点栀子花的香气。忙碌了一天，也别忘了给自己留一段安静的时间。";
    updateCharCount(); elements.text.focus();
  });
  elements.text.addEventListener("input", updateCharCount);
  elements.instructText.addEventListener("input", updateInstructCharCount);
  elements.stepText.addEventListener("input", updateStepCharCount);
  elements.minimaxText.addEventListener("input", updateMinimaxCharCount);
  elements.savedVoice.addEventListener("change", renderSelectedVoice);
  elements.instructVoice.addEventListener("change", renderInstructVoiceSelection);
  elements.stepVoice.addEventListener("change", renderStepVoiceSelection);
  elements.stepStyle.addEventListener("change", syncStepStyleSpeed);
  elements.stepSpeed.addEventListener("input", updateStepRangeLabels);
  elements.stepVolume.addEventListener("input", updateStepRangeLabels);
  elements.minimaxSourceInputs.forEach((input) => input.addEventListener("change", syncMinimaxSource));
  elements.minimaxFile.addEventListener("change", () => setMinimaxFile(elements.minimaxFile.files[0] || null));
  document.querySelector("#removeMinimaxFile").addEventListener("click", () => setMinimaxFile(null));
  ["dragenter", "dragover"].forEach((name) => elements.minimaxUploadZone.addEventListener(name, (event) => { event.preventDefault(); elements.minimaxUploadZone.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((name) => elements.minimaxUploadZone.addEventListener(name, (event) => { event.preventDefault(); elements.minimaxUploadZone.classList.remove("dragging"); }));
  elements.minimaxUploadZone.addEventListener("drop", (event) => setMinimaxFile(event.dataTransfer.files[0] || null));
  elements.minimaxVoiceSearch.addEventListener("input", renderMinimaxVoices);
  elements.minimaxVoice.addEventListener("change", renderMinimaxVoiceSelection);
  elements.minimaxFormat.addEventListener("change", syncMinimaxFormat);
  [elements.minimaxSpeed, elements.minimaxVolume, elements.minimaxPitch, elements.minimaxModifyPitch, elements.minimaxModifyIntensity, elements.minimaxModifyTimbre]
    .forEach((input) => input.addEventListener("input", updateMinimaxRangeLabels));
  document.querySelector("#previewSelectedVoice").addEventListener("click", previewCurrentVoice);
  elements.cloneAudioFile.addEventListener("change", () => setCloneFile(elements.cloneAudioFile.files[0] || null));
  document.querySelector("#removeCloneFile").addEventListener("click", () => setCloneFile(null));
  ["dragenter", "dragover"].forEach((name) => elements.cloneUploadZone.addEventListener(name, (event) => { event.preventDefault(); elements.cloneUploadZone.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((name) => elements.cloneUploadZone.addEventListener(name, (event) => { event.preventDefault(); elements.cloneUploadZone.classList.remove("dragging"); }));
  elements.cloneUploadZone.addEventListener("drop", (event) => setCloneFile(event.dataTransfer.files[0] || null));
  document.querySelector("#voicePresets").addEventListener("change", handlePresetChange);
  document.querySelector("#expressionPresets").addEventListener("change", handleExpressionChange);
  document.querySelector("#instructionPresets").addEventListener("change", handleInstructionPresetChange);
  elements.customExpression.addEventListener("input", composePrompt);
  elements.generateForm.addEventListener("submit", generateSpeech);
  elements.instructForm.addEventListener("submit", generateInstructSpeech);
  elements.stepForm.addEventListener("submit", generateStepfunSpeech);
  elements.minimaxForm.addEventListener("submit", generateMinimaxSpeech);
  elements.designForm.addEventListener("submit", designVoice);
  elements.cloneForm.addEventListener("submit", cloneVoice);
  elements.voiceList.addEventListener("click", handleVoiceAction);
  elements.voiceList.addEventListener("keydown", handleVoiceRenameKeydown);
  elements.historyList.addEventListener("click", handleHistoryAction);
  elements.instructHistoryList.addEventListener("click", handleInstructHistoryAction);
  elements.stepHistoryList.addEventListener("click", handleStepHistoryAction);
  elements.minimaxHistoryList.addEventListener("click", handleMinimaxHistoryAction);
  document.querySelector("#clearHistory").addEventListener("click", clearHistory);
  elements.clearInstructHistory.addEventListener("click", clearInstructHistory);
  elements.clearStepHistory.addEventListener("click", clearStepHistory);
  elements.clearMinimaxHistory.addEventListener("click", clearMinimaxHistory);
  elements.audioPlayer.addEventListener("play", stopPreview);
  elements.instructAudioPlayer.addEventListener("play", stopPreview);
  elements.stepAudioPlayer.addEventListener("play", stopPreview);
  elements.minimaxAudioPlayer.addEventListener("play", stopPreview);
}

function renderPresetControls() {
  const voiceGrid = document.querySelector("#voicePresets");
  voicePresets.forEach((item, index) => {
    const label = document.createElement("label"); label.className = "preset-option";
    label.innerHTML = `<input type="radio" name="voiceBase" value="${item.id}" ${index === 0 ? "checked" : ""}><span><b>${item.name}</b><small>${item.note}</small></span>`;
    voiceGrid.append(label);
  });
  const expressionGrid = document.querySelector("#expressionPresets");
  expressions.forEach((item, index) => {
    const label = document.createElement("label"); label.title = item.prompt || "输入自己的表达描述";
    label.innerHTML = `<input type="radio" name="expression" value="${item.id}" ${index === 0 ? "checked" : ""}><span>${item.name}</span>`;
    expressionGrid.append(label);
  });
}

function renderInstructionControls() {
  const grid = document.querySelector("#instructionPresets");
  instructionPresets.forEach((item, index) => {
    const label = document.createElement("label"); label.title = item.prompt || "输入自己的表达描述";
    label.innerHTML = `<input type="radio" name="instructionPreset" value="${item.id}" ${index === 0 ? "checked" : ""}><span>${item.name}</span>`;
    grid.append(label);
  });
  elements.instructInstructions.value = instructionPresets[0].prompt;
}

function renderStepControls() {
  fillSelect(elements.stepEmotion, stepEmotionOptions);
  fillSelect(elements.stepStyle, stepStyleOptions);
  fillSelect(elements.stepLanguage, stepLanguageOptions);
  updateStepRangeLabels();
}

function renderMinimaxControls() {
  elements.minimaxLanguage.textContent = "";
  minimaxLanguageOptions.forEach(([value, label]) => {
    const option = document.createElement("option"); option.value = value; option.textContent = value === "auto" ? `${label} · 跟随文案` : label; elements.minimaxLanguage.append(option);
  });
  elements.minimaxLanguage.value = "auto";
  syncMinimaxFormat();
  updateMinimaxRangeLabels();
}

function fillSelect(select, values) {
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value === "自动" ? "自动 · 跟随文案" : value;
    select.append(option);
  }
}

function showView(view) {
  const generateActive = view === "generate";
  const instructActive = view === "instruct";
  const stepActive = view === "step";
  const minimaxActive = view === "minimax";
  const seedAudioActive = view === "seed-audio";
  const voicesActive = view === "voices";
  elements.generateView.hidden = !generateActive;
  elements.instructView.hidden = !instructActive;
  elements.stepView.hidden = !stepActive;
  elements.minimaxView.hidden = !minimaxActive;
  elements.seedAudioView.hidden = !seedAudioActive;
  elements.voicesView.hidden = !voicesActive;
  document.querySelectorAll(".nav-tab").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showVoiceBuilder(builder) {
  const designActive = builder === "design";
  elements.designForm.hidden = !designActive;
  elements.cloneForm.hidden = designActive;
  document.querySelectorAll("[data-builder]").forEach((button) => {
    const active = button.dataset.builder === builder;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function handlePresetChange(event) {
  if (event.target.name !== "voiceBase") return;
  const preset = voicePresets.find((item) => item.id === event.target.value);
  basePrompt = preset.prompt;
  if (!elements.voiceName.value.trim()) elements.voiceName.value = preset.name;
  composePrompt();
}

function handleExpressionChange(event) {
  if (event.target.name !== "expression") return;
  const custom = event.target.value === "custom";
  elements.customExpressionField.hidden = !custom;
  composePrompt();
  if (custom) elements.customExpression.focus();
}

function handleInstructionPresetChange(event) {
  if (event.target.name !== "instructionPreset") return;
  const preset = instructionPresets.find((item) => item.id === event.target.value);
  elements.instructInstructions.value = preset?.prompt || "";
  if (event.target.value === "custom") elements.instructInstructions.focus();
}

function composePrompt() {
  const expressionId = document.querySelector('input[name="expression"]:checked')?.value || "natural";
  const expression = expressions.find((item) => item.id === expressionId) || expressions[0];
  const expressionText = expression.id === "custom" ? elements.customExpression.value.trim() : expression.prompt;
  elements.voicePrompt.value = `${basePrompt} ${expressionText}`.trim();
}

async function designVoice(event) {
  event.preventDefault();
  const name = elements.voiceName.value.trim();
  const voicePrompt = elements.voicePrompt.value.trim();
  if (!name) return showMessage(elements.designMessage, "请给音色起一个名字。", true);
  if (!voicePrompt) return showMessage(elements.designMessage, "请填写完整声音描述。", true);
  setBusy(elements.designButton, elements.designLabel, true, "正在设计并保存…");
  showMessage(elements.designMessage, "", false);
  try {
    const result = await api("/api/voices/design", {
      method: "POST", body: JSON.stringify({ name, voicePrompt, previewText: elements.previewText.value.trim() })
    });
    voices.unshift(result.voice);
    renderVoices();
    elements.savedVoice.value = String(result.voice.id);
    renderSelectedVoice();
    elements.voiceName.value = "";
    showMessage(elements.designMessage, `“${result.voice.name}”已保存到 SQLite 音色库。`, false);
  } catch (error) {
    showMessage(elements.designMessage, error.message, true);
  } finally {
    setBusy(elements.designButton, elements.designLabel, false);
  }
}

async function cloneVoice(event) {
  event.preventDefault();
  const name = elements.cloneVoiceName.value.trim();
  if (!name) return showMessage(elements.cloneMessage, "请给复刻音色起一个名字。", true);
  if (!cloneFile) return showMessage(elements.cloneMessage, "请先上传参考音频。", true);
  setBusy(elements.cloneButton, elements.cloneLabel, true, "正在复刻并保存…");
  showMessage(elements.cloneMessage, "", false);
  try {
    const result = await api("/api/voices/clone", {
      method: "POST", body: JSON.stringify({ name, audioData: await readFile(cloneFile), filename: cloneFile.name })
    });
    voices = voices.filter((voice) => voice.id !== result.voice.id);
    voices.unshift(result.voice);
    renderVoices();
    elements.savedVoice.value = String(result.voice.id);
    renderSelectedVoice();
    elements.cloneVoiceName.value = "";
    setCloneFile(null);
    showMessage(elements.cloneMessage, result.reused ? `“${result.voice.name}”已在音色库中，直接复用。` : `“${result.voice.name}”已保存到 SQLite 音色库。`, false);
  } catch (error) {
    showMessage(elements.cloneMessage, error.message, true);
  } finally {
    setBusy(elements.cloneButton, elements.cloneLabel, false);
  }
}

async function generateSpeech(event) {
  event.preventDefault();
  const text = elements.text.value.trim();
  if (!text) { showMessage(elements.generateMessage, "请先输入要生成的文字。", true); return elements.text.focus(); }
  const voiceId = Number(elements.savedVoice.value);
  if (!voiceId) { showMessage(elements.generateMessage, "请先在音色库创建或选择一个音色。", true); return; }
  setBusy(elements.generateButton, elements.generateLabel, true, "正在生成语音…");
  showMessage(elements.generateMessage, "", false);
  try {
    const result = await api("/api/generate", { method: "POST", body: JSON.stringify({ text, voiceId }) });
    generations.unshift(result.generation);
    renderGenerations();
    showResult(result.generation, false);
  } catch (error) {
    showMessage(elements.generateMessage, error.message, true);
  } finally {
    setBusy(elements.generateButton, elements.generateLabel, false);
  }
}

async function generateInstructSpeech(event) {
  event.preventDefault();
  const text = elements.instructText.value.trim();
  const voiceId = elements.instructVoice.value;
  const instructions = elements.instructInstructions.value.trim();
  if (!text) { showMessage(elements.instructMessage, "请先输入要生成的文字。", true); return elements.instructText.focus(); }
  if (!voiceId) { showMessage(elements.instructMessage, "请选择一个官方音色。", true); return; }
  if (!instructions) { showMessage(elements.instructMessage, "请填写语气指令。", true); return elements.instructInstructions.focus(); }
  setBusy(elements.instructButton, elements.instructLabel, true, "正在控制语气并生成…");
  showMessage(elements.instructMessage, "", false);
  try {
    const result = await api("/api/generate-instruct", {
      method: "POST",
      body: JSON.stringify({ text, voiceId, instructions, optimizeInstructions: elements.optimizeInstructions.checked })
    });
    instructGenerations.unshift(result.generation);
    renderInstructGenerations();
    showInstructResult(result.generation, false);
  } catch (error) {
    showMessage(elements.instructMessage, error.message, true);
  } finally {
    setBusy(elements.instructButton, elements.instructLabel, false);
  }
}

async function generateStepfunSpeech(event) {
  event.preventDefault();
  const text = elements.stepText.value.trim();
  const voiceId = elements.stepVoice.value;
  const pronunciationRules = elements.stepPronunciation.value.split(/\r?\n/).map((rule) => rule.trim()).filter(Boolean);
  if (!text) { showMessage(elements.stepMessage, "请先输入要生成的文字。", true); return elements.stepText.focus(); }
  if (!voiceId) { showMessage(elements.stepMessage, "请选择一个阶跃官方音色。", true); return; }
  const invalidRule = pronunciationRules.find((rule) => !rule.includes("/"));
  if (invalidRule) { showMessage(elements.stepMessage, `发音映射“${invalidRule}”缺少 / 分隔符。`, true); return elements.stepPronunciation.focus(); }

  const payload = {
    text,
    voiceId,
    emotion: elements.stepEmotion.value,
    style: elements.stepStyle.value,
    language: elements.stepLanguage.value,
    instruction: elements.stepInstruction.value.trim(),
    speed: Number(elements.stepSpeed.value),
    volume: Number(elements.stepVolume.value),
    responseFormat: elements.stepFormat.value,
    sampleRate: Number(elements.stepSampleRate.value),
    textNormalization: elements.stepNormalization.value,
    pronunciationRules,
    markdownFilter: elements.stepMarkdownFilter.checked
  };
  setBusy(elements.stepButton, elements.stepLabel, true, "正在精细演绎并生成…");
  showMessage(elements.stepMessage, "", false);
  try {
    const result = await api("/api/generate-step", { method: "POST", body: JSON.stringify(payload) });
    stepGenerations.unshift(result.generation);
    renderStepGenerations();
    showStepResult(result.generation, false);
  } catch (error) {
    showMessage(elements.stepMessage, error.message, true);
  } finally {
    setBusy(elements.stepButton, elements.stepLabel, false);
  }
}

async function generateMinimaxSpeech(event) {
  event.preventDefault();
  const source = document.querySelector('input[name="minimaxSource"]:checked')?.value || "text";
  const text = elements.minimaxText.value.trim();
  const voiceId = elements.minimaxVoice.value;
  const pronunciationRules = MiniMaxUI.parsePronunciationRules(elements.minimaxPronunciation.value);
  if (source === "text" && !text) { showMessage(elements.minimaxMessage, "请先输入要生成的文字。", true); return elements.minimaxText.focus(); }
  if (source === "file" && !minimaxFile) { showMessage(elements.minimaxMessage, "请先上传 TXT 或 ZIP 文本文件。", true); return; }
  if (!voiceId) { showMessage(elements.minimaxMessage, "请选择一个 MiniMax 官方音色。", true); return; }
  const invalidRule = pronunciationRules.find((rule) => !rule.includes("/") || rule.length > 120);
  if (pronunciationRules.length > 50 || invalidRule) {
    showMessage(elements.minimaxMessage, invalidRule ? `发音规则“${invalidRule}”格式不正确。` : "发音规则最多填写 50 条。", true);
    return elements.minimaxPronunciation.focus();
  }
  if (!MiniMaxUI.formatCapabilities(elements.minimaxFormat.value).voiceModifyEnabled && (
    Number(elements.minimaxModifyPitch.value) || Number(elements.minimaxModifyIntensity.value) || Number(elements.minimaxModifyTimbre.value) || elements.minimaxSoundEffect.value
  )) {
    showMessage(elements.minimaxMessage, "当前音频格式不支持声音效果器，请先切换为 MP3、WAV 或 FLAC。", true);
    return;
  }

  setBusy(elements.minimaxButton, elements.minimaxLabel, true, "正在创建异步任务…");
  showMessage(elements.minimaxMessage, source === "file" ? "正在读取并上传文本文件…" : "正在提交 MiniMax 任务…", false);
  try {
    const payload = {
      text: source === "text" ? text : "",
      file: source === "file" ? { name: minimaxFile.name, type: minimaxFile.type, dataUrl: await readFileAsDataUrl(minimaxFile) } : null,
      voiceId,
      languageBoost: elements.minimaxLanguage.value,
      speed: Number(elements.minimaxSpeed.value),
      volume: Number(elements.minimaxVolume.value),
      pitch: Number(elements.minimaxPitch.value),
      emotion: elements.minimaxEmotion.value,
      englishNormalization: elements.minimaxEnglishNormalization.checked,
      pronunciationRules,
      format: elements.minimaxFormat.value,
      sampleRate: Number(elements.minimaxSampleRate.value),
      bitrate: Number(elements.minimaxBitrate.value),
      channel: Number(elements.minimaxChannel.value),
      modifyPitch: Number(elements.minimaxModifyPitch.value),
      modifyIntensity: Number(elements.minimaxModifyIntensity.value),
      modifyTimbre: Number(elements.minimaxModifyTimbre.value),
      soundEffect: elements.minimaxSoundEffect.value,
      aigcWatermark: elements.minimaxWatermark.checked
    };
    const result = await api("/api/minimax/generations", { method: "POST", body: JSON.stringify(payload) });
    showMessage(elements.minimaxMessage, "任务已提交，等待 MiniMax 合成…", false);
    const generation = await pollMinimaxTask(result.task.taskId);
    minimaxGenerations = [generation, ...minimaxGenerations.filter((item) => item.id !== generation.id)];
    renderMinimaxGenerations();
    showMinimaxResult(generation, false);
    showMessage(elements.minimaxMessage, "语音已生成并保存到本机历史。", false);
  } catch (error) {
    showMessage(elements.minimaxMessage, error.message, true);
  } finally {
    setBusy(elements.minimaxButton, elements.minimaxLabel, false);
  }
}

async function pollMinimaxTask(taskId) {
  while (true) {
    const result = await api(`/api/minimax/tasks/${encodeURIComponent(taskId)}`);
    showMessage(elements.minimaxMessage, MiniMaxUI.statusMessage(result.task), result.task.status === "failed" || result.task.status === "expired");
    if (result.task.status === "success" && result.task.generation) return result.task.generation;
    if (result.task.status === "failed" || result.task.status === "expired") throw new Error(result.task.error || "MiniMax 语音任务未完成。");
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
}

async function loadVoices() {
  try { voices = (await api("/api/voices")).voices; renderVoices(); } catch (error) { showMessage(elements.generateMessage, error.message, true); }
}

async function loadInstructVoices() {
  try { instructVoices = (await api("/api/instruct-voices")).voices; renderInstructVoices(); } catch (error) { showMessage(elements.instructMessage, error.message, true); }
}

async function loadStepVoices() {
  try { stepVoices = (await api("/api/step-voices")).voices; renderStepVoices(); } catch (error) { showMessage(elements.stepMessage, error.message, true); }
}

async function loadMinimaxVoices() {
  try { minimaxVoices = (await api("/api/minimax/voices")).voices; renderMinimaxVoices(); } catch (error) { showMessage(elements.minimaxMessage, error.message, true); }
}

async function loadGenerations() {
  try {
    const [regular, instruct, stepfun, minimax] = await Promise.all([
      api("/api/generations?mode=regular"),
      api("/api/generations?mode=instruct"),
      api("/api/generations?mode=stepfun"),
      api("/api/generations?mode=minimax")
    ]);
    generations = regular.generations;
    instructGenerations = instruct.generations;
    stepGenerations = stepfun.generations;
    minimaxGenerations = minimax.generations;
    renderGenerations();
    renderInstructGenerations();
    renderStepGenerations();
    renderMinimaxGenerations();
  } catch (error) {
    showMessage(elements.generateMessage, error.message, true);
    showMessage(elements.instructMessage, error.message, true);
    showMessage(elements.stepMessage, error.message, true);
    showMessage(elements.minimaxMessage, error.message, true);
  }
}

function renderVoices() {
  const selectedVoiceId = elements.savedVoice.value;
  const officialVoices = voices.filter((voice) => voice.isOfficial);
  const designedVoices = voices.filter((voice) => !voice.isOfficial && voice.type === "vd");
  const clonedVoices = voices.filter((voice) => !voice.isOfficial && voice.type === "vc");
  document.querySelector("#voiceCount").textContent = voices.length;
  document.querySelector("#libraryCount").textContent = `${designedVoices.length} 个 VD · ${clonedVoices.length} 个 VC · ${officialVoices.length} 个官方`;
  elements.voiceEmpty.hidden = voices.length > 0;
  elements.voiceList.textContent = "";
  elements.savedVoice.textContent = "";

  for (const group of [
    { name: "我的 VD 设计音色", items: designedVoices },
    { name: "我的 VC 复刻音色", items: clonedVoices },
    { name: "官方系统音色（普通生成）", items: officialVoices }
  ]) {
    if (!group.items.length) continue;
    const optionGroup = document.createElement("optgroup"); optionGroup.label = group.name;
    for (const voice of group.items) {
      const description = getVoiceOptionDescription(voice);
      const option = document.createElement("option"); option.value = voice.id; option.textContent = `${voice.name} · ${description}`; option.title = description; optionGroup.append(option);
    }
    elements.savedVoice.append(optionGroup);
    const heading = document.createElement("div"); heading.className = "voice-group-heading"; heading.textContent = `${group.name} · ${group.items.length}`; elements.voiceList.append(heading);
    for (const voice of group.items) renderVoiceRow(voice);
  }
  if (voices.some((voice) => String(voice.id) === selectedVoiceId)) elements.savedVoice.value = selectedVoiceId;
  elements.savedVoice.hidden = voices.length === 0;
  elements.noVoice.hidden = voices.length > 0;
  renderSelectedVoice();
}

function renderInstructVoices() {
  elements.instructVoice.textContent = "";
  const group = document.createElement("optgroup"); group.label = "Qwen3 Instruct 官方音色";
  for (const voice of instructVoices) {
    const option = document.createElement("option"); option.value = voice.voiceId; option.textContent = `${voice.name} · ${voice.description}`; option.title = voice.description; group.append(option);
  }
  elements.instructVoice.append(group);
  if (instructVoices.length) elements.instructVoice.value = instructVoices[0].voiceId;
  renderInstructVoiceSelection();
}

function renderStepVoices() {
  const selected = elements.stepVoice.value;
  elements.stepVoice.textContent = "";
  const group = document.createElement("optgroup");
  group.label = "StepAudio 2.5 官方音色";
  for (const voice of stepVoices) {
    const option = document.createElement("option");
    option.value = voice.voiceId;
    option.textContent = `${voice.name} · ${voice.description}`;
    option.title = `${voice.description}；适合：${voice.scene}`;
    group.append(option);
  }
  elements.stepVoice.append(group);
  elements.stepVoice.value = stepVoices.some((voice) => voice.voiceId === selected) ? selected : (stepVoices[0]?.voiceId || "");
  renderStepVoiceSelection();
}

function renderMinimaxVoices() {
  const selected = elements.minimaxVoice.value;
  const query = elements.minimaxVoiceSearch.value.trim().toLowerCase();
  const filtered = minimaxVoices.filter((voice) => !query || `${voice.name} ${voice.description} ${voice.voiceId}`.toLowerCase().includes(query));
  document.querySelector("#minimaxVoiceCount").textContent = minimaxVoices.length;
  elements.minimaxVoice.textContent = "";
  if (!filtered.length) {
    const option = document.createElement("option"); option.value = ""; option.textContent = query ? "没有匹配的官方音色" : "暂无可用官方音色"; elements.minimaxVoice.append(option);
    return renderMinimaxVoiceSelection();
  }
  const group = document.createElement("optgroup");
  group.label = query ? `匹配 ${filtered.length} / ${minimaxVoices.length}` : `MiniMax 官方音色 · ${minimaxVoices.length}`;
  for (const voice of filtered) {
    const option = document.createElement("option");
    option.value = voice.voiceId;
    option.textContent = `${voice.name} · ${voice.description || voice.voiceId}`;
    option.title = `${voice.description || "官方系统音色"} · ${voice.voiceId}`;
    group.append(option);
  }
  elements.minimaxVoice.append(group);
  elements.minimaxVoice.value = filtered.some((voice) => voice.voiceId === selected) ? selected : filtered[0].voiceId;
  renderMinimaxVoiceSelection();
}

function getVoiceOptionDescription(voice) {
  const description = voice.prompt
    || (voice.type === "vc" ? `VC 复刻 · 参考音频：${voice.sourceFilename || "已保存音色"}` : "自定义设计音色");
  const compact = description.replace(/\s+/g, " ").trim();
  return compact.length > 52 ? `${compact.slice(0, 52)}…` : compact;
}

function renderVoiceRow(voice) {
    const item = document.createElement("article"); item.className = "voice-item";
    item.innerHTML = `<span class="voice-symbol">声</span><div class="voice-main"><strong class="voice-name-display"></strong><div class="voice-name-edit" hidden><input class="voice-name-editor" maxlength="40" aria-label="新的音色名称"><button type="button" data-action="save-rename" data-id="${voice.id}" aria-label="保存名称" title="保存">✓</button><button type="button" data-action="cancel-rename" data-id="${voice.id}" aria-label="取消改名" title="取消">×</button></div><span class="voice-name-error" role="alert" aria-live="polite"></span><p></p><small></small></div><div class="voice-actions"></div>`;
    item.querySelector("strong").textContent = voice.name;
    item.querySelector("p").textContent = voice.prompt || (voice.type === "vc" ? `参考音频：${voice.sourceFilename || "已保存复刻音色"}` : "自定义设计音色");
    item.querySelector("small").textContent = voice.isOfficial
      ? "官方系统音色 · Qwen3 TTS Flash"
      : `保存于 ${formatTime(voice.createdAt)} · ${voice.type === "vc" ? "Qwen3 VC" : "Qwen3 VD"}`;
    const actions = item.querySelector(".voice-actions");
    if (voice.hasPreview) actions.append(makeButton("试听", "preview-voice", voice.id));
    const use = makeButton("用于生成", "use-voice", voice.id); use.className = "primary-link"; actions.append(use);
    if (!voice.isOfficial) {
      actions.append(makeButton("重命名", "rename-voice", voice.id));
      actions.append(makeButton("删除", "delete-voice", voice.id));
    }
    elements.voiceList.append(item);
}

function renderSelectedVoice() {
  const voice = voices.find((item) => item.id === Number(elements.savedVoice.value));
  elements.selectedVoice.hidden = !voice;
  if (!voice) return;
  document.querySelector("#selectedVoiceName").textContent = voice.name;
  document.querySelector("#selectedVoicePrompt").textContent = voice.isOfficial
    ? "官方系统音色 · Qwen3 TTS Flash"
    : `${voice.type === "vc" ? "VC 复刻音色" : "VD 设计音色"} · ${voice.prompt || voice.sourceFilename || "自定义音色"}`;
  document.querySelector("#previewSelectedVoice").hidden = !voice.hasPreview;
  elements.modelBadge.textContent = voice.isOfficial ? "Qwen3 Flash" : voice.type === "vc" ? "Qwen3 VC" : "Qwen3 VD";
}

function renderInstructVoiceSelection() {
  const voice = instructVoices.find((item) => item.voiceId === elements.instructVoice.value);
  elements.instructVoiceDescription.textContent = voice ? `${voice.name} · ${voice.description}` : "";
}

function renderStepVoiceSelection() {
  const voice = stepVoices.find((item) => item.voiceId === elements.stepVoice.value);
  elements.stepVoiceDetail.textContent = "";
  if (!voice) return;
  const description = document.createElement("b");
  description.textContent = voice.description;
  const scene = document.createElement("span");
  scene.textContent = `适合：${voice.scene}`;
  elements.stepVoiceDetail.append(description, scene);
}

function renderMinimaxVoiceSelection() {
  const voice = minimaxVoices.find((item) => item.voiceId === elements.minimaxVoice.value);
  elements.minimaxVoiceDetail.textContent = "";
  if (!voice) return;
  const name = document.createElement("b"); name.textContent = voice.name;
  const description = document.createElement("span"); description.textContent = voice.description || "MiniMax 官方系统音色";
  const voiceId = document.createElement("span"); voiceId.className = "voice-id"; voiceId.textContent = `Voice ID：${voice.voiceId}`;
  elements.minimaxVoiceDetail.append(name, description, voiceId);
}

function renderGenerations() {
  elements.historyList.textContent = "";
  elements.historyEmpty.hidden = generations.length > 0;
  document.querySelector("#clearHistory").hidden = generations.length === 0;
  for (const item of generations) {
    const row = document.createElement("article"); row.className = "history-item";
    row.innerHTML = `<div class="history-copy"><p></p><small></small></div><div class="history-actions"></div>`;
    row.querySelector("p").textContent = item.text;
    row.querySelector("small").textContent = `${formatTime(item.createdAt)} · ${item.voiceName} · ${modeLabel(item.mode)}`;
    const actions = row.querySelector(".history-actions");
    const play = makeButton("播放", "play-history", item.id); actions.append(play);
    const download = document.createElement("a"); download.href = item.audioUrl; download.target = "_blank"; download.rel = "noopener"; download.textContent = "下载"; actions.append(download);
    elements.historyList.append(row);
  }
}

function renderInstructGenerations() {
  elements.instructHistoryList.textContent = "";
  elements.instructHistoryEmpty.hidden = instructGenerations.length > 0;
  elements.clearInstructHistory.hidden = instructGenerations.length === 0;
  for (const item of instructGenerations) {
    const row = document.createElement("article"); row.className = "history-item";
    row.innerHTML = `<div class="history-copy"><p></p><small></small></div><div class="history-actions"></div>`;
    row.querySelector("p").textContent = item.text;
    row.querySelector("small").textContent = `${formatTime(item.createdAt)} · ${item.voiceName} · ${modeLabel(item.mode)}`;
    const actions = row.querySelector(".history-actions");
    actions.append(makeButton("播放", "play-instruct-history", item.id));
    const download = document.createElement("a"); download.href = item.audioUrl; download.target = "_blank"; download.rel = "noopener"; download.textContent = "下载"; actions.append(download);
    elements.instructHistoryList.append(row);
  }
}

function renderStepGenerations() {
  elements.stepHistoryList.textContent = "";
  elements.stepHistoryEmpty.hidden = stepGenerations.length > 0;
  elements.clearStepHistory.hidden = stepGenerations.length === 0;
  for (const item of stepGenerations) {
    const settings = item.settings || {};
    const performance = [settings.emotion, settings.style].filter((value) => value && value !== "自动").join(" / ") || "自然演绎";
    const row = document.createElement("article");
    row.className = "history-item";
    row.innerHTML = `<div class="history-copy"><p></p><small></small></div><div class="history-actions"></div>`;
    row.querySelector("p").textContent = item.text;
    row.querySelector("small").textContent = `${formatTime(item.createdAt)} · ${item.voiceName} · ${performance} · ${(settings.responseFormat || "mp3").toUpperCase()} · ${Number(settings.speed || 1).toFixed(2)}×`;
    const actions = row.querySelector(".history-actions");
    actions.append(makeButton("播放", "play-step-history", item.id));
    const download = document.createElement("a");
    download.href = item.downloadUrl || `${item.audioUrl}?download=1`;
    download.textContent = "下载";
    actions.append(download);
    elements.stepHistoryList.append(row);
  }
}

function renderMinimaxGenerations() {
  elements.minimaxHistoryList.textContent = "";
  elements.minimaxHistoryEmpty.hidden = minimaxGenerations.length > 0;
  elements.clearMinimaxHistory.hidden = minimaxGenerations.length === 0;
  for (const item of minimaxGenerations) {
    const settings = item.settings || {};
    const format = settings.responseFormat || "mp3";
    const row = document.createElement("article");
    row.className = "history-item";
    row.innerHTML = `<div class="history-copy"><p></p><small></small></div><div class="history-actions"></div>`;
    row.querySelector("p").textContent = item.text;
    row.querySelector("small").textContent = `${formatTime(item.createdAt)} · ${item.voiceName} · ${format.toUpperCase()} · ${Number(settings.speed || 1).toFixed(2)}× · ${settings.inputType === "file" ? "文件输入" : "文本输入"}`;
    const actions = row.querySelector(".history-actions");
    if (MiniMaxUI.isPlayableFormat(format)) actions.append(makeButton("播放", "play-minimax-history", item.id));
    const download = document.createElement("a"); download.href = item.downloadUrl || `${item.audioUrl}?download=1`; download.textContent = "下载"; actions.append(download);
    elements.minimaxHistoryList.append(row);
  }
}

async function handleVoiceAction(event) {
  const button = event.target.closest("button[data-action]"); if (!button) return;
  const voice = voices.find((item) => item.id === Number(button.dataset.id)); if (!voice) return;
  if (button.dataset.action === "preview-voice") playPreview(voice.previewUrl, button);
  if (button.dataset.action === "use-voice") { elements.savedVoice.value = String(voice.id); renderSelectedVoice(); showView("generate"); }
  if (button.dataset.action === "rename-voice") {
    openVoiceNameEditor(button.closest(".voice-item"), voice);
    return;
  }
  if (button.dataset.action === "cancel-rename") {
    closeVoiceNameEditor(button.closest(".voice-item"));
    return;
  }
  if (button.dataset.action === "save-rename") {
    await saveVoiceName(button.closest(".voice-item"), voice, button);
    return;
  }
  if (button.dataset.action === "delete-voice") {
    if (!window.confirm(`确定删除“${voice.name}”吗？阿里云和本地 SQLite 中的音色都会被删除。`)) return;
    button.disabled = true; button.textContent = "删除中…";
    try { await api(`/api/voices/${voice.id}`, { method: "DELETE" }); voices = voices.filter((item) => item.id !== voice.id); renderVoices(); }
    catch (error) { button.disabled = false; button.textContent = "删除"; window.alert(error.message); }
  }
}

function openVoiceNameEditor(row, voice) {
  row.classList.add("renaming");
  row.querySelector(".voice-name-display").hidden = true;
  row.querySelector(".voice-name-edit").hidden = false;
  row.querySelector(".voice-actions").hidden = true;
  const input = row.querySelector(".voice-name-editor");
  input.value = voice.name;
  input.removeAttribute("aria-invalid");
  row.querySelector(".voice-name-error").textContent = "";
  input.focus();
  input.select();
}

function closeVoiceNameEditor(row) {
  row.classList.remove("renaming");
  row.querySelector(".voice-name-display").hidden = false;
  row.querySelector(".voice-name-edit").hidden = true;
  row.querySelector(".voice-actions").hidden = false;
  row.querySelector(".voice-name-error").textContent = "";
}

async function saveVoiceName(row, voice, button) {
  const input = row.querySelector(".voice-name-editor");
  const error = row.querySelector(".voice-name-error");
  const name = input.value.trim();
  if (!name) {
    input.setAttribute("aria-invalid", "true");
    error.textContent = "名称不能为空";
    input.focus();
    return;
  }
  if (name === voice.name) return closeVoiceNameEditor(row);

  input.removeAttribute("aria-invalid");
  error.textContent = "";
  const buttons = row.querySelectorAll(".voice-name-edit button");
  buttons.forEach((item) => { item.disabled = true; });
  button.textContent = "…";
  try {
    const result = await api(`/api/voices/${voice.id}`, { method: "PATCH", body: JSON.stringify({ name }) });
    voices = voices.map((item) => item.id === voice.id ? result.voice : item);
    renderVoices();
  } catch (requestError) {
    buttons.forEach((item) => { item.disabled = false; });
    button.textContent = "✓";
    error.textContent = requestError.message;
    input.focus();
  }
}

function handleVoiceRenameKeydown(event) {
  const input = event.target.closest(".voice-name-editor");
  if (!input) return;
  const row = input.closest(".voice-item");
  if (event.key === "Enter") {
    event.preventDefault();
    row.querySelector('[data-action="save-rename"]').click();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    row.querySelector('[data-action="cancel-rename"]').click();
  }
}

function handleHistoryAction(event) {
  const button = event.target.closest('button[data-action="play-history"]'); if (!button) return;
  const item = generations.find((entry) => entry.id === Number(button.dataset.id)); if (item) showResult(item, true);
}

function handleInstructHistoryAction(event) {
  const button = event.target.closest('button[data-action="play-instruct-history"]'); if (!button) return;
  const item = instructGenerations.find((entry) => entry.id === Number(button.dataset.id)); if (item) showInstructResult(item, true);
}

function handleStepHistoryAction(event) {
  const button = event.target.closest('button[data-action="play-step-history"]');
  if (!button) return;
  const item = stepGenerations.find((entry) => entry.id === Number(button.dataset.id));
  if (item) showStepResult(item, true);
}

function handleMinimaxHistoryAction(event) {
  const button = event.target.closest('button[data-action="play-minimax-history"]');
  if (!button) return;
  const item = minimaxGenerations.find((entry) => entry.id === Number(button.dataset.id));
  if (item) showMinimaxResult(item, true);
}

function previewCurrentVoice() {
  const voice = voices.find((item) => item.id === Number(elements.savedVoice.value));
  if (voice?.previewUrl) playPreview(voice.previewUrl, document.querySelector("#previewSelectedVoice"));
}

function showResult(item, autoplay) {
  elements.audioPlayer.src = item.audioUrl; elements.download.href = item.audioUrl;
  elements.resultMeta.textContent = `${item.voiceName} · ${modeLabel(item.mode)}`;
  elements.resultPanel.hidden = false; elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (autoplay) elements.audioPlayer.play().catch(() => {});
}

function showInstructResult(item, autoplay) {
  elements.instructAudioPlayer.src = item.audioUrl; elements.instructDownload.href = item.audioUrl;
  elements.instructResultMeta.textContent = `${item.voiceName} · ${modeLabel(item.mode)}`;
  elements.instructResultPanel.hidden = false; elements.instructResultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (autoplay) elements.instructAudioPlayer.play().catch(() => {});
}

function showStepResult(item, autoplay) {
  const settings = item.settings || {};
  const controls = [settings.emotion, settings.style].filter((value) => value && value !== "自动").join(" / ") || "自然演绎";
  elements.stepAudioPlayer.src = item.audioUrl;
  elements.stepDownload.href = item.downloadUrl || `${item.audioUrl}?download=1`;
  elements.stepResultMeta.textContent = `${item.voiceName} · ${controls} · ${Number(settings.speed || 1).toFixed(2)}× · ${(settings.responseFormat || "mp3").toUpperCase()}`;
  elements.stepResultPanel.hidden = false;
  elements.stepResultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (autoplay) elements.stepAudioPlayer.play().catch(() => {});
}

function showMinimaxResult(item, autoplay) {
  const settings = item.settings || {};
  const format = settings.responseFormat || "mp3";
  const playable = MiniMaxUI.isPlayableFormat(format);
  elements.minimaxAudioPlayer.hidden = !playable;
  elements.minimaxResultPanel.classList.toggle("download-only", !playable);
  if (playable) elements.minimaxAudioPlayer.src = item.audioUrl;
  else elements.minimaxAudioPlayer.removeAttribute("src");
  elements.minimaxDownload.href = item.downloadUrl || `${item.audioUrl}?download=1`;
  elements.minimaxResultMeta.textContent = `${item.voiceName} · ${format.toUpperCase()} · ${Number(settings.speed || 1).toFixed(2)}×${playable ? "" : " · 此格式仅支持下载"}`;
  elements.minimaxResultPanel.hidden = false;
  elements.minimaxResultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (autoplay && playable) elements.minimaxAudioPlayer.play().catch(() => {});
}

async function clearHistory() {
  try { await api("/api/generations?mode=regular", { method: "DELETE" }); generations = []; renderGenerations(); } catch (error) { showMessage(elements.generateMessage, error.message, true); }
}

async function clearInstructHistory() {
  try { await api("/api/generations?mode=instruct", { method: "DELETE" }); instructGenerations = []; renderInstructGenerations(); } catch (error) { showMessage(elements.instructMessage, error.message, true); }
}

async function clearStepHistory() {
  try { await api("/api/generations?mode=stepfun", { method: "DELETE" }); stepGenerations = []; renderStepGenerations(); } catch (error) { showMessage(elements.stepMessage, error.message, true); }
}

async function clearMinimaxHistory() {
  try { await api("/api/generations?mode=minimax", { method: "DELETE" }); minimaxGenerations = []; renderMinimaxGenerations(); } catch (error) { showMessage(elements.minimaxMessage, error.message, true); }
}

function playPreview(url, button) {
  if (previewAudio && previewAudio.src === new URL(url, location.href).href && !previewAudio.paused) {
    previewAudio.pause(); resetPreviewButton(); return;
  }
  stopPreview();
  elements.audioPlayer.pause();
  elements.instructAudioPlayer.pause();
  elements.stepAudioPlayer.pause();
  elements.minimaxAudioPlayer.pause();
  document.querySelector("#seedAudioPlayer")?.pause();
  previewAudio = new Audio(url); previewButton = button; button.textContent = "暂停";
  previewAudio.addEventListener("ended", stopPreview, { once: true });
  previewAudio.play().catch(() => stopPreview());
}

function stopPreview() {
  if (previewAudio) { previewAudio.pause(); previewAudio.currentTime = 0; previewAudio = null; }
  resetPreviewButton();
}

function resetPreviewButton() {
  if (previewButton) previewButton.textContent = "试听";
  previewButton = null;
}

function modeLabel(mode) {
  return mode === "minimax" ? "MiniMax 2.8 HD" : mode === "stepfun" ? "StepAudio 2.5" : mode === "instruct" ? "官方音色 · Instruct" : mode === "official" ? "官方系统音色" : mode === "vd" ? "VD 设计音色" : "VC 复刻音色";
}

function setCloneFile(file) {
  if (file && !/\.(wav|mp3|m4a)$/i.test(file.name)) return showMessage(elements.cloneMessage, "参考音频仅支持 WAV、MP3 或 M4A。", true);
  if (file && file.size > 10 * 1024 * 1024) return showMessage(elements.cloneMessage, "参考音频不能超过 10 MB。", true);
  cloneFile = file; if (!file) elements.cloneAudioFile.value = "";
  elements.cloneUploadZone.hidden = Boolean(file); elements.cloneFilePreview.hidden = !file;
  if (file) { document.querySelector("#cloneFileName").textContent = file.name; document.querySelector("#cloneFileMeta").textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB · 等待复刻`; showMessage(elements.cloneMessage, "", false); }
}

function setMinimaxFile(file) {
  if (file && !/\.(txt|zip)$/i.test(file.name)) return showMessage(elements.minimaxMessage, "文本文件仅支持 TXT 或 ZIP。", true);
  if (file && file.size > 10 * 1024 * 1024) return showMessage(elements.minimaxMessage, "文本文件不能超过 10 MB。", true);
  minimaxFile = file;
  if (!file) elements.minimaxFile.value = "";
  elements.minimaxUploadZone.hidden = Boolean(file);
  elements.minimaxFilePreview.hidden = !file;
  if (file) {
    document.querySelector("#minimaxFileName").textContent = file.name;
    document.querySelector("#minimaxFileMeta").textContent = `${formatFileSize(file.size)} · 等待上传`;
    showMessage(elements.minimaxMessage, "", false);
  }
}

function syncMinimaxSource() {
  const source = document.querySelector('input[name="minimaxSource"]:checked')?.value || "text";
  elements.minimaxTextPanel.hidden = source !== "text";
  elements.minimaxFilePanel.hidden = source !== "file";
}

function syncMinimaxFormat() {
  const capabilities = MiniMaxUI.formatCapabilities(elements.minimaxFormat.value);
  const previousRate = Number(elements.minimaxSampleRate.value);
  elements.minimaxSampleRate.textContent = "";
  for (const rate of capabilities.sampleRates) {
    const option = document.createElement("option"); option.value = rate; option.textContent = `${rate.toLocaleString()} Hz`; elements.minimaxSampleRate.append(option);
  }
  const preferredRate = capabilities.sampleRates.includes(previousRate)
    ? previousRate
    : capabilities.sampleRates.includes(32000) ? 32000 : capabilities.sampleRates.includes(24000) ? 24000 : capabilities.sampleRates[0];
  elements.minimaxSampleRate.value = String(preferredRate);
  elements.minimaxBitrate.disabled = !capabilities.bitrateEnabled;
  elements.minimaxModifyFieldset.disabled = !capabilities.voiceModifyEnabled;
  if (!capabilities.voiceModifyEnabled) {
    elements.minimaxModifyPitch.value = "0";
    elements.minimaxModifyIntensity.value = "0";
    elements.minimaxModifyTimbre.value = "0";
    elements.minimaxSoundEffect.value = "";
  }
  updateMinimaxRangeLabels();
}

function setBusy(button, label, busy, text = "") {
  const defaultLabel = button === elements.designButton ? "设计并保存音色" : button === elements.cloneButton ? "复刻并保存音色" : button === elements.instructButton ? "控制语气并生成" : button === elements.stepButton ? "生成阶跃语音" : button === elements.minimaxButton ? "创建异步语音任务" : "生成语音";
  button.disabled = busy; button.classList.toggle("loading", busy); label.textContent = busy ? text : defaultLabel;
}
function showMessage(element, message, error) { element.textContent = message; element.style.color = error ? "var(--danger)" : "var(--success)"; }
function makeButton(text, action, id) { const button = document.createElement("button"); button.type = "button"; button.textContent = text; button.dataset.action = action; button.dataset.id = id; return button; }
function updateCharCount() { elements.charCount.textContent = `${elements.text.value.length.toLocaleString()} / 10,000`; }
function updateInstructCharCount() { elements.instructCharCount.textContent = `${elements.instructText.value.length.toLocaleString()} / 10,000`; }
function updateStepCharCount() { elements.stepCharCount.textContent = `${elements.stepText.value.length.toLocaleString()} / 1,000`; }
function updateMinimaxCharCount() { elements.minimaxCharCount.textContent = `${elements.minimaxText.value.length.toLocaleString()} / 50,000`; }
function updateStepRangeLabels() {
  elements.stepSpeedValue.textContent = `${Number(elements.stepSpeed.value).toFixed(2)}×`;
  elements.stepVolumeValue.textContent = `${Math.round(Number(elements.stepVolume.value) * 100)}%`;
}
function syncStepStyleSpeed() {
  const speedByStyle = { "慢速": 0.85, "极慢": 0.65, "快速": 1.25, "极快": 1.55 };
  if (speedByStyle[elements.stepStyle.value]) elements.stepSpeed.value = String(speedByStyle[elements.stepStyle.value]);
  updateStepRangeLabels();
}
function updateMinimaxRangeLabels() {
  elements.minimaxSpeedValue.textContent = `${Number(elements.minimaxSpeed.value).toFixed(2)}×`;
  elements.minimaxVolumeValue.textContent = Number(elements.minimaxVolume.value).toFixed(1);
  elements.minimaxPitchValue.textContent = elements.minimaxPitch.value;
  elements.minimaxModifyPitchValue.textContent = elements.minimaxModifyPitch.value;
  elements.minimaxModifyIntensityValue.textContent = elements.minimaxModifyIntensity.value;
  elements.minimaxModifyTimbreValue.textContent = elements.minimaxModifyTimbre.value;
}
function readFile(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("读取参考音频失败。")); reader.readAsDataURL(file); }); }
function readFileAsDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("读取文本文件失败。")); reader.readAsDataURL(file); }); }
function formatFileSize(bytes) { return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }
function formatTime(value) { return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const result = await response.json(); if (!response.ok) throw new Error(result.error || "请求失败，请稍后重试。"); return result;
}

async function checkConnection() {
  const status = document.querySelector("#connectionStatus");
  try {
    const result = await api("/api/status");
    status.className = `connection ${result.configured ? "ready" : "missing"}`;
    const missing = [!result.qwenConfigured && "Qwen", !result.stepfunConfigured && "阶跃", !result.minimaxConfigured && "MiniMax", !result.seedAudioConfigured && "Seed Audio"].filter(Boolean);
    status.querySelector("span:last-child").textContent = missing.length ? `${missing.join("、")}未配置` : "四项服务与 SQLite 已就绪";
  }
  catch { status.className = "connection missing"; status.querySelector("span:last-child").textContent = "服务连接失败"; }
}

(function () {
  const ui = window.SeedAudioUI;
  const elements = {
    form: document.querySelector("#seedAudioForm"),
    model: document.querySelector("#seedAudioModel"),
    modelDescription: document.querySelector("#seedAudioModelDescription"),
    modelBadge: document.querySelector("#seedAudioModelBadge"),
    modeInputs: document.querySelectorAll('input[name="seedReferenceMode"]'),
    text: document.querySelector("#seedAudioText"),
    charCount: document.querySelector("#seedAudioCharCount"),
    promptHint: document.querySelector("#seedAudioPromptHint"),
    audioPanel: document.querySelector("#seedAudioAudioPanel"),
    imagePanel: document.querySelector("#seedAudioImagePanel"),
    references: document.querySelector("#seedAudioReferences"),
    addReference: document.querySelector("#addSeedAudioReference"),
    imageFile: document.querySelector("#seedImageFile"),
    imageUploadZone: document.querySelector("#seedImageUploadZone"),
    imagePreview: document.querySelector("#seedImagePreview"),
    imageName: document.querySelector("#seedImageName"),
    imageMeta: document.querySelector("#seedImageMeta"),
    removeImage: document.querySelector("#removeSeedImage"),
    format: document.querySelector("#seedAudioFormat"),
    sampleRate: document.querySelector("#seedAudioSampleRate"),
    subtitle: document.querySelector("#seedAudioSubtitle"),
    speechRate: document.querySelector("#seedAudioSpeechRate"),
    speechRateValue: document.querySelector("#seedAudioSpeechRateValue"),
    loudnessRate: document.querySelector("#seedAudioLoudnessRate"),
    loudnessRateValue: document.querySelector("#seedAudioLoudnessRateValue"),
    pitchRate: document.querySelector("#seedAudioPitchRate"),
    pitchRateValue: document.querySelector("#seedAudioPitchRateValue"),
    aigcWatermark: document.querySelector("#seedAudioAigcWatermark"),
    metadataEnabled: document.querySelector("#seedAudioMetadataEnabled"),
    metadataFields: document.querySelector("#seedAudioMetadataFields"),
    contentProducer: document.querySelector("#seedAudioContentProducer"),
    produceId: document.querySelector("#seedAudioProduceId"),
    contentPropagator: document.querySelector("#seedAudioContentPropagator"),
    propagateId: document.querySelector("#seedAudioPropagateId"),
    button: document.querySelector("#seedAudioButton"),
    label: document.querySelector("#seedAudioLabel"),
    message: document.querySelector("#seedAudioMessage"),
    resultPanel: document.querySelector("#seedAudioResultPanel"),
    player: document.querySelector("#seedAudioPlayer"),
    resultMeta: document.querySelector("#seedAudioResultMeta"),
    download: document.querySelector("#seedAudioDownloadButton"),
    subtitleDownload: document.querySelector("#seedAudioSubtitleButton"),
    historyList: document.querySelector("#seedAudioHistoryList"),
    historyEmpty: document.querySelector("#seedAudioHistoryEmpty"),
    clearHistory: document.querySelector("#clearSeedAudioHistory")
  };

  let officialVoices = [];
  let audioReferences = [];
  let imageReference = null;
  let generations = [];
  let currentSubtitle = null;

  initialize();

  function initialize() {
    bindEvents();
    renderModel();
    updateMode();
    updateRangeLabels();
    updateCharCount();
    Promise.all([loadOfficialVoices(), loadHistory()]);
  }

  function bindEvents() {
    elements.model.addEventListener("change", renderModel);
    elements.modeInputs.forEach((input) => input.addEventListener("change", updateMode));
    elements.text.addEventListener("input", updateCharCount);
    elements.addReference.addEventListener("click", addAudioReference);
    elements.references.addEventListener("change", handleReferenceChange);
    elements.references.addEventListener("input", handleReferenceInput);
    elements.references.addEventListener("click", handleReferenceClick);
    elements.imageFile.addEventListener("change", () => setImageReference(elements.imageFile.files[0] || null));
    elements.removeImage.addEventListener("click", () => setImageReference(null));
    elements.metadataEnabled.addEventListener("change", () => { elements.metadataFields.disabled = !elements.metadataEnabled.checked; });
    [elements.speechRate, elements.loudnessRate, elements.pitchRate].forEach((input) => input.addEventListener("input", updateRangeLabels));
    elements.form.addEventListener("submit", generate);
    elements.clearHistory.addEventListener("click", clearHistory);
    elements.historyList.addEventListener("click", handleHistoryAction);
    elements.subtitleDownload.addEventListener("click", () => downloadSubtitle(currentSubtitle, "seed-audio-subtitle.vtt"));
    bindDropZone(elements.imageUploadZone, (file) => setImageReference(file));
  }

  function renderModel() {
    elements.modelDescription.textContent = ui.modelDescription(elements.model.value);
    elements.modelBadge.textContent = elements.model.value;
  }

  function updateMode() {
    const mode = selectedMode();
    const state = ui.referenceModeState(mode);
    elements.audioPanel.hidden = !state.audioEnabled;
    elements.imagePanel.hidden = !state.imageEnabled;
    elements.promptHint.textContent = mode === "audio"
      ? "可使用 @音频1、@音频2、@音频3 指定各参考资源"
      : mode === "image"
        ? "图片只作为音色与气质参考，不会发送图片 URL"
        : "无需参考资源，模型按文字描述生成";
    if (mode === "audio" && audioReferences.length === 0) addAudioReference();
  }

  function selectedMode() {
    return document.querySelector('input[name="seedReferenceMode"]:checked')?.value || "text";
  }

  async function loadOfficialVoices() {
    try {
      const result = await request("/api/seed-audio/voices");
      officialVoices = Array.isArray(result.voices) ? result.voices : [];
      normalizeOfficialSelections();
      renderAudioReferences();
      if (result.warning) showMessage(result.warning, false);
    } catch (error) {
      showMessage(error.message, true);
      renderAudioReferences();
    }
  }

  function addAudioReference() {
    if (audioReferences.length >= 3) return;
    const scenes = voiceScenes();
    const scene = scenes[0] || "";
    const voice = officialVoices.find((item) => item.scene === scene) || officialVoices[0];
    audioReferences.push({ source: "official", scene, voiceId: voice?.voiceId || "", customVoiceId: "", file: null, audioData: "", duration: null });
    renderAudioReferences();
  }

  function normalizeOfficialSelections() {
    const scenes = voiceScenes();
    for (const reference of audioReferences) {
      if (!scenes.includes(reference.scene)) reference.scene = scenes[0] || "";
      const candidates = officialVoices.filter((voice) => voice.scene === reference.scene);
      if (!candidates.some((voice) => voice.voiceId === reference.voiceId)) reference.voiceId = candidates[0]?.voiceId || "";
    }
  }

  function renderAudioReferences() {
    elements.references.textContent = "";
    audioReferences.forEach((reference, index) => elements.references.append(createReferenceElement(reference, index)));
    elements.addReference.disabled = audioReferences.length >= 3;
    elements.addReference.textContent = audioReferences.length >= 3 ? "已添加 3 条" : "＋ 添加参考音频";
  }

  function createReferenceElement(reference, index) {
    const article = document.createElement("article");
    article.className = `seed-reference-item seed-reference-tone-${index + 1}`;
    article.dataset.index = String(index);
    article.innerHTML = `
      <strong class="seed-reference-index">@音频${index + 1}</strong>
      <label class="seed-reference-cell seed-reference-source-cell"><span class="visually-hidden">参考来源</span><select data-reference-field="source"><option value="official">官方 2.0 音色</option><option value="custom">复刻 / 自定义 ID</option><option value="upload">上传本地音频</option></select></label>
      ${referenceFields(reference)}
      <button class="seed-reference-remove" type="button" data-reference-action="remove" title="移除第 ${index + 1} 条参考" aria-label="移除第 ${index + 1} 条参考">×</button>`;
    article.querySelector('[data-reference-field="source"]').value = reference.source;
    if (reference.source === "official") {
      fillSceneSelect(article.querySelector('[data-reference-field="scene"]'), reference.scene);
      fillVoiceSelect(article.querySelector('[data-reference-field="voice"]'), reference.scene, reference.voiceId);
      renderReferenceVoiceDescription(article, reference);
    } else if (reference.source === "custom") {
      article.querySelector('[data-reference-field="custom"]').value = reference.customVoiceId;
    } else {
      const picker = article.querySelector(".seed-reference-file-picker");
      const action = picker.querySelector(".seed-reference-file-action");
      const summary = picker.querySelector(".seed-reference-file-summary");
      if (reference.file) {
        picker.classList.add("has-file");
        action.textContent = "更换文件";
        summary.textContent = `${reference.file.name} · ${formatFileSize(reference.file.size)}${reference.duration ? ` · ${reference.duration.toFixed(1)} 秒` : ""}`;
      }
    }
    return article;
  }

  function referenceFields(reference) {
    if (reference.source === "official") {
      return `
        <label class="seed-reference-cell seed-reference-scene-cell"><span class="visually-hidden">使用场景</span><select data-reference-field="scene"></select></label>
        <label class="seed-reference-cell seed-reference-voice-cell"><span class="visually-hidden">官方音色</span><select data-reference-field="voice"></select><small class="seed-voice-description"></small></label>`;
    }
    if (reference.source === "custom") {
      return `<label class="seed-reference-cell seed-reference-wide-control seed-reference-custom-input"><span class="visually-hidden">音色 ID</span><input type="text" maxlength="300" data-reference-field="custom" placeholder="填写声音复刻或自定义音色 ID"></label>`;
    }
    return `<label class="seed-reference-cell seed-reference-wide-control seed-reference-file-picker"><input type="file" data-reference-field="file" accept="audio/wav,audio/x-wav,audio/mpeg,audio/ogg,audio/opus,.wav,.mp3,.pcm,.ogg,.opus"><span class="seed-reference-file-action">选择文件</span><span class="seed-reference-file-summary">WAV、MP3、PCM、OGG/Opus · 30 秒内 · 10 MB 内</span></label>`;
  }

  function fillSceneSelect(select, selected) {
    select.textContent = "";
    for (const scene of voiceScenes()) {
      const option = document.createElement("option");
      option.value = scene;
      option.textContent = `${scene}（${officialVoices.filter((voice) => voice.scene === scene).length}）`;
      select.append(option);
    }
    select.value = selected;
  }

  function fillVoiceSelect(select, scene, selected) {
    select.textContent = "";
    const voices = officialVoices.filter((voice) => voice.scene === scene);
    if (!voices.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = officialVoices.length ? "该场景暂无音色" : "正在加载官方音色…";
      select.append(option);
      return;
    }
    for (const voice of voices) {
      const option = document.createElement("option");
      option.value = voice.voiceId;
      option.textContent = `${voice.name} · ${voice.languages}`;
      select.append(option);
    }
    select.value = voices.some((voice) => voice.voiceId === selected) ? selected : voices[0].voiceId;
  }

  function renderReferenceVoiceDescription(article, reference) {
    const description = article.querySelector(".seed-voice-description");
    if (!description) return;
    const voice = officialVoices.find((item) => item.voiceId === reference.voiceId);
    description.textContent = voice ? `${voice.languages} · ${voice.voiceId}` : "官方音色目录加载后可选择。";
  }

  function voiceScenes() {
    return [...new Set(officialVoices.map((voice) => voice.scene))];
  }

  async function handleReferenceChange(event) {
    const article = event.target.closest(".seed-reference-item");
    if (!article) return;
    const index = Number(article.dataset.index);
    const reference = audioReferences[index];
    const field = event.target.dataset.referenceField;
    if (field === "source") {
      reference.source = event.target.value;
      renderAudioReferences();
    } else if (field === "scene") {
      reference.scene = event.target.value;
      reference.voiceId = officialVoices.find((voice) => voice.scene === reference.scene)?.voiceId || "";
      renderAudioReferences();
    } else if (field === "voice") {
      reference.voiceId = event.target.value;
      renderReferenceVoiceDescription(article, reference);
    } else if (field === "file") {
      await setAudioReferenceFile(index, event.target.files[0] || null);
    }
  }

  function handleReferenceInput(event) {
    const article = event.target.closest(".seed-reference-item");
    if (article && event.target.dataset.referenceField === "custom") {
      audioReferences[Number(article.dataset.index)].customVoiceId = event.target.value;
    }
  }

  function handleReferenceClick(event) {
    const button = event.target.closest("button[data-reference-action]");
    if (!button) return;
    const index = Number(button.closest(".seed-reference-item").dataset.index);
    if (button.dataset.referenceAction === "remove") audioReferences.splice(index, 1);
    renderAudioReferences();
  }

  async function setAudioReferenceFile(index, file) {
    if (!file) return;
    if (!/\.(wav|mp3|pcm|ogg|opus)$/i.test(file.name)) return showMessage("参考音频仅支持 WAV、MP3、PCM 或 OGG/Opus。", true);
    if (file.size > 10 * 1024 * 1024) return showMessage("每条参考音频不能超过 10 MB。", true);
    let duration = null;
    if (!/\.pcm$/i.test(file.name)) {
      try { duration = await inspectAudioDuration(file); } catch {}
      if (duration && duration > 30.05) return showMessage("每条参考音频最长支持 30 秒。", true);
    }
    try {
      audioReferences[index].file = file;
      audioReferences[index].audioData = await fileToBase64(file);
      audioReferences[index].duration = duration;
      renderAudioReferences();
      showMessage("", false);
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  async function setImageReference(file) {
    if (!file) {
      imageReference = null;
      elements.imageFile.value = "";
      elements.imageUploadZone.hidden = false;
      elements.imagePreview.hidden = true;
      return;
    }
    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) return showMessage("参考图片仅支持 JPEG、PNG 或 WebP。", true);
    if (file.size > 10 * 1024 * 1024) return showMessage("参考图片不能超过 10 MB。", true);
    try {
      imageReference = { file, imageData: await fileToBase64(file) };
      elements.imageName.textContent = file.name;
      elements.imageMeta.textContent = `${formatFileSize(file.size)} · Base64 上传`;
      elements.imageUploadZone.hidden = true;
      elements.imagePreview.hidden = false;
      showMessage("", false);
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  async function generate(event) {
    event.preventDefault();
    const textPrompt = elements.text.value.trim();
    if (!textPrompt) return showMessage("请填写待合成文本或生成提示词。", true);
    let references;
    try { references = buildReferences(); } catch (error) { return showMessage(error.message, true); }
    setBusy(true);
    showMessage("", false);
    try {
      const result = await request("/api/seed-audio/generations", {
        method: "POST",
        headers: { "X-Request-Id": makeRequestId() },
        body: JSON.stringify({
          model: elements.model.value,
          textPrompt,
          references,
          format: elements.format.value,
          sampleRate: Number(elements.sampleRate.value),
          speechRate: Number(elements.speechRate.value),
          loudnessRate: Number(elements.loudnessRate.value),
          pitchRate: Number(elements.pitchRate.value),
          enableSubtitle: elements.subtitle.checked,
          aigcWatermark: elements.aigcWatermark.checked,
          metadataEnabled: elements.metadataEnabled.checked,
          contentProducer: elements.contentProducer.value.trim(),
          produceId: elements.produceId.value.trim(),
          contentPropagator: elements.contentPropagator.value.trim(),
          propagateId: elements.propagateId.value.trim()
        })
      });
      generations.unshift(result.generation);
      renderHistory();
      showResult(result.generation, false);
      showMessage(`生成完成${result.logId ? ` · LogID ${result.logId}` : ""}`, false);
    } catch (error) {
      showMessage(error.message, true);
    } finally {
      setBusy(false);
    }
  }

  function buildReferences() {
    const mode = selectedMode();
    if (mode === "text") return [];
    if (mode === "image") {
      if (!imageReference) throw new Error("请上传一张参考图片。");
      return [{ kind: "image", filename: imageReference.file.name, imageData: imageReference.imageData }];
    }
    if (!audioReferences.length) throw new Error("请至少添加一条参考音频或音色 ID。");
    return audioReferences.map((reference, index) => {
      if (reference.source === "official") {
        if (!reference.voiceId) throw new Error(`请选择 @音频${index + 1} 的官方音色。`);
        return { kind: "audio", speaker: reference.voiceId };
      }
      if (reference.source === "custom") {
        const speaker = reference.customVoiceId.trim();
        if (!speaker) throw new Error(`请填写 @音频${index + 1} 的音色 ID。`);
        return { kind: "audio", speaker };
      }
      if (!reference.file || !reference.audioData) throw new Error(`请上传 @音频${index + 1} 的参考音频。`);
      return { kind: "audio", filename: reference.file.name, audioData: reference.audioData };
    });
  }

  async function loadHistory() {
    try {
      const result = await request("/api/generations?mode=seed-audio");
      generations = result.generations || [];
      renderHistory();
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  function renderHistory() {
    elements.historyList.textContent = "";
    elements.historyEmpty.hidden = generations.length > 0;
    elements.clearHistory.hidden = generations.length === 0;
    for (const generation of generations) {
      const settings = generation.settings || {};
      const row = document.createElement("article");
      row.className = "history-item";
      row.innerHTML = '<div class="history-copy"><p></p><small></small></div><div class="history-actions"></div>';
      row.querySelector("p").textContent = generation.text;
      const duration = settings.duration == null ? "" : ` · ${Number(settings.duration).toFixed(1)} 秒`;
      row.querySelector("small").textContent = `${formatTime(generation.createdAt)} · ${modelLabel(settings.model)} · ${referenceModeLabel(settings.referenceMode)} · ${(settings.responseFormat || "wav").toUpperCase()}${duration}`;
      const actions = row.querySelector(".history-actions");
      if (settings.responseFormat !== "pcm") actions.append(actionButton("播放", "play", generation.id));
      const download = document.createElement("a");
      download.href = generation.downloadUrl || `${generation.audioUrl}?download=1`;
      download.textContent = "下载";
      actions.append(download);
      if (settings.subtitle?.sentences?.length) actions.append(actionButton("字幕", "subtitle", generation.id));
      elements.historyList.append(row);
    }
  }

  function handleHistoryAction(event) {
    const button = event.target.closest("button[data-seed-action]");
    if (!button) return;
    const generation = generations.find((item) => item.id === Number(button.dataset.id));
    if (!generation) return;
    if (button.dataset.seedAction === "play") showResult(generation, true);
    if (button.dataset.seedAction === "subtitle") downloadSubtitle(generation.settings?.subtitle, `seed-audio-${generation.id}.vtt`);
  }

  function showResult(generation, autoplay) {
    const settings = generation.settings || {};
    const playable = settings.responseFormat !== "pcm";
    elements.player.hidden = !playable;
    elements.resultPanel.classList.toggle("download-only", !playable);
    if (playable) elements.player.src = generation.audioUrl;
    else elements.player.removeAttribute("src");
    elements.download.href = generation.downloadUrl || `${generation.audioUrl}?download=1`;
    currentSubtitle = settings.subtitle || null;
    elements.subtitleDownload.hidden = !currentSubtitle?.sentences?.length;
    const duration = settings.duration == null ? "" : ` · ${Number(settings.duration).toFixed(1)} 秒`;
    elements.resultMeta.textContent = `${modelLabel(settings.model)} · ${referenceModeLabel(settings.referenceMode)} · ${(settings.responseFormat || "wav").toUpperCase()}${duration}${playable ? "" : " · 此格式仅支持下载"}`;
    elements.resultPanel.hidden = false;
    elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (autoplay && playable) elements.player.play().catch(() => {});
  }

  async function clearHistory() {
    try {
      await request("/api/generations?mode=seed-audio", { method: "DELETE" });
      generations = [];
      renderHistory();
      elements.resultPanel.hidden = true;
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  function downloadSubtitle(subtitle, filename) {
    if (!subtitle?.sentences?.length) return;
    const blob = new Blob([ui.subtitleToVtt(subtitle)], { type: "text/vtt;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function actionButton(text, action, id) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.dataset.seedAction = action;
    button.dataset.id = String(id);
    return button;
  }

  function updateCharCount() {
    elements.charCount.textContent = `${elements.text.value.length.toLocaleString()} / 3,000`;
  }

  function updateRangeLabels() {
    elements.speechRateValue.textContent = signedValue(elements.speechRate.value);
    elements.loudnessRateValue.textContent = signedValue(elements.loudnessRate.value);
    elements.pitchRateValue.textContent = signedValue(elements.pitchRate.value);
  }

  function signedValue(value) {
    const number = Number(value);
    return number > 0 ? `+${number}` : String(number);
  }

  function setBusy(busy) {
    elements.button.disabled = busy;
    elements.button.classList.toggle("loading", busy);
    elements.label.textContent = busy ? "正在生成并保存…" : "生成 Seed Audio";
  }

  function showMessage(message, error) {
    elements.message.textContent = message;
    elements.message.style.color = error ? "var(--danger)" : "var(--success)";
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*;base64,/i, ""));
      reader.onerror = () => reject(new Error("读取参考文件失败。"));
      reader.readAsDataURL(file);
    });
  }

  function inspectAudioDuration(file) {
    return new Promise((resolve, reject) => {
      const audio = document.createElement("audio");
      const url = URL.createObjectURL(file);
      const cleanup = () => { URL.revokeObjectURL(url); audio.removeAttribute("src"); };
      audio.addEventListener("loadedmetadata", () => { const duration = audio.duration; cleanup(); Number.isFinite(duration) ? resolve(duration) : reject(new Error("无法读取音频时长。")); }, { once: true });
      audio.addEventListener("error", () => { cleanup(); reject(new Error("无法读取音频时长。")); }, { once: true });
      audio.src = url;
    });
  }

  function bindDropZone(zone, onFile) {
    ["dragenter", "dragover"].forEach((name) => zone.addEventListener(name, (event) => { event.preventDefault(); zone.classList.add("dragging"); }));
    ["dragleave", "drop"].forEach((name) => zone.addEventListener(name, (event) => { event.preventDefault(); zone.classList.remove("dragging"); }));
    zone.addEventListener("drop", (event) => onFile(event.dataTransfer.files[0] || null));
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "请求失败，请稍后重试。");
    return result;
  }

  function modelLabel(model) {
    return model === "seed-audio-1.0" ? "Seed Audio 1.0" : "Seed Audio 1.0 多语种";
  }

  function referenceModeLabel(mode) {
    return ({ text: "纯文本", audio: "音频参考", image: "图片参考" })[mode] || "纯文本";
  }

  function makeRequestId() {
    return window.crypto?.randomUUID?.() || `seed-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function formatFileSize(bytes) {
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  function formatTime(value) {
    return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  }
})();

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SeedAudioUI = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const descriptions = {
    "seed-audio-1.0-multilingual": "支持中文、英文、日语、韩语、墨西哥西班牙语、西班牙语、德语、法语、巴西葡萄牙语、泰语、越南语、马来语、菲律宾语、意大利语、俄语、荷兰语、波兰语和土耳其语，并支持时间轴控制。",
    "seed-audio-1.0": "支持中文、英语，适合基础双语生成。"
  };

  function modelDescription(model) {
    return descriptions[model] || "";
  }

  function referenceModeState(mode) {
    if (mode === "audio") return { audioEnabled: true, imageEnabled: false, maxAudio: 3 };
    if (mode === "image") return { audioEnabled: false, imageEnabled: true, maxAudio: 0 };
    return { audioEnabled: false, imageEnabled: false, maxAudio: 0 };
  }

  function subtitleToVtt(subtitle) {
    const sentences = Array.isArray(subtitle?.sentences) ? subtitle.sentences : [];
    const cues = sentences.map((sentence, index) => `${index + 1}\n${formatTimestamp(sentence.start_time)} --> ${formatTimestamp(sentence.end_time)}\n${sentence.text || ""}\n`);
    return `WEBVTT\n\n${cues.join("\n")}`;
  }

  function formatTimestamp(milliseconds) {
    const value = Math.max(0, Number(milliseconds) || 0);
    const hours = Math.floor(value / 3600000);
    const minutes = Math.floor((value % 3600000) / 60000);
    const seconds = Math.floor((value % 60000) / 1000);
    const millis = Math.floor(value % 1000);
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}`;
  }

  function pad(value, length) {
    return String(value).padStart(length, "0");
  }

  return { modelDescription, referenceModeState, subtitleToVtt };
});

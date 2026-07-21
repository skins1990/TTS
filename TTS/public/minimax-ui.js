(function attachMiniMaxUi(root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MiniMaxUI = factory();
})(typeof window === "object" ? window : globalThis, function createMiniMaxUi() {
  const sampleRates = [8000, 16000, 22050, 24000, 32000, 44100];
  const opusRates = [8000, 12000, 16000, 24000, 48000];

  function formatCapabilities(format) {
    const value = String(format || "mp3").toLowerCase();
    return {
      sampleRates: value === "opus" ? opusRates : value.startsWith("pcmu_") ? [8000] : sampleRates,
      bitrateEnabled: value === "mp3",
      voiceModifyEnabled: ["mp3", "wav", "flac"].includes(value)
    };
  }

  function parsePronunciationRules(value) {
    return String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }

  function isPlayableFormat(format) {
    return ["mp3", "wav", "flac", "opus", "pcmu_wav"].includes(String(format || "").toLowerCase());
  }

  function statusMessage(task) {
    if (task?.status === "failed" || task?.status === "expired") return task.error || "MiniMax 语音任务未完成。";
    if (task?.status === "success") return "MiniMax 音频已保存到本机历史。";
    return "MiniMax 正在合成长文本，页面可以保持打开。";
  }

  return { formatCapabilities, isPlayableFormat, parsePronunciationRules, statusMessage };
});

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  formatCapabilities,
  isPlayableFormat,
  parsePronunciationRules,
  statusMessage
} = require("../public/minimax-ui");

test("formatCapabilities exposes only compatible MiniMax output controls", () => {
  assert.deepEqual(formatCapabilities("opus"), {
    sampleRates: [8000, 12000, 16000, 24000, 48000],
    bitrateEnabled: false,
    voiceModifyEnabled: false
  });
  assert.deepEqual(formatCapabilities("pcmu_wav"), {
    sampleRates: [8000],
    bitrateEnabled: false,
    voiceModifyEnabled: false
  });
  assert.deepEqual(formatCapabilities("mp3"), {
    sampleRates: [8000, 16000, 22050, 24000, 32000, 44100],
    bitrateEnabled: true,
    voiceModifyEnabled: true
  });
});

test("parsePronunciationRules trims empty lines", () => {
  assert.deepEqual(parsePronunciationRules("草地/(cao3)(di1)\n\n MiniMax/mini max "), [
    "草地/(cao3)(di1)",
    "MiniMax/mini max"
  ]);
});

test("isPlayableFormat keeps raw audio download-only", () => {
  assert.equal(isPlayableFormat("mp3"), true);
  assert.equal(isPlayableFormat("pcmu_wav"), true);
  assert.equal(isPlayableFormat("pcm"), false);
  assert.equal(isPlayableFormat("pcmu_raw"), false);
});

test("statusMessage gives direct progress and failure copy", () => {
  assert.equal(statusMessage({ status: "processing" }), "MiniMax 正在合成长文本，页面可以保持打开。");
  assert.equal(statusMessage({ status: "failed", error: "余额不足" }), "余额不足");
});

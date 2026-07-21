const test = require("node:test");
const assert = require("node:assert/strict");

const {
  modelDescription,
  referenceModeState,
  subtitleToVtt
} = require("../public/seed-audio-ui");

test("modelDescription states language support beside each model", () => {
  assert.match(modelDescription("seed-audio-1.0-multilingual"), /中文、英文、日语、韩语/);
  assert.match(modelDescription("seed-audio-1.0-multilingual"), /时间轴/);
  assert.equal(modelDescription("seed-audio-1.0"), "支持中文、英语，适合基础双语生成。");
});

test("referenceModeState exposes only compatible Base64 upload controls", () => {
  assert.deepEqual(referenceModeState("text"), { audioEnabled: false, imageEnabled: false, maxAudio: 0 });
  assert.deepEqual(referenceModeState("audio"), { audioEnabled: true, imageEnabled: false, maxAudio: 3 });
  assert.deepEqual(referenceModeState("image"), { audioEnabled: false, imageEnabled: true, maxAudio: 0 });
});

test("subtitleToVtt exports returned sentence timestamps", () => {
  assert.equal(subtitleToVtt({ sentences: [{ start_time: 0, end_time: 1250, text: "你好，世界。" }] }),
    "WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.250\n你好，世界。\n");
});

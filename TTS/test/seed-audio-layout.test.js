const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

test("Seed Audio keeps writing on the left and compact linked settings on the right", () => {
  const html = fs.readFileSync(path.join(projectRoot, "public", "index.html"), "utf8");
  const script = fs.readFileSync(path.join(projectRoot, "public", "seed-audio-page.js"), "utf8");
  const styles = fs.readFileSync(path.join(projectRoot, "public", "styles.css"), "utf8");

  const editorStart = html.indexOf('class="editor-pane step-editor-pane seed-audio-editor-pane"');
  const settingsStart = html.indexOf('class="settings-pane step-settings seed-audio-settings"');
  const formEnd = html.indexOf("</form>", settingsStart);
  const editorMarkup = html.slice(editorStart, settingsStart);
  const settingsMarkup = html.slice(settingsStart, formEnd);

  assert.match(editorMarkup, /id="seedAudioText"/);
  assert.doesNotMatch(editorMarkup, /id="seedAudioModel"|name="seedReferenceMode"/);
  assert.match(settingsMarkup, /id="seedAudioModel"/);
  assert.match(settingsMarkup, /class="seed-mode-segment"/);

  assert.match(script, /seed-reference-tone-\$\{index \+ 1\}/);
  assert.match(script, /seed-reference-file-picker/);
  assert.doesNotMatch(script, /seed-audio-upload/);

  for (const tone of [1, 2, 3]) {
    assert.match(styles, new RegExp(`\\.seed-reference-tone-${tone}\\b`));
  }
});

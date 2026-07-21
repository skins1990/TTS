const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

test("Seed Audio route sends Base64 references and persists local history", { timeout: 15000 }, async (t) => {
  const audio = Buffer.from("RIFFseed-audio-wave");
  let upstreamRequest;
  const upstream = http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/api/v3/tts/create") {
      upstreamRequest = {
        headers: req.headers,
        body: await readJson(req)
      };
      return sendJson(res, {
        code: 0,
        message: "success",
        audio: audio.toString("base64"),
        duration: 1.2,
        original_duration: 1.4,
        url: "https://example.com/temporary.wav",
        subtitle: { text: "你好", sentences: [{ start_time: 0, end_time: 1200, text: "你好", words: [] }] }
      }, { "X-Tt-Logid": "seed-log-id" });
    }
    res.writeHead(404).end();
  });
  const upstreamUrl = await listen(upstream);
  t.after(() => upstream.close());

  const appPort = await availablePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "qwen-tts-seed-audio-"));
  const child = spawn(process.execPath, ["--no-warnings", "server.js"], {
    cwd: path.resolve(__dirname, ".."),
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(appPort),
      DATA_DIR: dataDir,
      DASHSCOPE_API_KEY: "",
      STEPFUN_API_KEY: "",
      MINIMAX_API_KEY: "",
      SEED_AUDIO_API_KEY: "seed-test-key",
      SEED_AUDIO_BASE_URL: upstreamUrl
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  t.after(async () => {
    if (child.exitCode === null) {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill();
      await exited;
    }
    if (dataDir.startsWith(os.tmpdir())) fs.rmSync(dataDir, { recursive: true, force: true });
  });
  await waitForServer(`http://127.0.0.1:${appPort}/api/status`, child);

  const createResponse = await fetch(`http://127.0.0.1:${appPort}/api/seed-audio/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Request-Id": "browser-trace-id" },
    body: JSON.stringify({
      textPrompt: "@音频1 朗读你好。",
      references: [{ kind: "audio", filename: "voice.wav", audioData: Buffer.from("RIFFreference").toString("base64") }],
      format: "wav",
      enableSubtitle: true
    })
  });
  assert.equal(createResponse.status, 200);
  const created = await createResponse.json();
  assert.equal(created.generation.mode, "seed-audio");
  assert.equal(created.generation.settings.referenceMode, "audio");
  assert.equal(created.generation.settings.subtitle.text, "你好");
  assert.equal(upstreamRequest.headers["x-api-key"], "seed-test-key");
  assert.equal(upstreamRequest.headers["x-api-request-id"], "browser-trace-id");
  assert.deepEqual(upstreamRequest.body.references, [{ audio_data: Buffer.from("RIFFreference").toString("base64") }]);
  assert.equal("audio_url" in upstreamRequest.body.references[0], false);

  const audioResponse = await fetch(`http://127.0.0.1:${appPort}${created.generation.audioUrl}`);
  assert.deepEqual(Buffer.from(await audioResponse.arrayBuffer()), audio);

  const historyResponse = await fetch(`http://127.0.0.1:${appPort}/api/generations?mode=seed-audio`);
  const history = await historyResponse.json();
  assert.equal(history.generations.length, 1);
  assert.equal(history.generations[0].settings.originalDuration, 1.4);

  await fetch(`http://127.0.0.1:${appPort}/api/generations?mode=seed-audio`, { method: "DELETE" });
  const cleared = await (await fetch(`http://127.0.0.1:${appPort}/api/generations?mode=seed-audio`)).json();
  assert.equal(cleared.generations.length, 0);
});

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => { try { resolve(JSON.parse(body)); } catch (error) { reject(error); } });
    req.on("error", reject);
  });
}

function sendJson(res, value, headers = {}) {
  const body = JSON.stringify(value);
  res.writeHead(200, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body), ...headers });
  res.end(body);
}

function listen(server) {
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => {
    resolve(`http://127.0.0.1:${server.address().port}`);
  }));
}

async function availablePort() {
  const server = http.createServer();
  const url = await listen(server);
  await new Promise((resolve) => server.close(resolve));
  return Number(new URL(url).port);
}

async function waitForServer(url, child) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Application server exited with code ${child.exitCode}.`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Application server did not become ready.");
}

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

test("MiniMax routes persist a completed async task in isolated history", { timeout: 15000 }, async (t) => {
  const audio = Buffer.from("RIFFmock-wave-audio");
  const upstream = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "POST" && url.pathname === "/v1/get_voice") {
      return sendJson(res, {
        system_voice: [{ voice_id: "male-qn-qingse", voice_name: "青涩青年音色", description: ["清亮自然的普通话青年男声。"] }],
        base_resp: { status_code: 0, status_msg: "success" }
      });
    }
    if (req.method === "POST" && url.pathname === "/v1/t2a_async_v2") {
      return sendJson(res, { task_id: 20260720, usage_characters: 8, base_resp: { status_code: 0, status_msg: "success" } });
    }
    if (req.method === "GET" && url.pathname === "/v1/query/t2a_async_query_v2") {
      return sendJson(res, { task_id: 20260720, status: "Success", file_id: 303, base_resp: { status_code: 0, status_msg: "success" } });
    }
    if (req.method === "GET" && url.pathname === "/v1/files/retrieve") {
      return sendJson(res, {
        file: { file_id: 303, filename: "minimax-result.wav", download_url: `${upstreamUrl}/download/audio.wav` },
        base_resp: { status_code: 0, status_msg: "success" }
      });
    }
    if (req.method === "GET" && url.pathname === "/download/audio.wav") {
      res.writeHead(200, { "Content-Type": "audio/wav", "Content-Length": audio.length });
      return res.end(audio);
    }
    res.writeHead(404).end();
  });
  const upstreamUrl = await listen(upstream);
  t.after(() => upstream.close());

  const appPort = await availablePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "qwen-tts-minimax-"));
  const child = spawn(process.execPath, ["--no-warnings", "server.js"], {
    cwd: path.resolve(__dirname, ".."),
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(appPort),
      DATA_DIR: dataDir,
      DASHSCOPE_API_KEY: "",
      STEPFUN_API_KEY: "",
      MINIMAX_API_KEY: "test-key",
      MINIMAX_BASE_URL: `${upstreamUrl}/v1`,
      MINIMAX_POLL_INTERVAL_MS: "25"
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

  const voicesResponse = await fetch(`http://127.0.0.1:${appPort}/api/minimax/voices`);
  assert.equal(voicesResponse.status, 200);
  assert.deepEqual(await voicesResponse.json(), {
    model: "speech-2.8-hd",
    voices: [{ voiceId: "male-qn-qingse", name: "青涩青年音色", description: "清亮自然的普通话青年男声。" }]
  });

  const createResponse = await fetch(`http://127.0.0.1:${appPort}/api/minimax/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "你好，世界。", voiceId: "male-qn-qingse", format: "wav", sampleRate: 32000 })
  });
  assert.equal(createResponse.status, 202);
  const created = await createResponse.json();
  assert.equal(created.task.taskId, "20260720");
  assert.equal(created.task.status, "processing");

  let task;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const response = await fetch(`http://127.0.0.1:${appPort}/api/minimax/tasks/${created.task.taskId}`);
    task = await response.json();
    if (task.task.status !== "processing") break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(task.task.status, "success");
  assert.equal(task.task.generation.mode, "minimax");
  assert.equal(task.task.generation.voiceName, "青涩青年音色");

  const audioResponse = await fetch(`http://127.0.0.1:${appPort}${task.task.generation.audioUrl}`);
  assert.equal(audioResponse.status, 200);
  assert.deepEqual(Buffer.from(await audioResponse.arrayBuffer()), audio);

  const historyResponse = await fetch(`http://127.0.0.1:${appPort}/api/generations?mode=minimax`);
  const history = await historyResponse.json();
  assert.equal(history.generations.length, 1);
  assert.equal(history.generations[0].settings.model, "speech-2.8-hd");

  const clearResponse = await fetch(`http://127.0.0.1:${appPort}/api/generations?mode=minimax`, { method: "DELETE" });
  assert.equal(clearResponse.status, 200);
  const cleared = await (await fetch(`http://127.0.0.1:${appPort}/api/generations?mode=minimax`)).json();
  assert.equal(cleared.generations.length, 0);
  assert.equal(fs.existsSync(path.join(dataDir, "qwen-tts.db")), true);
});

function sendJson(res, value) {
  const body = JSON.stringify(value);
  res.writeHead(200, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function listen(server) {
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    resolve(`http://127.0.0.1:${address.port}`);
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

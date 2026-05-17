const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const DEFAULT_STATE = {
  workers: [],
  rates: [],
  workRecords: [],
  deductions: [],
  credits: [],
  users: [],
  attendance: [],
  loans: [],
  settings: { farmName: "Multilox", currency: "USD", logoDataUrl: "" },
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
  }
}

async function readState() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const loaded = JSON.parse(raw || "{}");
  return {
    ...DEFAULT_STATE,
    ...loaded,
    workers: loaded.workers || [],
    rates: loaded.rates || [],
    workRecords: loaded.workRecords || [],
    deductions: loaded.deductions || [],
    credits: loaded.credits || [],
    users: loaded.users || [],
    attendance: loaded.attendance || [],
    loans: loaded.loans || [],
    settings: { ...DEFAULT_STATE.settings, ...(loaded.settings || {}) },
  };
}

async function writeState(state) {
  await ensureDataFile();
  const nextState = {
    ...DEFAULT_STATE,
    ...state,
    workers: Array.isArray(state.workers) ? state.workers : [],
    rates: Array.isArray(state.rates) ? state.rates : [],
    workRecords: Array.isArray(state.workRecords) ? state.workRecords : [],
    deductions: Array.isArray(state.deductions) ? state.deductions : [],
    credits: Array.isArray(state.credits) ? state.credits : [],
    users: Array.isArray(state.users) ? state.users : [],
    attendance: Array.isArray(state.attendance) ? state.attendance : [],
    loans: Array.isArray(state.loans) ? state.loans : [],
    settings: { ...DEFAULT_STATE.settings, ...(state.settings || {}) },
  };
  await fs.writeFile(DATA_FILE, JSON.stringify(nextState, null, 2));
  return nextState;
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(text);
}

function safeStaticPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const requested = cleanPath === "/" ? "/index.html" : cleanPath;
  const fullPath = path.normalize(path.join(ROOT, requested));
  if (!fullPath.startsWith(ROOT)) return null;
  return fullPath;
}

async function serveStatic(request, response) {
  const filePath = safeStaticPath(request.url);
  if (!filePath) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    });
    response.end(content);
  } catch {
    sendText(response, 404, "Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === "/api/health") {
      sendJson(response, 200, { ok: true, app: "Multilox Farm Management System" });
      return;
    }

    if (request.url === "/api/state" && request.method === "GET") {
      sendJson(response, 200, await readState());
      return;
    }

    if (request.url === "/api/state" && request.method === "PUT") {
      const body = await readRequestBody(request);
      const state = JSON.parse(body || "{}");
      sendJson(response, 200, await writeState(state));
      return;
    }

    if (request.method === "GET") {
      await serveStatic(request, response);
      return;
    }

    sendText(response, 405, "Method not allowed");
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Multilox Farm Management System running on port ${PORT}`);
});

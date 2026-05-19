const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
let Pool;
let bcrypt;

try {
  ({ Pool } = require("pg"));
} catch {
  Pool = null;
}

try {
  bcrypt = require("bcryptjs");
} catch {
  bcrypt = null;
}

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const DATABASE_URL = process.env.DATABASE_URL;
const USE_DATABASE = Boolean(DATABASE_URL);
const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-session-secret";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const MAX_BODY_BYTES = 5_000_000;
const pool = USE_DATABASE && Pool ? new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
}) : null;

const DEFAULT_STATE = {
  workers: [],
  rates: [],
  workRecords: [],
  deductions: [],
  credits: [],
  creditItems: [],
  users: [],
  attendance: [],
  loans: [],
  auditLogs: [],
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

function normalizeState(state = {}) {
  const normalized = {
    ...DEFAULT_STATE,
    ...state,
    workers: Array.isArray(state.workers) ? state.workers : [],
    rates: Array.isArray(state.rates) ? state.rates : [],
    workRecords: Array.isArray(state.workRecords) ? state.workRecords : [],
    deductions: Array.isArray(state.deductions) ? state.deductions : [],
    credits: Array.isArray(state.credits) ? state.credits : [],
    creditItems: Array.isArray(state.creditItems) ? state.creditItems : [],
    users: Array.isArray(state.users) ? state.users : [],
    attendance: Array.isArray(state.attendance) ? state.attendance : [],
    loans: Array.isArray(state.loans) ? state.loans : [],
    auditLogs: Array.isArray(state.auditLogs) ? state.auditLogs : [],
    settings: { ...DEFAULT_STATE.settings, ...(state.settings || {}) },
  };
  if (!normalized.users.some((user) => user.role === "main-admin")) {
    const firstAdmin = normalized.users.find((user) => user.role === "admin" && user.status === "active");
    if (firstAdmin) firstAdmin.role = "main-admin";
  }
  return normalized;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function sanitizeState(state) {
  return {
    ...state,
    users: state.users.map(sanitizeUser),
  };
}

function isAdmin(role) {
  return role === "main-admin" || role === "admin";
}

function canWriteFullState(role) {
  return isAdmin(role);
}

function legacyHashPassword(password) {
  let hash = 5381;
  for (let index = 0; index < password.length; index += 1) {
    hash = ((hash << 5) + hash) + password.charCodeAt(index);
    hash &= 0xffffffff;
  }
  return String(hash >>> 0);
}

async function hashPassword(password) {
  if (!bcrypt) {
    throw new Error("bcryptjs is not installed. Run npm install.");
  }
  return bcrypt.hash(password, 12);
}

async function verifyPassword(user, password) {
  if (user.passwordHash?.startsWith("$2")) {
    return bcrypt ? bcrypt.compare(password, user.passwordHash) : false;
  }
  return user.passwordHash === legacyHashPassword(password);
}

function makeSession(user) {
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const index = item.indexOf("=");
      return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
    }));
}

function getSession(request) {
  const token = parseCookies(request).multilox_session;
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function setSessionCookie(response, user) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `multilox_session=${encodeURIComponent(makeSession(user))}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`);
}

function clearSessionCookie(response) {
  response.setHeader("Set-Cookie", "multilox_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
}

function checkOrigin(request) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return true;
  const origin = request.headers.origin;
  if (!origin) return true;
  const host = request.headers.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function ensureDatabase() {
  if (!USE_DATABASE) return;
  if (!pool) throw new Error("DATABASE_URL is set, but the pg package is not installed. Run npm install.");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    `INSERT INTO app_state (id, data)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (id) DO NOTHING`,
    ["main", JSON.stringify(DEFAULT_STATE)]
  );
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
  }
}

async function readState() {
  if (USE_DATABASE) {
    await ensureDatabase();
    const result = await pool.query("SELECT data FROM app_state WHERE id = $1", ["main"]);
    return normalizeState(result.rows[0]?.data || DEFAULT_STATE);
  }
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return normalizeState(JSON.parse(raw || "{}"));
}

async function writeState(state) {
  const nextState = normalizeState(state);
  if (USE_DATABASE) {
    await ensureDatabase();
    await pool.query(
      `INSERT INTO app_state (id, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      ["main", JSON.stringify(nextState)]
    );
    return nextState;
  }
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(nextState, null, 2));
  return nextState;
}

function audit(state, user, action, detail = {}) {
  state.auditLogs.unshift({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    userId: user?.id || "system",
    username: user?.username || "system",
    role: user?.role || "system",
    action,
    detail,
  });
  state.auditLogs = state.auditLogs.slice(0, 1000);
}

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function readJsonBody(request) {
  const body = await readRequestBody(request);
  return JSON.parse(body || "{}");
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(text);
}

function requireSession(request, response) {
  const session = getSession(request);
  if (!session) {
    sendJson(response, 401, { error: "Authentication required" });
    return null;
  }
  return session;
}

function safeStaticPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const requested = cleanPath === "/" ? "/index.html" : cleanPath;
  if (requested.startsWith("/data/")) return null;
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
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
    response.end(content);
  } catch {
    sendText(response, 404, "Not found");
  }
}

async function handleSetup(request, response) {
  const state = await readState();
  if (state.users.some((user) => user.role === "main-admin" && user.status === "active")) {
    sendJson(response, 409, { error: "Main Admin already exists" });
    return;
  }
  const body = await readJsonBody(request);
  const username = normalizeUsername(body.username);
  if (!body.name || !username || !body.password || body.password.length < 8) {
    sendJson(response, 400, { error: "Name, username, and an 8+ character password are required" });
    return;
  }
  const user = {
    id: crypto.randomUUID(),
    name: String(body.name).trim(),
    username,
    passwordHash: await hashPassword(body.password),
    role: "main-admin",
    status: "active",
    createdAt: new Date().toISOString(),
  };
  state.users.push(user);
  audit(state, user, "created-main-admin", { username });
  await writeState(state);
  setSessionCookie(response, user);
  sendJson(response, 201, { user: sanitizeUser(user), state: sanitizeState(state) });
}

async function handleLogin(request, response) {
  const body = await readJsonBody(request);
  const username = normalizeUsername(body.username);
  const state = await readState();
  const user = state.users.find((candidate) => {
    return candidate.username === username && candidate.role === body.role && candidate.status === "active";
  });
  if (!user || !(await verifyPassword(user, body.password || ""))) {
    sendJson(response, 401, { error: "Invalid username, password, or role" });
    return;
  }
  if (!user.passwordHash.startsWith("$2")) {
    user.passwordHash = await hashPassword(body.password);
  }
  user.lastLoginAt = new Date().toISOString();
  audit(state, user, "login", { role: user.role });
  await writeState(state);
  setSessionCookie(response, user);
  sendJson(response, 200, { user: sanitizeUser(user), state: sanitizeState(state) });
}

async function handleCreateAccount(request, response, session) {
  if (!isAdmin(session.role)) {
    sendJson(response, 403, { error: "Only admins can create user accounts" });
    return;
  }
  const state = await readState();
  const body = await readJsonBody(request);
  const username = normalizeUsername(body.username);
  if (!["admin", "supervisor"].includes(body.role)) {
    sendJson(response, 400, { error: "Only Secondary Admin and Supervisor accounts can be created here" });
    return;
  }
  if (!body.name || !username || !body.password || body.password.length < 8) {
    sendJson(response, 400, { error: "Name, username, and an 8+ character password are required" });
    return;
  }
  if (state.users.some((user) => user.username === username)) {
    sendJson(response, 409, { error: "That username is already in use" });
    return;
  }
  const user = {
    id: crypto.randomUUID(),
    name: String(body.name).trim(),
    username,
    passwordHash: await hashPassword(body.password),
    role: body.role,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  state.users.push(user);
  audit(state, session, "created-account", { username, role: body.role });
  await writeState(state);
  sendJson(response, 201, { user: sanitizeUser(user), state: sanitizeState(state) });
}

function mergeSupervisorChanges(currentState, incomingState) {
  const mergeByIdNoDelete = (currentItems, incomingItems) => {
    const map = new Map(currentItems.map((item) => [item.id, item]));
    incomingItems.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
    return [...map.values()];
  };
  return normalizeState({
    ...currentState,
    workRecords: mergeByIdNoDelete(currentState.workRecords, incomingState.workRecords || []),
    attendance: mergeByIdNoDelete(currentState.attendance, incomingState.attendance || []),
  });
}

async function handleStatePut(request, response, session) {
  const currentState = await readState();
  const incomingState = normalizeState(await readJsonBody(request));
  let nextState;
  if (canWriteFullState(session.role)) {
    nextState = normalizeState({
      ...incomingState,
      users: currentState.users,
      auditLogs: currentState.auditLogs,
    });
  } else if (session.role === "supervisor") {
    nextState = mergeSupervisorChanges(currentState, incomingState);
  } else {
    sendJson(response, 403, { error: "Not allowed" });
    return;
  }
  audit(nextState, session, "updated-state", { role: session.role });
  await writeState(nextState);
  sendJson(response, 200, sanitizeState(nextState));
}

const server = http.createServer(async (request, response) => {
  try {
    if (!checkOrigin(request)) {
      sendJson(response, 403, { error: "Invalid request origin" });
      return;
    }

    if (request.url === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        app: "Multilox Farm Management System",
        storage: USE_DATABASE ? "postgresql" : "json-file",
      });
      return;
    }

    if (request.url === "/api/session" && request.method === "GET") {
      const session = getSession(request);
      const state = await readState();
      sendJson(response, 200, {
        user: session ? sanitizeUser(session) : null,
        hasMainAdmin: state.users.some((user) => user.role === "main-admin" && user.status === "active"),
      });
      return;
    }

    if (request.url === "/api/setup" && request.method === "POST") {
      await handleSetup(request, response);
      return;
    }

    if (request.url === "/api/login" && request.method === "POST") {
      await handleLogin(request, response);
      return;
    }

    if (request.url === "/api/logout" && request.method === "POST") {
      clearSessionCookie(response);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.url === "/api/accounts" && request.method === "POST") {
      const session = requireSession(request, response);
      if (!session) return;
      await handleCreateAccount(request, response, session);
      return;
    }

    if (request.url === "/api/state" && request.method === "GET") {
      const session = requireSession(request, response);
      if (!session) return;
      sendJson(response, 200, sanitizeState(await readState()));
      return;
    }

    if (request.url === "/api/state" && request.method === "PUT") {
      const session = requireSession(request, response);
      if (!session) return;
      await handleStatePut(request, response, session);
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

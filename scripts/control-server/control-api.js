#!/usr/bin/env node
/**
 * Nexus Control API
 * -------------------------------------------------------------
 * خدمة HTTP صغيرة تعمل على سيرفر المرايا، تستقبل أوامر مصادَق
 * عليها من لوحة التحكم وتجلب آخر التحديثات من GitHub بدون
 * المساس بأي موقع منشور.
 *
 * Endpoints (Bearer token required):
 *   GET  /health
 *   GET  /projects
 *   POST /sync         { repo: string, branch?: string, name: string }
 *   GET  /status/:name
 *   GET  /logs/:name?tail=200
 */

const http = require("node:http");
const { execFile } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { promisify } = require("node:util");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const TOKEN = process.env.CONTROL_API_TOKEN;
const PORT = Number(process.env.PORT || 8787);
const ROOT = process.env.MIRRORS_ROOT || "/srv/mirrors";

if (!TOKEN) {
  console.error("CONTROL_API_TOKEN missing in .env");
  process.exit(1);
}

const exec = promisify(execFile);

function safeName(n) {
  return /^[a-zA-Z0-9_.-]+$/.test(n);
}

function authOk(req) {
  const h = req.headers["authorization"] || "";
  if (!h.startsWith("Bearer ")) return false;
  const provided = Buffer.from(h.slice(7));
  const expected = Buffer.from(TOKEN);
  if (provided.length !== expected.length) return false;
  // timing-safe compare
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= provided[i] ^ expected[i];
  return diff === 0;
}

function send(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function listProjects() {
  if (!fs.existsSync(ROOT)) return [];
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = path.join(ROOT, e.name);
    let commit = null;
    let branch = null;
    try {
      const { stdout: c } = await exec("git", ["-C", dir, "rev-parse", "HEAD"]);
      commit = c.trim();
      const { stdout: b } = await exec("git", ["-C", dir, "rev-parse", "--abbrev-ref", "HEAD"]);
      branch = b.trim();
    } catch {}
    const stat = fs.statSync(dir);
    out.push({ name: e.name, path: dir, commit, branch, mtime: stat.mtimeMs });
  }
  return out;
}

async function syncRepo({ name, repo, branch }) {
  if (!safeName(name)) throw new Error("invalid name");
  if (!/^https:\/\/github\.com\//.test(repo)) throw new Error("repo must be https github url");
  const target = path.join(ROOT, name);
  const args = fs.existsSync(target)
    ? ["-C", target, "pull", "--ff-only"]
    : ["clone", "--depth=20", "--branch", branch || "main", repo, target];
  const cmd = fs.existsSync(target) ? "git" : "git";
  const start = Date.now();
  try {
    const { stdout, stderr } = await exec(cmd, args, { maxBuffer: 4 * 1024 * 1024 });
    const { stdout: head } = await exec("git", ["-C", target, "rev-parse", "HEAD"]);
    return {
      ok: true,
      duration_ms: Date.now() - start,
      commit: head.trim(),
      output: (stdout + stderr).trim().slice(-2000),
    };
  } catch (e) {
    return { ok: false, duration_ms: Date.now() - start, error: e.message };
  }
}

async function statusOf(name) {
  if (!safeName(name)) throw new Error("invalid name");
  const dir = path.join(ROOT, name);
  if (!fs.existsSync(dir)) return { exists: false };
  const { stdout: head } = await exec("git", ["-C", dir, "rev-parse", "HEAD"]);
  const { stdout: branch } = await exec("git", ["-C", dir, "rev-parse", "--abbrev-ref", "HEAD"]);
  const { stdout: log } = await exec("git", [
    "-C", dir, "log", "-5", "--pretty=format:%h|%an|%ar|%s",
  ]);
  return {
    exists: true,
    commit: head.trim(),
    branch: branch.trim(),
    recent: log.trim().split("\n").map((l) => {
      const [sha, author, when, msg] = l.split("|");
      return { sha, author, when, msg };
    }),
  };
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString() || "{}")); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname === "/health" && req.method === "GET") {
      return send(res, 200, { ok: true, time: new Date().toISOString() });
    }
    if (!authOk(req)) return send(res, 401, { error: "unauthorized" });

    if (url.pathname === "/projects" && req.method === "GET") {
      return send(res, 200, { projects: await listProjects() });
    }
    if (url.pathname === "/sync" && req.method === "POST") {
      const body = await readBody(req);
      const r = await syncRepo(body);
      return send(res, r.ok ? 200 : 500, r);
    }
    const sm = url.pathname.match(/^\/status\/([^/]+)$/);
    if (sm && req.method === "GET") {
      return send(res, 200, await statusOf(decodeURIComponent(sm[1])));
    }
    return send(res, 404, { error: "not found" });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`Nexus Control API listening on :${PORT}`);
});
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};

function initialDb() {
  return {
    chats: [],
    users: [],
    sessions: {},
    messages: {},
  };
}

function ensureDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    writeDb(initialDb());
  }
}

function readDb() {
  ensureDb();
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  let changed = false;

  if (!Array.isArray(db.chats)) {
    db.chats = [];
    changed = true;
  }

  if (!Array.isArray(db.users)) {
    db.users = [];
    changed = true;
  }

  const demoUserIds = new Set(
    db.users
      .filter((user) => user.email === "demo@instac.local" || user.id === "demo-user")
      .map((user) => user.id)
  );

  if (demoUserIds.size > 0) {
    db.users = db.users.filter((user) => !demoUserIds.has(user.id));
    db.sessions = Object.fromEntries(
      Object.entries(db.sessions || {}).filter((entry) => !demoUserIds.has(entry[1]))
    );
    changed = true;
  }

  const demoChatIds = new Set(["chat-1", "chat-2"]);
  const cleanedChats = db.chats.filter((chat) => !demoChatIds.has(chat.id));
  if (cleanedChats.length !== db.chats.length) {
    db.chats = cleanedChats;
    changed = true;
  }

  const cleanedMemberChats = db.chats.filter((chat) => {
    if (!Array.isArray(chat.members)) {
      return true;
    }
    return !chat.members.some((id) => demoUserIds.has(id));
  });
  if (cleanedMemberChats.length !== db.chats.length) {
    db.chats = cleanedMemberChats;
    changed = true;
  }

  if (!db.messages) {
    db.messages = {};
    changed = true;
  }

  for (const chatId of demoChatIds) {
    if (db.messages[chatId]) {
      delete db.messages[chatId];
      changed = true;
    }
  }

  for (const chat of db.chats) {
    if (!Array.isArray(db.messages[chat.id])) {
      db.messages[chat.id] = [];
      changed = true;
    }
  }

  const seenUsernames = new Set();
  for (const user of db.users) {
    const current = String(user.username || "").trim();
    if (!current || seenUsernames.has(current.toLowerCase())) {
      user.username = makeUniqueUsername(user.name || user.email, db.users, user.id);
      changed = true;
    }
    seenUsernames.add(String(user.username).toLowerCase());
  }

  if (changed) {
    writeDb(db);
  }

  return db;
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function normalizeUsernameBase(name) {
  const base = String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, ".")
    .replace(/^\.+|\.+$/g, "");

  return base || "user";
}

function makeUniqueUsername(name, users, currentUserId = "") {
  const base = normalizeUsernameBase(name);
  const taken = new Set(
    users
      .filter((user) => user.id !== currentUserId)
      .map((user) => String(user.username || "").toLowerCase())
      .filter(Boolean)
  );

  let username = base;
  let suffix = 2;
  while (taken.has(username.toLowerCase())) {
    username = `${base}${suffix}`;
    suffix += 1;
  }

  return username;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Body is too large"));
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function getToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function getSessionUser(req, db) {
  const token = getToken(req);
  const userId = db.sessions[token];
  return userId ? db.users.find((user) => user.id === userId) || null : null;
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
  };
}

function publicSearchUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    avatar: "../assets/media/avatar/3.png",
  };
}

function getOtherMember(chat, currentUserId, db) {
  if (!Array.isArray(chat.members)) {
    return null;
  }

  const otherId = chat.members.find((id) => id !== currentUserId);
  return db.users.find((user) => user.id === otherId) || null;
}

async function handleApi(req, res, url) {
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/signup") {
      const body = await readJson(req);
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");

      if (!name || !email || password.length < 6) {
        sendJson(res, 400, { error: "نام، ایمیل و رمز عبور حداقل ۶ کاراکتری لازم است." });
        return;
      }

      const db = readDb();
      if (db.users.some((user) => user.email === email)) {
        sendJson(res, 409, { error: "این ایمیل قبلا ثبت شده است." });
        return;
      }

      const user = {
        id: crypto.randomUUID(),
        name,
        username: makeUniqueUsername(name, db.users),
        email,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      const token = crypto.randomBytes(24).toString("hex");
      db.users.push(user);
      db.sessions[token] = user.id;
      writeDb(db);
      sendJson(res, 201, { token, user: publicUser(user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/signin") {
      const body = await readJson(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const db = readDb();
      const user = db.users.find((item) => item.email === email);

      if (!user || user.password !== hashPassword(password)) {
        sendJson(res, 401, { error: "ایمیل یا رمز عبور اشتباه است." });
        return;
      }

      const token = crypto.randomBytes(24).toString("hex");
      db.sessions[token] = user.id;
      writeDb(db);
      sendJson(res, 200, { token, user: publicUser(user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/reset-password") {
      const body = await readJson(req);
      const email = String(body.email || "").trim().toLowerCase();
      const db = readDb();
      const exists = db.users.some((user) => user.email === email);
      sendJson(res, 200, {
        ok: true,
        message: exists
          ? "درخواست بازنشانی ثبت شد. در نسخه دمو ایمیل واقعی ارسال نمی‌شود."
          : "اگر این ایمیل ثبت شده باشد، درخواست بازنشانی ثبت می‌شود.",
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      const db = readDb();
      const user = getSessionUser(req, db);
      sendJson(res, user ? 200 : 401, user ? { user: publicUser(user) } : { error: "وارد نشده‌اید." });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/users/search") {
      const query = String(url.searchParams.get("q") || "").trim().toLowerCase();
      const db = readDb();
      const currentUser = getSessionUser(req, db);

      if (!currentUser) {
        sendJson(res, 401, { error: "برای جستجوی کاربران باید وارد حساب شوید." });
        return;
      }

      if (query.length < 2) {
        sendJson(res, 200, { users: [] });
        return;
      }

      const users = db.users
        .filter((user) => {
          const haystack = `${user.id} ${user.username || ""} ${user.name} ${user.email}`.toLowerCase();
          return haystack.includes(query);
        })
        .slice(0, 10)
        .map((user) => ({
          ...publicSearchUser(user),
          isSelf: user.id === currentUser.id,
        }));

      sendJson(res, 200, { users });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/users") {
      const db = readDb();
      const currentUser = getSessionUser(req, db);

      if (!currentUser) {
        sendJson(res, 401, { error: "برای مشاهده کاربران باید وارد حساب شوید." });
        return;
      }

      const users = db.users
        .filter((user) => user.id !== currentUser.id)
        .map(publicSearchUser);

      sendJson(res, 200, { users });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/chats") {
      const db = readDb();
      const currentUser = getSessionUser(req, db);

      if (!currentUser) {
        sendJson(res, 401, { error: "برای مشاهده چت‌ها باید وارد حساب شوید." });
        return;
      }

      const dbChats = db.chats.filter((chat) => {
        if (!Array.isArray(chat.members)) {
          return true;
        }
        return chat.members.includes(currentUser.id);
      });

      const chats = dbChats.map((chat) => {
        const messages = db.messages[chat.id] || [];
        const lastMessage = messages[messages.length - 1] || null;
        const otherMember = currentUser ? getOtherMember(chat, currentUser.id, db) : null;

        return {
          ...chat,
          name: otherMember ? otherMember.name || otherMember.email : chat.name,
          avatar: otherMember ? "../assets/media/avatar/3.png" : chat.avatar,
          unread: 0,
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                author: lastMessage.author,
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      });

      sendJson(res, 200, { chats });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/chats") {
      const body = await readJson(req);
      const targetUserId = String(body.userId || "").trim();
      const db = readDb();
      const currentUser = getSessionUser(req, db);

      if (!currentUser) {
        sendJson(res, 401, { error: "برای ساخت چت باید وارد حساب شوید." });
        return;
      }

      const targetUser = db.users.find((user) => user.id === targetUserId);
      if (!targetUser || targetUser.id === currentUser.id) {
        sendJson(res, 404, { error: "کاربر پیدا نشد." });
        return;
      }

      const pair = [currentUser.id, targetUser.id].sort();
      const chatId = `dm-${pair[0]}-${pair[1]}`;
      let chat = db.chats.find((item) => item.id === chatId);

      if (!chat) {
        chat = {
          id: chatId,
          name: targetUser.name || targetUser.email,
          type: "friend",
          avatar: "../assets/media/avatar/3.png",
          members: pair,
        };
        db.chats.push(chat);
        db.messages[chatId] = [];
        writeDb(db);
      }

      sendJson(res, 201, { chat });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/messages") {
      const chat = url.searchParams.get("chat") || "chat-2";
      const db = readDb();
      const user = getSessionUser(req, db);
      const chatRecord = db.chats.find((item) => item.id === chat);

      if (!chatRecord) {
        sendJson(res, 404, { error: "چت پیدا نشد." });
        return;
      }

      if (Array.isArray(chatRecord.members)) {
        if (!user) {
          sendJson(res, 401, { error: "برای مشاهده این چت باید وارد حساب شوید." });
          return;
        }

        if (!chatRecord.members.includes(user.id)) {
          sendJson(res, 403, { error: "به این چت دسترسی ندارید." });
          return;
        }
      }

      const messages = (db.messages[chat] || []).map((message) => ({
        ...message,
        self: message.authorId ? Boolean(user && message.authorId === user.id) : Boolean(message.self),
      }));

      sendJson(res, 200, { messages });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/messages") {
      const body = await readJson(req);
      const chat = String(body.chat || "chat-2");
      const text = String(body.text || "").trim();
      const db = readDb();
      const user = getSessionUser(req, db);

      if (!user) {
        sendJson(res, 401, { error: "برای ارسال پیام باید وارد حساب شوید." });
        return;
      }

      if (!db.chats.some((item) => item.id === chat)) {
        sendJson(res, 404, { error: "چت پیدا نشد." });
        return;
      }

      if (!text) {
        sendJson(res, 400, { error: "متن پیام نمی‌تواند خالی باشد." });
        return;
      }

      const chatRecord = db.chats.find((item) => item.id === chat);
      if (Array.isArray(chatRecord.members) && !chatRecord.members.includes(user.id)) {
        sendJson(res, 403, { error: "به این چت دسترسی ندارید." });
        return;
      }

      const message = {
        id: crypto.randomUUID(),
        chat,
        authorId: user.id,
        author: user.name,
        text,
        createdAt: new Date().toISOString(),
      };
      db.messages[chat] = db.messages[chat] || [];
      db.messages[chat].push(message);
      writeDb(db);
      sendJson(res, 201, { message });
      return;
    }

    sendJson(res, 404, { error: "API پیدا نشد." });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "درخواست نامعتبر است." });
  }
}

function serveStatic(req, res, url) {
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(ROOT_DIR, requestedPath));

  const relativePath = path.relative(ROOT_DIR, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
    res.end();
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url);
    return;
  }

  serveStatic(req, res, url);
});

server.listen(PORT, () => {
  readDb();
  console.log(`InstaC dark-skin server: http://localhost:${PORT}/dark-skin/signin.html`);
});

/**
 * server.js — rainbowbuddy.top 站点服务（托管 DeuceHub 官网 + 界外网球演示）
 *
 * API 接口：
 *   GET  /api/rankings  /api/health
 *   POST /api/admin/login  /api/admin/logout
 *   GET/POST /api/admin/data  （需 Bearer token）
 *
 * 静态资源：
 *   /              — DeuceHub 官网首页
 *   /pricing.html  — 定价详情页
 *   /ranking.html  — 界外网球俱乐部 · 积分排行榜（客户案例演示）
 *   /card.html     — 选手名片
 *   /admin.html    — 管理后台（录入成绩、维护排名）
 *   /robots.txt /sitemap.xml /llms.txt — 抓取与索引声明
 *
 * 兜底路由：/admin 短链 301 到 /admin.html；其余未知路径返回 404 + 404.html。
 */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

/* ========== 数据存储（JSON 文件） ========== */
const DATA_FILE = config.DATA_FILE;
const DATA_DIR = path.dirname(DATA_FILE);

// 确保数据目录和文件存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ players: [], updatedAt: new Date().toISOString(), updatedBy: 'system' }, null, 2));
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    return { players: [], updatedAt: new Date().toISOString(), updatedBy: 'system' };
  }
}

function writeData(data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

/* ========== 按 rank 字段排序（严格按存储顺序） ========== */
function sortByRank(players) {
  return [...players].sort((a, b) => (a.rank || 999) - (b.rank || 999));
}

/* ========== Token 管理（内存） ========== */
const tokens = new Map(); // token -> { expire }

function genToken() {
  return crypto.randomBytes(32).toString('hex');
}

function checkAuth(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const entry = tokens.get(token);
  if (!entry) return false;
  if (Date.now() > entry.expire) {
    tokens.delete(token);
    return false;
  }
  return true;
}

/* ========== API 路由 ========== */

// 公开：获取排行榜
app.get('/api/rankings', (req, res) => {
  const data = readData();
  const ranked = sortByRank(data.players || []);
    res.json({
        players: ranked,
        tournaments: data.tournaments || [],
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
        siteTitle: config.SITE_TITLE,
    });
});

// 店长看板：聚合运营指标（面向页面，一次返回看板所需全部数据）
app.get('/api/dashboard', (req, res) => {
  const data = readData();
  const players = data.players || [];
  const tournaments = data.tournaments || [];
  const lastIdx = Math.max(0, tournaments.length - 1);

  const totalMembers = players.length;
  const activeMembers = players.filter(p => (p.events?.[lastIdx] || 0) > 0).length;
  const totalPoints = players.reduce((s, p) => s + (p.total || 0), 0);
  const avgPoints = totalMembers ? Math.round(totalPoints / totalMembers) : 0;

  const top = [...players].sort((a, b) => (b.total || 0) - (a.total || 0))[0] || null;

  // 排名变动分布
  let up = 0, down = 0, same = 0;
  players.forEach(p => {
    const c = p.change || 0;
    if (c > 0) up++; else if (c < 0) down++; else same++;
  });

  // 每站参赛人数 + 当站积分
  const tournamentTrend = tournaments.map((t, i) => {
    const participants = players.filter(p => (p.events?.[i] || 0) > 0).length;
    const points = players.reduce((s, p) => s + (p.events?.[i] || 0), 0);
    return { id: t.id, name: t.name, date: t.date, participants, points };
  });

  // 积分分布
  const tiers = [
    { range: '0-99', min: 0, max: 100 },
    { range: '100-199', min: 100, max: 200 },
    { range: '200-299', min: 200, max: 300 },
    { range: '300-499', min: 300, max: 500 },
    { range: '500-799', min: 500, max: 800 },
    { range: '800+', min: 800, max: Infinity },
  ];
  const pointsDistribution = tiers.map(t => ({
    range: t.range,
    count: players.filter(p => {
      const v = p.total || 0;
      return v >= t.min && v < t.max;
    }).length,
  }));

  // TOP 5 榜单
  const leaderboard = sortByRank(players).slice(0, 5).map(p => ({
    rank: p.rank, name: p.name, total: p.total, change: p.change || 0,
  }));

  res.json({
    members: {
      total: totalMembers,
      active: activeMembers,
      activeRate: totalMembers ? +(activeMembers / totalMembers).toFixed(2) : 0,
    },
    tournaments: {
      count: tournaments.length,
      latest: tournaments.length ? {
        name: tournaments[lastIdx].name,
        date: tournaments[lastIdx].date,
        participants: activeMembers,
      } : null,
    },
    points: {
      total: totalPoints,
      average: avgPoints,
      top: top ? { name: top.name, total: top.total } : null,
    },
    mobility: { up, down, same },
    tournamentTrend,
    pointsDistribution,
    leaderboard,
    updatedAt: data.updatedAt,
  });
});

// 管理员登录
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: '请输入密码' });
  }
  if (password !== config.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密码错误' });
  }
  const token = genToken();
  tokens.set(token, { expire: Date.now() + config.TOKEN_EXPIRE });
  res.json({ token, expire: config.TOKEN_EXPIRE });
});

// 管理员登出
app.post('/api/admin/logout', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  tokens.delete(token);
  res.json({ ok: true });
});

// 中间件：验证管理员权限
function requireAuth(req, res, next) {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: '未登录或登录已过期' });
  }
  next();
}

// 管理员：获取原始数据
app.get('/api/admin/data', requireAuth, (req, res) => {
  const data = readData();
  res.json(data);
});

// 管理员：保存数据（支持多维：保留 id 与 events 数组）
app.post('/api/admin/data', requireAuth, (req, res) => {
  const { players, tournaments } = req.body || {};
  if (!Array.isArray(players)) {
    return res.status(400).json({ error: '数据格式错误，players 应为数组' });
  }
  // 历史数据：用于计算排名变化
  const prev = readData();
  const prevById = new Map();
  const prevByName = new Map();
  (prev.players || []).forEach(p => {
    if (p.id) prevById.set(String(p.id), p);
    prevByName.set(String(p.name || '').trim(), p);
  });

  // 清洗每位选手：保留 id 与各站 events 积分，并算出总积分
  const clean = players.map((p, i) => {
    const id = String(p.id || '').trim();
    const name = String(p.name || '').trim();
    const events = Array.isArray(p.events)
      ? p.events.map(n => Math.max(0, parseInt(n) || 0))
      : [];
    const total = Math.max(0, parseInt(p.total) || 0) || events.reduce((a, b) => a + b, 0);
    return { id, name, events, total, _idx: i };
  }).filter(p => p.name);

  // 排名严格跟随总积分：先按 total 降序排序，再分配 rank（修复“改了积分排名不更新”）
  clean.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a._idx - b._idx; // 同分时保持提交顺序，结果稳定可复现
  });

  // 分配 rank 并计算相对历史排名的变化
  clean.forEach((p, i) => {
    const newRank = i + 1;
    const prevP = (p.id && prevById.get(p.id)) || prevByName.get(p.name);
    const prevRank = prevP && prevP.rank ? prevP.rank : null;
    p.rank = newRank;
    p.prevRank = prevRank || newRank;
    p.change = prevRank ? prevRank - newRank : 0;
    delete p._idx;
  });

  const data = writeData({
    players: clean,
    tournaments: Array.isArray(tournaments) && tournaments.length ? tournaments : (prev.tournaments || []),
    updatedBy: 'admin',
  });
  const ranked = sortByRank(data.players);
  res.json({ ok: true, count: ranked.length, players: ranked, tournaments: data.tournaments, updatedAt: data.updatedAt });
});

/* ========== 健康检查 ========== */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* ========== 兜底：/admin 短链跳转到 /admin.html；其余未知路径返回 404.html ========== */
app.use((req, res) => {
  if (req.method === 'GET' && req.path === '/admin') {
    return res.redirect(301, '/admin.html');
  }
  if (req.method === 'GET') {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }
  res.status(404).json({ error: 'Not Found' });
});

/* ========== 启动 ========== */
app.listen(config.PORT, () => {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  DeuceHub 官网 + 界外网球演示 已启动          │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│  公共页面:  http://localhost:' + config.PORT + '              │');
  console.log('│  后台管理:  http://localhost:' + config.PORT + '/admin         │');
  console.log('│  管理员密码: ' + (config.ADMIN_PASSWORD === 'jw2026admin' ? '默认(请修改!)' : '已自定义') + '                  │');
  console.log('└─────────────────────────────────────────────┘');
});

// =========================================================
//  界外网球 · 俯视 2D 可玩网球小游戏（页脚）
//  - 纯 Canvas 2D，零外部依赖（国内必定能跑）
//  - 俯视网球场：你(下) vs AI(上)
//  - 鼠标移动角色为主，WASD 辅助；球进入范围时按【空格】击球
//  - 真实网球计分：0/15/30/40/Deuce/AD，抢二胜制
//  - 接入现有页脚：.tg-play 开始/暂停，#tgScoreA/#tgScoreB 计分
//  自动初始化所有 .tennis-game-footer 容器。
// =========================================================
(function () {
  'use strict';

  function init(section) {
    if (section.dataset.tgInit) return;
    section.dataset.tgInit = '1';

    var host = section.querySelector('.tg-canvas') || section;
    var playBtn = section.querySelector('.tg-play');
    var scoreA = section.querySelector('#tgScoreA');
    var scoreB = section.querySelector('#tgScoreB');

    var canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    var W = 800, H = 600;

    function resize() {
      var r = host.getBoundingClientRect();
      W = Math.max(360, Math.round(r.width));
      H = Math.max(380, Math.round(r.height));
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
    }
    resize();
    if (window.ResizeObserver) { try { new ResizeObserver(resize).observe(host); } catch (e) {} }
    else window.addEventListener('resize', resize);

    // 球场像素矩形（每帧用当前 W/H 计算，自适应）
    function court() {
      var padX = W * 0.16, padTop = H * 0.10, padBot = H * 0.10;
      return {
        x: padX, y: padTop,
        w: W - padX * 2, h: H - padTop - padBot,
        get netY() { return this.y + this.h / 2; }
      };
    }

    var G = {
      running: false, over: false, started: false,
      mode: 'idle',            // idle | serve | rally | point | over
      t: 0, msg: '', msgT: 0,
      server: 'player',        // 发球方
      // 比分
      pa: 0, pb: 0,            // 本局分（原始点数）
      ga: 0, gb: 0,            // 已赢局数
      needGames: 2,            // 抢二胜
      // 实体
      player: { x: W / 2, y: 0, r: 15, tx: W / 2, ty: 0, canHit: false },
      ai: { x: W / 2, y: 0, r: 15, tx: W / 2, ty: 0 },
      ball: { x: W / 2, y: 0, z: 0, vx: 0, vy: 0, vz: 0, last: null, live: false },
      keys: {},
      mouse: { x: 0, y: 0, has: false }
    };

    function recenter() {
      var c = court();
      G.player.y = c.y + c.h - 34; G.player.ty = G.player.y; G.player.tx = c.x + c.w / 2;
      G.ai.y = c.y + 34; G.ai.ty = G.ai.y; G.ai.tx = c.x + c.w / 2;
      if (!G.ball.live) { G.ball.x = c.x + c.w / 2; G.ball.y = G.player.y; }
    }
    recenter();

    // ---------- 输入 ----------
    function setMouse(e) {
      var r = canvas.getBoundingClientRect();
      var px = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var py = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      G.mouse.x = px; G.mouse.y = py; G.mouse.has = true;
      var c = court();
      // 玩家只能在自己半场（网下方）移动
      G.player.tx = clamp(px, c.x + 10, c.x + c.w - 10);
      G.player.ty = clamp(py, c.netY + 12, c.y + c.h - 10);
    }
    canvas.addEventListener('mousemove', setMouse);
    canvas.addEventListener('mousedown', function (e) { setMouse(e); tryHit(); });
    canvas.addEventListener('touchmove', function (e) { setMouse(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchstart', function (e) { setMouse(e); tryHit(); e.preventDefault(); }, { passive: false });
    window.addEventListener('keydown', function (e) {
      G.keys[e.key.toLowerCase()] = true;
      if (e.code === 'Space') { e.preventDefault(); tryHit(); }
    });
    window.addEventListener('keyup', function (e) { G.keys[e.key.toLowerCase()] = false; });

    function tryHit() {
      if (!G.running || G.mode !== 'rally') return;
      var p = G.player, b = G.ball, c = court();
      if (b.last === 'player') return;            // 自己刚打出的球不能连击
      if (b.y < c.netY) return;                    // 球在对方半场不能击
      if (b.z > 46) return;                        // 球太高
      var d = Math.hypot(b.x - p.x, b.y - p.y);
      if (d < p.r + 40) hit('player');
    }

    // ---------- 工具 ----------
    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
    function rnd(a, b) { return a + Math.random() * (b - a); }

    // ---------- 击球 ----------
    function hit(who) {
      var b = G.ball, c = court();
      var self = who === 'player' ? G.player : G.ai;
      var targetHalf = who === 'player' ? c.y : c.y + c.h; // 目标半场中心 y
      // 横向目标：偏向角色站位反方向，制造角度；加少量随机
      var cx = c.x + c.w / 2;
      var lateral = (self.x - cx) * 0.7;            // 站左打右、站右打左
      var tx = clamp(cx - lateral + rnd(-c.w * 0.18, c.w * 0.18), c.x + 24, c.x + c.w - 24);
      var ty = clamp(targetHalf + rnd(-c.h * 0.18, c.h * 0.18), c.y + 24, c.y + c.h - 24);
      var dx = tx - b.x, dy = ty - b.y;
      var dist = Math.hypot(dx, dy) || 1;
      var fly = 0.85;                               // 飞行时间(秒)
      b.vx = dx / fly;
      b.vy = dy / fly;
      b.vz = 150 + Math.random() * 30;              // 上抛初速
      b.z = 1;
      b.last = who;
    }

    // ---------- 发球 ----------
    function serve() {
      var c = court();
      var s = G.server;
      var sx = c.x + c.w / 2 + rnd(-c.w * 0.2, c.w * 0.2);
      var sy = s === 'player' ? c.y + c.h - 30 : c.y + 30;
      var b = G.ball;
      b.x = sx; b.y = sy; b.z = 0; b.last = s; b.live = true;
      var ty = s === 'player' ? c.y + c.h * 0.32 : c.y + c.h * 0.68;
      var dx = (c.x + c.w / 2) - sx, dy = ty - sy;
      var dist = Math.hypot(dx, dy) || 1, fly = 0.9;
      b.vx = dx / fly; b.vy = dy / fly; b.vz = 160;
      G.mode = 'rally';
      G.msg = (s === 'player' ? '你的发球' : 'AI 发球'); G.msgT = 0.9;
    }

    // ---------- 判分 ----------
    function point(winner) {
      if (winner === 'player') G.pa++; else G.pb++;
      // 局点判定（抢二胜）：需领先 2 分且 >=4 分
      var a = G.pa, b = G.pb, gameWon = null;
      if (a >= 4 && a - b >= 2) gameWon = 'player';
      else if (b >= 4 && b - a >= 2) gameWon = 'ai';
      if (gameWon) {
        if (gameWon === 'player') G.ga++; else G.gb++;
        G.pa = 0; G.pb = 0;
        if (G.ga >= G.needGames || G.gb >= G.needGames) { endMatch(gameWon); return; }
        G.msg = (gameWon === 'player' ? '你赢下本局！' : 'AI 赢下本局'); G.msgT = 1.6;
      } else {
        G.msg = (winner === 'player' ? '你得分 +1' : 'AI 得分 +1'); G.msgT = 1.1;
      }
      G.ball.live = false; G.mode = 'point'; G.pointTimer = 1.1;
      G.server = (winner === 'player') ? 'ai' : 'player'; // 失分方发球（简化）
    }

    function endMatch(winner) {
      G.over = true; G.running = false; G.mode = 'over';
      G.msg = (winner === 'player' ? '🏆 你赢得比赛！' : 'AI 赢得比赛');
      G.msgT = 999;
      if (playBtn) playBtn.textContent = '▶ 再来一局';
    }

    function pointText(pts, other) {
      if (pts >= 3 && other >= 3) {
        if (pts === other) return '40';
        return pts > other ? 'AD' : '40';
      }
      return ['0', '15', '30', '40'][Math.min(pts, 3)];
    }

    // ---------- 更新 ----------
    function update(dt) {
      G.t += dt;
      if (G.msgT > 0) G.msgT -= dt;
      var c = court();
      var p = G.player, ai = G.ai, b = G.ball;

      // 键盘辅助移动
      var sp = 360 * dt;
      if (G.keys['a']) p.tx -= sp;
      if (G.keys['d']) p.tx += sp;
      if (G.keys['w']) p.ty -= sp;
      if (G.keys['s']) p.ty += sp;
      p.tx = clamp(p.tx, c.x + 10, c.x + c.w - 10);
      p.ty = clamp(p.ty, c.netY + 12, c.y + c.h - 10);

      // 玩家平滑移动
      p.x += (p.tx - p.x) * Math.min(1, 12 * dt);
      p.y += (p.ty - p.y) * Math.min(1, 12 * dt);

      // AI 移动：球在己方半场则追球，否则回防中心
      if (b.live && b.y < c.netY) { ai.tx = b.x; ai.ty = b.y; }
      else { ai.tx = c.x + c.w / 2; ai.ty = c.y + 34; }
      ai.tx = clamp(ai.tx, c.x + 10, c.x + c.w - 10);
      ai.ty = clamp(ai.ty, c.y + 12, c.netY - 10);
      ai.x += (ai.tx - ai.x) * Math.min(1, 9 * dt);
      ai.y += (ai.ty - ai.y) * Math.min(1, 9 * dt);

      if (!G.running) return;

      if (G.mode === 'point') {
        G.pointTimer -= dt;
        if (G.pointTimer <= 0) { recenter(); serve(); }
        return;
      }
      if (G.mode !== 'rally' || !b.live) return;

      // 球物理
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.z += b.vz * dt; b.vz -= 320 * dt;
      if (b.z < 0) {
        // 落地：判分
        var inX = b.x > c.x && b.x < c.x + c.w;
        var inY = b.y > c.y && b.y < c.y + c.h;
        var inB = inX && inY;
        if (!inB) {
          // 出界：最后击球方失误
          point(b.last === 'player' ? 'ai' : 'player');
        } else if (b.last === 'player' && b.y < c.netY) {
          // 落在 AI 半场界内，AI 未接 → 玩家得分
          point('player');
        } else if (b.last === 'ai' && b.y > c.netY) {
          point('ai');
        } else {
          // 落在自己半场（下网/失误）→ 对方得分
          point(b.last === 'player' ? 'ai' : 'player');
        }
        return;
      }

      // 击球判定（球接近地面且在某人半场）
      p.canHit = false;
      var nearP = Math.hypot(b.x - p.x, b.y - p.y) < p.r + 42;
      var nearA = Math.hypot(b.x - ai.x, b.y - ai.y) < ai.r + 42;
      if (b.z < 46 && b.y > c.netY && nearP && b.last !== 'player') p.canHit = true;
      if (b.z < 46 && b.y < c.netY && nearA && b.last !== 'ai') hit('ai');
    }

    // ---------- 绘制 ----------
    function draw() {
      var c = court();
      ctx.save();
      ctx.scale(DPR, DPR);
      ctx.clearRect(0, 0, W, H);

      // 背景：阳光天空
      var sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#bfe9ff'); sky.addColorStop(0.6, '#e8f7ff'); sky.addColorStop(1, '#fff7e6');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      // 太阳
      ctx.fillStyle = 'rgba(255,214,90,0.95)';
      ctx.beginPath(); ctx.arc(W * 0.12, H * 0.13, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,214,90,0.18)';
      ctx.beginPath(); ctx.arc(W * 0.12, H * 0.13, 46, 0, Math.PI * 2); ctx.fill();

      // 球场
      ctx.fillStyle = '#3fa34d';
      roundRect(c.x, c.y, c.w, c.h, 10); ctx.fill();
      ctx.fillStyle = '#46b057';
      roundRect(c.x + c.w * 0.08, c.y + c.h * 0.06, c.w * 0.84, c.h * 0.88, 8); ctx.fill();
      // 线
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 3;
      ctx.strokeRect(c.x, c.y, c.w, c.h);
      ctx.beginPath();
      ctx.moveTo(c.x + c.w * 0.08, c.y); ctx.lineTo(c.x + c.w * 0.08, c.y + c.h);
      ctx.moveTo(c.x + c.w * 0.92, c.y); ctx.lineTo(c.x + c.w * 0.92, c.y + c.h);
      ctx.moveTo(c.x, c.y + c.h * 0.25); ctx.lineTo(c.x + c.w, c.y + c.h * 0.25);
      ctx.moveTo(c.x, c.y + c.h * 0.75); ctx.lineTo(c.x + c.w, c.y + c.h * 0.75);
      ctx.stroke();

      // 球网
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(c.x, c.netY); ctx.lineTo(c.x + c.w, c.netY); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
      for (var gx = c.x; gx <= c.x + c.w; gx += 10) {
        ctx.beginPath(); ctx.moveTo(gx, c.netY - 10); ctx.lineTo(gx, c.netY + 10); ctx.stroke();
      }
      // 网柱
      ctx.fillStyle = '#5B4B8A';
      ctx.fillRect(c.x - 6, c.netY - 12, 6, 24);
      ctx.fillRect(c.x + c.w, c.netY - 12, 6, 24);

      // 阴影（球落点投影）
      var b = G.ball;
      if (G.running && b.live) {
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath(); ctx.ellipse(b.x, b.y, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      }

      // 角色
      drawPlayer(G.player, '#2d8a4e', '#ffffff', G.player.canHit);
      drawPlayer(G.ai, '#c0392b', '#ffffff', false);

      // 球
      if (G.running && b.live) {
        var by = b.y - b.z;
        ctx.fillStyle = '#d4ee3a';
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(b.x, by, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(b.x, by, 8, -0.5, 1.2); ctx.stroke();
      }

      // 比分牌
      drawScore(c);

      // 提示文字
      if (G.msgT > 0 && G.msg) {
        ctx.fillStyle = 'rgba(45,47,92,0.9)';
        ctx.font = 'bold 22px -apple-system, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(G.msg, W / 2, c.y - 14);
      }
      if (!G.running && !G.over) {
        ctx.fillStyle = 'rgba(45,47,92,0.78)';
        ctx.font = '16px -apple-system, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('鼠标移动角色，球到身边按【空格】击球 · 点「开始游戏」', W / 2, H - 16);
      }
      ctx.restore();
    }

    function drawPlayer(o, color, stroke, glow) {
      if (glow) {
        ctx.fillStyle = 'rgba(255,215,0,0.35)';
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r + 12, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = color; ctx.strokeStyle = stroke; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 球拍
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(o.x, o.y - o.r - 6, 9, 0, Math.PI * 2); ctx.stroke();
    }

    function drawScore(c) {
      var ta = pointText(G.pa, G.pb), tb = pointText(G.pb, G.pa);
      ctx.fillStyle = 'rgba(45,47,92,0.92)';
      ctx.font = 'bold 18px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('你 ' + ta + '  (局 ' + G.ga + ')', c.x + 6, c.y + 22);
      ctx.textAlign = 'right';
      ctx.fillText('(局 ' + G.gb + ') ' + tb + ' AI', c.x + c.w - 6, c.y + 22);
      // 同步到页脚比分 span
      if (scoreA) scoreA.textContent = G.ga + ':' + ta;
      if (scoreB) scoreB.textContent = G.gb + ':' + tb;
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    // ---------- 主循环 ----------
    var last = 0;
    function loop(ts) {
      var dt = last ? Math.min(0.033, (ts - last) / 1000) : 0.016;
      last = ts;
      update(dt);
      draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // ---------- 开始/暂停 ----------
    function startMatch() {
      recenter();
      G.ga = 0; G.gb = 0; G.pa = 0; G.pb = 0; G.over = false;
      G.running = true; G.server = 'player'; serve();
      if (playBtn) playBtn.textContent = '⏸ 暂停';
    }
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (G.over || !G.started) { G.started = true; startMatch(); return; }
        G.running = !G.running;
        if (playBtn) playBtn.textContent = G.running ? '⏸ 暂停' : '▶ 继续';
        if (G.running && G.mode === 'idle') serve();
      });
    }
  }

  // 自动初始化所有容器（含 site.js 运行时注入的）
  function boot() {
    document.querySelectorAll('.tennis-game-footer').forEach(init);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
    // 兜底：脚本晚于注入时也能抓到
    if (window.MutationObserver) {
      var mo = new MutationObserver(function () { boot(); });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  } else { boot(); }
})();

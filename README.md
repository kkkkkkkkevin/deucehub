# DeuceHub · 网球场管理系统

> DeuceHub is an open-source, self-hostable management system for tennis courts and clubs: match points → automatic rankings → store-owner operations dashboard. Built to increase member stickiness by giving players a reason to come back.

DeuceHub 是一套**开源、可自助托管**的网球场 / 俱乐部管理系统：比赛积分录入 → 自动排名 → 店长运营看板。核心目标是**提高会员粘性**——球友打完比赛会想看自己的积分涨了多少、排名升了几位。

## ✨ 功能

| 模块 | 说明 |
|------|------|
| 🎾 积分排名 | 每站赛事录入成绩，按积分自动排名，支持排名变动（升/降/不变） |
| 📊 店长看板 | 会员活跃、每站参赛趋势、积分分布、排名变动一屏看清（[在线演示](https://rainbowbuddy.top/dashboard.html)） |
| 🛠 管理后台 | React + Ant Design，录入学员成绩、维护选手、批量保存（`/admin.html`） |
| 📋 排行榜 / 名片 | 公开排行榜页面与选手个人名片（`/ranking.html`、`/card.html`） |
| 📱 微信小程序 | 排行榜、个人中心、MBTI 测试（`miniprogram/`） |

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 设置管理员密码（必须，代码中不硬编码）
export ADMIN_PASSWORD=your_password

# 3. 启动
node server.js
# 默认 http://localhost:3000
```

访问：
- 首页：`http://localhost:3000/`
- 排行榜：`http://localhost:3000/ranking.html`
- 店长看板：`http://localhost:3000/dashboard.html`
- 管理后台：`http://localhost:3000/admin.html`（密码即 `ADMIN_PASSWORD`）

## 📡 API

| 接口 | 说明 |
|------|------|
| `GET /api/rankings` | 公开：获取排行榜、赛事列表 |
| `GET /api/dashboard` | 公开：店长看板聚合指标（会员/赛事/积分/趋势/分布） |
| `POST /api/admin/login` | 管理员登录，返回 token |
| `GET /api/admin/data` | 需 token：获取原始数据 |
| `POST /api/admin/data` | 需 token：保存选手与赛事数据 |

## 🗂 数据模型

```json
{
  "tournaments": [{ "id": "t1", "name": "6/28 赢满贯500赛", "date": "2026-06-28" }],
  "players": [{
    "id": "RT267103", "name": "辛辣",
    "events": [108, 195, 0, 0, 0, 500],
    "total": 1053, "rank": 1, "change": 0
  }]
}
```

`events` 数组与 `tournaments` 一一对应，存每位选手每站的积分；`total` 为各站之和，`rank` 按 total 降序。

## 🏷 开源协议

MIT（可自由使用、修改、自托管）。

## 🔗 相关链接

- 官网：https://rainbowbuddy.top/
- 店长看板演示：https://rainbowbuddy.top/dashboard.html
- 界外网球俱乐部案例：https://rainbowbuddy.top/ranking.html

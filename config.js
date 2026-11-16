/**
 * config.js — DeuceHub / 界外网球排行榜 服务端配置
 *
 * 生产环境必须通过环境变量设置管理员密码，切勿在代码中硬编码：
 *   ADMIN_PASSWORD=你的密码 node server.js
 */
module.exports = {
  PORT: process.env.PORT || 3000,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  TOKEN_EXPIRE: 12 * 60 * 60 * 1000,
  SITE_TITLE: '界外网球积分排行榜',
  DATA_FILE: require('path').join(__dirname, 'data', 'rankings.json'),
};

// utils/mbti-data.js
// 网球MBTI测试数据 —— 界外网球小程序

// 图片服务器地址（物种插画、头像等大图通过URL加载，避免超过小程序2MB限制）
var IMG_BASE = 'https://ef035ccdb67a4a548a34d439537757ce.app.codebuddy.work';

// ============ 四个维度 ============
const dimensions = [
  {
    key: 'S',
    name: '发球风格',
    leftLabel: '大力',
    rightLabel: '懦弱',
    leftCode: 'S',   // 大力
    rightCode: 's',  // 懦弱
    icon: 'serve'
  },
  {
    key: 'R',
    name: '接球态度',
    leftLabel: '抡叫',
    rightLabel: '佛教',
    leftCode: 'R',   // 抡叫
    rightCode: 'r',  // 佛教
    icon: 'return'
  },
  {
    key: 'V',
    name: '场上声音',
    leftLabel: '尖叫',
    rightLabel: '沉默',
    leftCode: 'V',   // 尖叫
    rightCode: 'v',  // 沉默
    icon: 'voice'
  },
  {
    key: 'M',
    name: '精神状态',
    leftLabel: '军训',
    rightLabel: '躺平',
    leftCode: 'M',   // 军训
    rightCode: 'm',  // 躺平
    icon: 'mind'
  }
];

// ============ 12道题 (每维度3题) ============
const questions = [
  // --- 发球风格 S ---
  {
    id: 1, dim: 'S',
    title: '发球时你的策略？',
    optionA: { text: '全力轰击，球速拉满', code: 'S' },
    optionB: { text: '安全第一，过网就行', code: 's' }
  },
  {
    id: 2, dim: 'S',
    title: '你的发球落点偏好？',
    optionA: { text: '追身暴力ACE，拼速度', code: 'S' },
    optionB: { text: '给对方接球空间，求稳', code: 's' }
  },
  {
    id: 3, dim: 'S',
    title: '关键分上你的发球？',
    optionA: { text: '更大力，赌一把ACE', code: 'S' },
    optionB: { text: '稳稳抛球，打安全区', code: 's' }
  },
  // --- 接球态度 R ---
  {
    id: 4, dim: 'R',
    title: '对方发球你接球时？',
    optionA: { text: '抡圆了回击，伴随怒吼', code: 'R' },
    optionB: { text: '顺势挡一下，随缘就好', code: 'r' }
  },
  {
    id: 5, dim: 'R',
    title: '面对对手的大力来球？',
    optionA: { text: '迎前抡拍，以暴制暴', code: 'R' },
    optionB: { text: '轻轻一碰，化力为零', code: 'r' }
  },
  {
    id: 6, dim: 'R',
    title: '打出一记好球后你？',
    optionA: { text: '大吼一声"漂亮！"', code: 'R' },
    optionB: { text: '微微点头，心如止水', code: 'r' }
  },
  // --- 场上声音 V ---
  {
    id: 7, dim: 'V',
    title: '每次击球时你的习惯？',
    optionA: { text: '伴随尖叫或呻吟出拍', code: 'V' },
    optionB: { text: '安静击球，一声不吭', code: 'v' }
  },
  {
    id: 8, dim: 'V',
    title: '得分后你的第一反应？',
    optionA: { text: '大喊"Come on！"握拳庆祝', code: 'V' },
    optionB: { text: '平静走回位置，面无表情', code: 'v' }
  },
  {
    id: 9, dim: 'V',
    title: '非受迫性失误后你？',
    optionA: { text: '仰天长叹或碎碎念', code: 'V' },
    optionB: { text: '默默捡球，继续打', code: 'v' }
  },
  // --- 精神状态 M ---
  {
    id: 10, dim: 'M',
    title: '赛前你的准备流程？',
    optionA: { text: '热身拉伸战术分析全套', code: 'M' },
    optionB: { text: '到了就打，热什么身', code: 'm' }
  },
  {
    id: 11, dim: 'M',
    title: '0-5落后时你的心态？',
    optionA: { text: '咬牙追分，绝不放弃', code: 'M' },
    optionB: { text: '行吧，赶紧打完去吃饭', code: 'm' }
  },
  {
    id: 12, dim: 'M',
    title: '你的日常训练频率？',
    optionA: { text: '每周固定训练，雷打不动', code: 'M' },
    optionB: { text: '想打就打，全看心情', code: 'm' }
  }
];

// ============ 16个网球物种 ============
const species = [
  {
    id: 1, name: '重炮手', code: 'SRVM', firePower: 95,
    img: IMG_BASE + '/species/species_01.jpg',
    desc: '球场上的人形炮台，发球带着音爆，回球带着怒吼。每分必争，永不疲倦。对手看到你的抛球动作就开始发抖。',
    tags: ['暴力发球', '怒吼接球', '尖叫机器', '鸡血战士']
  },
  {
    id: 2, name: '惊雷手', code: 'SRVm', firePower: 80,
    img: IMG_BASE + '/species/species_02.jpg',
    desc: '发球如雷，吼声震天。但打完三局就开始看表，内心OS：差不多得了，明天还要上班。',
    tags: ['暴力发球', '怒吼接球', '尖叫机器', '摆烂大师']
  },
  {
    id: 3, name: '暗炮手', code: 'SRvM', firePower: 85,
    img: IMG_BASE + '/species/species_03.jpg',
    desc: '沉默的杀手。不喊不叫，但每一拍都是炮弹。你的沉默不是冷静，是懒得说话。',
    tags: ['暴力发球', '怒吼接球', '冷酷沉默', '鸡血战士']
  },
  {
    id: 4, name: '闷雷手', code: 'SRvm', firePower: 70,
    img: IMG_BASE + '/species/species_04.jpg',
    desc: '闷声发大球。不喊不叫不热身，打完就撤。球场上最神秘的对手——没人知道你下一步是ACE还是摆烂。',
    tags: ['暴力发球', '怒吼接球', '冷酷沉默', '摆烂大师']
  },
  {
    id: 5, name: '狂僧', code: 'SrVM', firePower: 75,
    img: IMG_BASE + '/species/species_05.jpg',
    desc: '大力发球配佛系接球，尖叫庆祝配禅意心态。一个矛盾体，连自己都不知道下一拍会怎样。',
    tags: ['暴力发球', '佛系接球', '尖叫机器', '鸡血战士']
  },
  {
    id: 6, name: '梦游者', code: 'SrVm', firePower: 60,
    img: IMG_BASE + '/species/species_06.jpg',
    desc: '大力发球，尖叫击球，但总感觉你在梦游。佛系接球，躺平训练。状态好时是神，状态差时是观众。',
    tags: ['暴力发球', '佛系接球', '尖叫机器', '摆烂大师']
  },
  {
    id: 7, name: '隐者', code: 'SrvM', firePower: 65,
    img: IMG_BASE + '/species/species_07.jpg',
    desc: '沉默的大力选手。发球凶猛但接球佛系，不喊不叫但训练刻苦。球场上的隐世高手。',
    tags: ['暴力发球', '佛系接球', '冷酷沉默', '鸡血战士']
  },
  {
    id: 8, name: '禅师', code: 'Srvm', firePower: 50,
    img: IMG_BASE + '/species/species_08.jpg',
    desc: '全程沉默，全程佛系，但发球力大无穷。打完一场球像做完一场冥想，输赢随缘，发球随命。',
    tags: ['暴力发球', '佛系接球', '冷酷沉默', '摆烂大师']
  },
  {
    id: 9, name: '火风掌', code: 'sRVM', firePower: 70,
    img: IMG_BASE + '/species/species_09.jpg',
    desc: '发球软弱，接球凶猛。明明球速不快但吼声震天，军事化训练弥补力量不足。靠气势赢球。',
    tags: ['温柔发球', '怒吼接球', '尖叫机器', '鸡血战士']
  },
  {
    id: 10, name: '旋风掌', code: 'sRVm', firePower: 55,
    img: IMG_BASE + '/species/species_10.jpg',
    desc: '发球软，接球猛，吼声大，训练少。全靠天赋和肾上腺素打球。状态来了谁都能赢，状态没了谁都能输。',
    tags: ['温柔发球', '怒吼接球', '尖叫机器', '摆烂大师']
  },
  {
    id: 11, name: '暗影掌', code: 'sRvM', firePower: 60,
    img: IMG_BASE + '/species/species_11.jpg',
    desc: '沉默的抡拍手。发球不猛但接球凶狠，不喊不叫但训练刻苦。像暗影中突然出手的刺客。',
    tags: ['温柔发球', '怒吼接球', '冷酷沉默', '鸡血战士']
  },
  {
    id: 12, name: '闷风掌', code: 'sRvm', firePower: 45,
    img: IMG_BASE + '/species/species_12.jpg',
    desc: '闷声抡拍，不喊不叫。发球不猛，接球还行，训练看心情。存在感极低但偶尔爆冷。',
    tags: ['温柔发球', '怒吼接球', '冷酷沉默', '摆烂大师']
  },
  {
    id: 13, name: '炸毛掌', code: 'srVM', firePower: 50,
    img: IMG_BASE + '/species/species_13.jpg',
    desc: '发球软，接球佛，但全程尖叫。一边尖叫一边佛系，一边炸毛一边军训。教练看了直摇头。',
    tags: ['温柔发球', '佛系接球', '尖叫机器', '鸡血战士']
  },
  {
    id: 14, name: '嘤嘤掌', code: 'srVm', firePower: 35,
    img: IMG_BASE + '/species/species_14.jpg',
    desc: '全程嘤嘤嘤。发球软，接球佛，尖叫多，训练少。球场上最吵的菜鸟，但没有攻击力。',
    tags: ['温柔发球', '佛系接球', '尖叫机器', '摆烂大师']
  },
  {
    id: 15, name: '棉花掌', code: 'srvM', firePower: 40,
    img: IMG_BASE + '/species/species_15.jpg',
    desc: '全程沉默佛系，发球软绵绵。但训练刻苦，像棉花一样——软但韧性十足。慢工出细活。',
    tags: ['温柔发球', '佛系接球', '冷酷沉默', '鸡血战士']
  },
  {
    id: 16, name: '软绵绵', code: 'srvm', firePower: 25,
    img: IMG_BASE + '/species/species_16.jpg',
    desc: '软发球，佛接球，零尖叫，零训练。来球场主要是为了社交和喝冰饮。但没关系，开心就好。',
    tags: ['温柔发球', '佛系接球', '冷酷沉默', '摆烂大师']
  }
];

// ============ 计分逻辑 ============
function calculateResult(answers) {
  // answers: array of codes like ['S','s','R','r','V','v','M','m']
  // returns species object
  var scores = { S: 0, s: 0, R: 0, r: 0, V: 0, v: 0, M: 0, m: 0 };
  answers.forEach(function(code) {
    if (scores.hasOwnProperty(code)) scores[code]++;
  });

  // build 4-letter code
  var code = '';
  code += scores['S'] >= scores['s'] ? 'S' : 's';
  code += scores['R'] >= scores['r'] ? 'R' : 'r';
  code += scores['V'] >= scores['v'] ? 'V' : 'v';
  code += scores['M'] >= scores['m'] ? 'M' : 'm';

  // find matching species
  var result = species.find(function(sp) { return sp.code === code; });
  return result || species[0];
}

// ============ 排行榜数据 (云开发备选用) ============
const rankingsData = [
  { rank: 1, player: '虎', totalPoints: 500, eventPoints: 500 },
  { rank: 2, player: '十月十七', totalPoints: 325, eventPoints: 325 },
  { rank: 3, player: 'Jeff', totalPoints: 195, eventPoints: 195 },
  { rank: 4, player: 'Joey', totalPoints: 195, eventPoints: 195 },
  { rank: 5, player: '商店', totalPoints: 108, eventPoints: 108 },
  { rank: 6, player: '辛辣', totalPoints: 108, eventPoints: 108 },
  { rank: 7, player: '张丞恩', totalPoints: 108, eventPoints: 108 },
  { rank: 8, player: 'Danwen', totalPoints: 108, eventPoints: 108 },
  { rank: 9, player: 'BQ', totalPoints: 60, eventPoints: 60 },
  { rank: 10, player: 'Nico', totalPoints: 60, eventPoints: 60 },
  { rank: 11, player: 'PasteJ', totalPoints: 60, eventPoints: 60 },
  { rank: 12, player: 'RR', totalPoints: 60, eventPoints: 60 },
  { rank: 13, player: 'Simon', totalPoints: 32, eventPoints: 32 },
  { rank: 14, player: 'Nelson', totalPoints: 32, eventPoints: 32 },
  { rank: 15, player: 'Evan', totalPoints: 32, eventPoints: 32 },
  { rank: 16, player: '小仂', totalPoints: 32, eventPoints: 32 }
];

// ============ NTRP等级表 ============
const ntrpLevels = [
  { value: '2.0', name: '入门 Newcomer', desc: '刚接触网球，还在找球感' },
  { value: '2.5', name: '初级 Beginner', desc: '基本能对拉，偶尔能打回合' },
  { value: '3.0', name: '中级 Intermediate', desc: '能打比赛，有基本战术' },
  { value: '3.5', name: '中高级 Advanced', desc: '战术意识成熟，稳定性不错' },
  { value: '4.0', name: '高级 Competitor', desc: '竞技水平，打法有特色' },
  { value: '4.5', name: '高级+ Player', desc: '俱乐部主力，技术全面' },
  { value: '5.0', name: '精英 Expert', desc: '业余顶尖，接近半职业' },
  { value: '5.5+', name: '半职业 Semi-Pro', desc: '接近职业水平' }
];

module.exports = {
  dimensions,
  questions,
  species,
  rankingsData,
  ntrpLevels,
  calculateResult
};

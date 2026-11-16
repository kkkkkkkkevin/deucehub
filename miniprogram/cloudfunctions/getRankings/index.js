// cloudfunctions/getRankings/index.js
// 云函数：获取积分排行数据
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const db = cloud.database()
  const sortBy = event.sortBy || 'totalPoints'

  try {
    const result = await db.collection('rankings')
      .orderBy(sortBy, 'desc')
      .limit(100)
      .get()

    return {
      code: 0,
      data: result.data
    }
  } catch (err) {
    // 集合不存在时返回空数组，前端会 fallback 到本地数据
    return {
      code: 0,
      data: []
    }
  }
}

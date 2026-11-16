// cloudfunctions/initRankings/index.js
// 云函数：初始化排行数据到云数据库
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const initialData = [
  { player: '虎', totalPoints: 500, eventPoints: 500 },
  { player: '十月十七', totalPoints: 325, eventPoints: 325 },
  { player: 'Jeff', totalPoints: 195, eventPoints: 195 },
  { player: 'Joey', totalPoints: 195, eventPoints: 195 },
  { player: '商店', totalPoints: 108, eventPoints: 108 },
  { player: '辛辣', totalPoints: 108, eventPoints: 108 },
  { player: '张丞恩', totalPoints: 108, eventPoints: 108 },
  { player: 'Danwen', totalPoints: 108, eventPoints: 108 },
  { player: 'BQ', totalPoints: 60, eventPoints: 60 },
  { player: 'Nico', totalPoints: 60, eventPoints: 60 },
  { player: 'PasteJ', totalPoints: 60, eventPoints: 60 },
  { player: 'RR', totalPoints: 60, eventPoints: 60 },
  { player: 'Simon', totalPoints: 32, eventPoints: 32 },
  { player: 'Nelson', totalPoints: 32, eventPoints: 32 },
  { player: 'Evan', totalPoints: 32, eventPoints: 32 },
  { player: '小仂', totalPoints: 32, eventPoints: 32 }
]

exports.main = async (event, context) => {
  const db = cloud.database()

  // 先清空旧数据
  try {
    const old = await db.collection('rankings').get()
    for (const item of old.data) {
      await db.collection('rankings').doc(item._id).remove()
    }
  } catch (e) {
    // 忽略错误
  }

  // 插入新数据
  const results = []
  for (const item of initialData) {
    const res = await db.collection('rankings').add({ data: item })
    results.push(res._id)
  }

  return {
    code: 0,
    message: '初始化成功，共插入 ' + results.length + ' 条记录',
    ids: results
  }
}

// pages/mbti/result.js
const mbtiData = require('../../utils/mbti-data.js')

Page({
  data: {
    result: null,
    dimResults: []
  },

  onLoad: function () {
    const app = getApp()
    const result = app.globalData.mbtiResult || mbtiData.species[0]

    // 解析四维结果
    const code = result.code
    const dimResults = mbtiData.dimensions.map(function (dim, i) {
      var letter = code[i]
      var isLeft = letter === letter.toUpperCase()
      return {
        key: dim.key,
        name: dim.name,
        leftLabel: dim.leftLabel,
        rightLabel: dim.rightLabel,
        winner: isLeft ? dim.leftLabel : dim.rightLabel,
        isLeftWin: isLeft
      }
    })

    this.setData({ result: result, dimResults: dimResults })
  },

  onRetry: function () {
    wx.redirectTo({ url: '/pages/mbti/quiz' })
  },

  onShareAppMessage: function () {
    return {
      title: '我的网球人格是' + this.data.result.name + '！火力值' + this.data.result.firePower,
      path: '/pages/mbti/index',
      imageUrl: this.data.result.img
    }
  }
})

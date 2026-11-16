// pages/profile/index.js
const mbtiData = require('../../utils/mbti-data.js')
var IMG_BASE = 'https://ef035ccdb67a4a548a34d439537757ce.app.codebuddy.work'

Page({
  data: {
    avatar: IMG_BASE + '/avatar.jpg',
    nickname: '',
    ntrpLevel: '3.0',
    ntrpName: '',
    ntrpLevels: mbtiData.ntrpLevels,
    totalPoints: 0,
    eventPoints: 0,
    matchRecords: [],
    matchCount: 0,
    winRate: 0,
    mbtiResult: null
  },

  onLoad: function () {
    this.loadUserData()
  },

  onShow: function () {
    this.loadUserData()
  },

  loadUserData: function () {
    const app = getApp()
    const ntrp = mbtiData.ntrpLevels.find(function (l) { return l.value === app.globalData.ntrpLevel })

    const records = app.globalData.matchRecords || []
    const wins = records.filter(function (r) { return r.win }).length
    const winRate = records.length > 0 ? Math.round((wins / records.length) * 100) : 0

    this.setData({
      nickname: (app.globalData.userInfo && app.globalData.userInfo.nickname) || '',
      ntrpLevel: app.globalData.ntrpLevel || '3.0',
      ntrpName: ntrp ? ntrp.name : '',
      totalPoints: app.globalData.totalPoints || 0,
      eventPoints: (app.globalData.userInfo && app.globalData.userInfo.eventPoints) || 0,
      matchRecords: records,
      matchCount: records.length,
      winRate: winRate,
      mbtiResult: app.globalData.mbtiResult
    })
  },

  onEditName: function () {
    var self = this
    wx.showModal({
      title: '设置昵称',
      editable: true,
      placeholderText: '请输入昵称',
      content: this.data.nickname,
      success: function (res) {
        if (res.confirm && res.content) {
          var app = getApp()
          if (!app.globalData.userInfo) app.globalData.userInfo = {}
          app.globalData.userInfo.nickname = res.content
          app.saveUserData()
          self.setData({ nickname: res.content })
        }
      }
    })
  },

  onEditNTRP: function () {
    // 滚动到NTRP列表
    wx.pageScrollTo({ scrollTop: 9999, duration: 300 })
  },

  onSelectNTRP: function (e) {
    var value = e.currentTarget.dataset.value
    var app = getApp()
    app.globalData.ntrpLevel = value
    app.saveUserData()

    var ntrp = mbtiData.ntrpLevels.find(function (l) { return l.value === value })
    this.setData({
      ntrpLevel: value,
      ntrpName: ntrp ? ntrp.name : ''
    })

    wx.showToast({ title: '已设置 NTRP ' + value, icon: 'success' })
  },

  onViewPersonality: function () {
    if (this.data.mbtiResult) {
      wx.navigateTo({ url: '/pages/mbti/result' })
    } else {
      wx.switchTab({ url: '/pages/mbti/index' })
    }
  }
})

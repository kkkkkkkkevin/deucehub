// app.js
App({
  globalData: {
    userInfo: null,
    ntrpLevel: '3.0',
    mbtiResult: null,
    totalPoints: 0,
    matchRecords: []
  },

  onLaunch: function () {
    // 初始化云开发（需先在开发者工具中开通云开发）
    if (wx.cloud) {
      try {
        wx.cloud.init({
          env: 'your-env-id', // 替换为你的云开发环境ID
          traceUser: true
        })
      } catch (e) {
        console.warn('云开发未配置，排行功能将使用本地数据', e)
      }
    }

    // 从本地缓存恢复用户数据
    this.loadUserData()
  },

  loadUserData: function () {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.globalData.userInfo = userInfo
        this.globalData.ntrpLevel = userInfo.ntrpLevel || '3.0'
        this.globalData.mbtiResult = userInfo.mbtiResult || null
        this.globalData.totalPoints = userInfo.totalPoints || 0
        this.globalData.matchRecords = userInfo.matchRecords || []
      }
    } catch (e) {
      console.error('读取用户数据失败', e)
    }
  },

  saveUserData: function () {
    try {
      const data = {
        userInfo: this.globalData.userInfo,
        ntrpLevel: this.globalData.ntrpLevel,
        mbtiResult: this.globalData.mbtiResult,
        totalPoints: this.globalData.totalPoints,
        matchRecords: this.globalData.matchRecords
      }
      wx.setStorageSync('userInfo', data)
    } catch (e) {
      console.error('保存用户数据失败', e)
    }
  }
})

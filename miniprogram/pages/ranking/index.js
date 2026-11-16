// pages/ranking/index.js
const mbtiData = require('../../utils/mbti-data.js')

Page({
  data: {
    activeTab: 'totalPoints',
    rankings: [],
    updateTime: ''
  },

  onLoad: function () {
    this.setData({ updateTime: this.formatTime(new Date()) })
    this.fetchRankings()
  },

  onPullDownRefresh: function () {
    this.fetchRankings()
    wx.stopPullDownRefresh()
  },

  fetchRankings: function () {
    // 尝试从云开发获取数据
    if (wx.cloud && wx.cloud.callFunction) {
      wx.cloud.callFunction({
        name: 'getRankings',
        data: { sortBy: this.data.activeTab }
      }).then(res => {
        if (res.result && res.result.data && res.result.data.length > 0) {
          this.sortAndSet(res.result.data)
        } else {
          this.useLocalData()
        }
      }).catch(err => {
        console.log('云函数调用失败，使用本地数据', err)
        this.useLocalData()
      })
    } else {
      this.useLocalData()
    }
  },

  useLocalData: function () {
    var data = mbtiData.rankingsData.map(function (item) {
      return Object.assign({}, item)
    })
    this.sortAndSet(data)
  },

  sortAndSet: function (data) {
    var tab = this.data.activeTab
    data.sort(function (a, b) {
      return b[tab] - a[tab]
    })
    this.setData({ rankings: data })
  },

  onSwitchTab: function (e) {
    var tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab })
    this.fetchRankings()
  },

  formatTime: function (date) {
    var y = date.getFullYear()
    var m = (date.getMonth() + 1).toString().padStart(2, '0')
    var d = date.getDate().toString().padStart(2, '0')
    var h = date.getHours().toString().padStart(2, '0')
    var min = date.getMinutes().toString().padStart(2, '0')
    return y + '-' + m + '-' + d + ' ' + h + ':' + min
  }
})

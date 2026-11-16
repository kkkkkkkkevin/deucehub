// pages/mbti/index.js
const mbtiData = require('../../utils/mbti-data.js')

Page({
  data: {
    dimensions: mbtiData.dimensions,
    speciesList: mbtiData.species,
    hasResult: false
  },

  onLoad: function () {
    const app = getApp()
    if (app.globalData.mbtiResult) {
      this.setData({ hasResult: true })
    }
  },

  onShow: function () {
    const app = getApp()
    this.setData({ hasResult: !!app.globalData.mbtiResult })
  },

  onStart: function () {
    wx.navigateTo({ url: '/pages/mbti/quiz' })
  },

  onPreviewSpecies: function (e) {
    const id = e.currentTarget.dataset.id
    const species = mbtiData.species.find(s => s.id === id)
    if (species) {
      wx.showModal({
        title: species.name + ' (火力' + species.firePower + ')',
        content: species.desc,
        showCancel: false,
        confirmText: '知道了'
      })
    }
  }
})

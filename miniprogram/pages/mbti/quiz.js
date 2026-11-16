// pages/mbti/quiz.js
const mbtiData = require('../../utils/mbti-data.js')

Page({
  data: {
    questions: mbtiData.questions,
    dimensions: mbtiData.dimensions,
    currentIndex: 0,
    totalQuestions: mbtiData.questions.length,
    currentQuestion: mbtiData.questions[0],
    currentDim: mbtiData.dimensions[0],
    selectedOption: '',
    answers: [],
    progressPercent: 0,
    animClass: ''
  },

  onLoad: function () {
    this.updateProgress()
  },

  updateProgress: function () {
    const percent = (this.data.currentIndex / this.data.totalQuestions) * 100
    this.setData({ progressPercent: percent })
  },

  onSelect: function (e) {
    const option = e.currentTarget.dataset.option
    const q = this.data.currentQuestion
    const code = option === 'A' ? q.optionA.code : q.optionB.code

    // 记录答案
    const answers = [...this.data.answers]
    answers[this.data.currentIndex] = code

    this.setData({
      selectedOption: option,
      answers: answers
    })

    // 延迟后进入下一题
    setTimeout(() => {
      if (this.data.currentIndex < this.data.totalQuestions - 1) {
        this.nextQuestion()
      } else {
        this.showResult()
      }
    }, 400)
  },

  nextQuestion: function () {
    const nextIndex = this.data.currentIndex + 1
    this.setData({
      currentIndex: nextIndex,
      currentQuestion: this.data.questions[nextIndex],
      currentDim: this.data.dimensions.find(d => d.key === this.data.questions[nextIndex].dim),
      selectedOption: this.data.answers[nextIndex] ? this.getOptionByCode(nextIndex) : '',
      animClass: 'slide-in'
    })
    this.updateProgress()
    // 清除动画类
    setTimeout(() => this.setData({ animClass: '' }), 400)
  },

  getOptionByCode: function (index) {
    const code = this.data.answers[index]
    const q = this.data.questions[index]
    if (q.optionA.code === code) return 'A'
    if (q.optionB.code === code) return 'B'
    return ''
  },

  onPrev: function () {
    if (this.data.currentIndex > 0) {
      const prevIndex = this.data.currentIndex - 1
      this.setData({
        currentIndex: prevIndex,
        currentQuestion: this.data.questions[prevIndex],
        currentDim: this.data.dimensions.find(d => d.key === this.data.questions[prevIndex].dim),
        selectedOption: this.getOptionByCode(prevIndex),
        animClass: ''
      })
      this.updateProgress()
    }
  },

  showResult: function () {
    // 计算结果
    const result = mbtiData.calculateResult(this.data.answers)

    // 保存到全局
    const app = getApp()
    app.globalData.mbtiResult = result
    app.saveUserData()

    // 跳转结果页
    wx.redirectTo({
      url: '/pages/mbti/result'
    })
  }
})

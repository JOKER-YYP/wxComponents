// pages/home/hoem.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  goAddForm() {
    wx.navigateTo({
      url: '/pages/addForm/addForm',
    })
  },

  goCalendar() {
    wx.navigateTo({
      url: '/pages/calendar/calendar',
    })
  },

  goTabs() {
    wx.navigateTo({
      url: '/pages/tabs/tabs',
    })
  },

  goWatch() {
    wx.navigateTo({
      url: '/pages/watch/watch',
    })
  },

  goFab() {
    wx.navigateTo({
      url: '/pages/fab/fab',
    })
  },

  goNavbar() {
    wx.navigateTo({
      url: '/pages/navbar/navbar',
    })
  },

  goAIChat() {
    wx.navigateTo({
      url: '/pages/aiChat/aiChat',
    })
  },

  goBackToTop() {
    wx.navigateTo({
      url: '/pages/backToTop/backToTop',
    })
  },

  goCard() {
    wx.navigateTo({
      url: '/pages/cardPage/cardPage',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    getApp().globalData.tabBarSelectedIndex = 0 // 当前页面对应的索引
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
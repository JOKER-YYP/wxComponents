// pages/cardPage/cardPage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardList: [],
    baseURL: "https://dimg04.c-ctrip.com", // 模拟基础URL，这里用的携程的图片
    currentIndex: 0,  // 当前卡片的index
    swiperImgIndex: 0, // 当前swiper图片的index
    currentPage: 1, // 当前页码
    pageSize: 5,  // 每次加载的item数量
    isLastPage: false, // 是否是最后一页
    cardItem: {}
  },

  // 卡片滑动切换
  cardChange(event) {
    const { current } = event.detail
    const { cardList } = this.data
    
    // 判断是否滑到底部
    if (current === cardList.length - 1) {
      this.loadMoreItems()
    }
    
    this.setData({
      cardItem: this.data.cardList[current],
      currentIndex: current,
      swiperImgIndex: 0,
      faved: this.data.cardList[current].hasFavorite || false
    })
  },

  swiperChange(e) {
    const { index } = e.currentTarget.dataset
    const { current } = e.detail
    let cardList = this.data.cardList
    cardList[index].swiperImgIndex = current
    this.setData({
      cardList: cardList
    })
  },

  selectImg(e) {
    const { item, index } = e.currentTarget.dataset
    let cardList = this.data.cardList
    cardList[item].swiperImgIndex = index
    this.setData({
      cardList: cardList
    })
  },

  // 触底加载更多
  loadMoreItems() {
    const { currentPage, isLastPage } = this.data
    if (isLastPage) {
      wx.showToast({
        title: '已经到底啦~',
        icon: 'none'
      })
      return
    }
    this.setData({
      currentPage: currentPage + 1
    },() => this.getCardList())
  },

  // 生成模拟数据
  generateMockData(count) {
    const mockData = [];
    const categories = ['放心游', '无购物', '成团保障', '赠取消险'];
    const features = ['特色表演', '飞机往返', '含导游服务', '国庆大促', '超值跟团'];
    const locations = [
      { province: '北京', city: '北京市' },
      { province: '上海', city: '上海市' },
      { province: '广东', city: '广州市' },
      { province: '浙江', city: '杭州市' },
      { province: '江苏', city: '南京市' }
    ];
    const sellingPoints = ['优选行程','缤纷景点','度假首选','服务保障']
    
    for (let i = 0; i < count; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const categoryCount = Math.floor(Math.random() * 2) + 1;
      const featureCount = Math.floor(Math.random() * 3) + 1;
      const sellingCount = Math.floor(Math.random() * 4);
      
      mockData.push({
        horizontal_shows: [
          { url: '/images/100p0b00000057x0o1540_D_769_510_Q100.jpg' },
          { url: '/images/0306812000ct5ntbv7EEC_D_769_510_Q100.jpg' },
          { url: '/images/100h0n000000e2mtq23B4_D_769_510_Q100.jpg' }
        ],
        price: Math.floor(Math.random() * 1000) + 100,
        startdate: this.formatDate(new Date()),
        enddate: this.formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        id: 1000 + i,
        ellipsis: `模拟活动标题 ${i + 1} - 这是一个非常有趣的活动体验`,
        location_city: location.city,
        location_province: location.province,
        activity_mode: Math.random() > 0.5 ? '提供' : '不提供',
        activity_type: categories[Math.floor(Math.random() * categories.length)],
        title: `模拟活动标题 ${i + 1}`,
        clusterStatus: ['NOT_CLUSTER', 'IS_CLUSTER', 'FINISHED'][Math.floor(Math.random() * 3)],
        sellingPoint: sellingPoints[sellingCount],
        categoryList: Array.from({length: categoryCount}, (_, idx) => ({
          categoryId: idx + 1,
          name: categories[idx]
        })),
        generalFeatureList: Array.from({length: featureCount}, (_, idx) => features[idx]),
        swiperImgIndex: 0,
        hasFavorite: Math.random() > 0.5
      });
    }
    
    return mockData;
  },

  // 格式化日期
  formatDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  },

  // 数据格式处理
  dataTransform(arr) {
    return arr.map(item => {
      let ellipsis = item.title.length > 20 ? item.title.slice(0, 19) + '...' : item.title
      return {
        ...item,
        ellipsis
      };
    });
  },

  // 获取数据列表 - 模拟版本
  getCardList() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    
    // 模拟网络请求延迟
    setTimeout(() => {
      const newData = this.generateMockData(this.data.pageSize);
      const transformedData = this.dataTransform(newData);
      
      this.setData({
        cardList: [...this.data.cardList, ...transformedData],
        isLastPage: this.data.currentPage >= 3, // 模拟只有3页数据
      }, () => {
        wx.hideLoading();
        console.log(this.data.cardList);
        this.setData({
          cardItem: this.data.cardList[this.data.currentIndex] || {}
        });
      });
    }, 800);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getCardList()
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
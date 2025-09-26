// components/y-navbar/y-navbar.js
Component({
  /**
   * 组件属性列表
   */
  properties: {
    leftc: { // 是否显示返回按钮
      type: Boolean,
      value: true
    },
    id: { // 组件ID
      type: Number,
      value: undefined
    },
    title: { // 导航栏标题
      type: String,
      value: undefined
    },
    background: { // 导航栏背景色
      type: String,
      value: '#fff'
    },
    btnBgc: { // 按钮背景色
      type: String,
      value: 'rgba(255,255,255,0.7)'
    },
    border: { // 按钮边框样式
      type: String,
      value: 'solid 1rpx #d1d6c8'
    },
    titleColor: { // 标题颜色
      type: String,
      value: '#333333'
    },
    titleAlign: { // 标题对齐方式
      type: String,
      value: 'center' // center/left
    },
    leftButtons: { // 左侧按钮配置
      type: Array,
      value: []
    }
  },

  /**
   * 组件初始数据
   */
  data: {
    
  },

  /**
   * 组件方法列表
   */
  methods: {
    // 返回按钮点击事件
    backar() {
      let res = getCurrentPages()
      if (res.length == 1) {
        wx.switchTab({
          url: '/pages/home/home',
        })
      } else {
        wx.navigateBack({
          delta: 1,
        })
      }
    },
    
    // 左侧按钮点击事件
    onLeftButtonClick(e) {
      const index = e.currentTarget.dataset.index;
      const button = this.data.leftButtons[index];
      
      if (button.type === 'back') {
        this.backar();
      } else {
        this.triggerEvent('leftbuttonclick', { index, ...button });
      }
    }
  },
  
  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function() {
      // 获取系统信息
      let systemInfo = wx.getSystemInfoSync()
      // 获取菜单按钮位置信息
      let menuBut = wx.getMenuButtonBoundingClientRect()
      
      // 计算导航栏高度
      let statusbarheight = systemInfo.statusBarHeight
      let capsuleheight = menuBut.height
      let capsuletop = menuBut.top
      let navbarheight = (capsuletop - statusbarheight) * 2 + capsuleheight + statusbarheight

      // 计算按钮位置
      const { height, top } = menuBut
      const left = systemInfo.windowWidth - menuBut.right
      const menumargin = capsuletop - statusbarheight
      
      // 计算图标尺寸
      const imgheight = height - 6
      const imgrate = 102 / 209 // 图标宽高比
      const leftarwidth = imgheight * imgrate

      // 设置组件数据
      this.setData({
        height,
        left,
        top,
        imgheight,
        leftarwidth,
        navbarheight,
        statusbarheight,
        menumargin
      })
    }
  }
})
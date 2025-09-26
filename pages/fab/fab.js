// pages/fab/fab.js
Page({
  data: {
    currentTypeName: '基础悬浮按钮',
    fabConfig: {
      icon: '/assets/fav.png',
      text: '',
      draggable: false,
      yBounds: [],
      style: '',
      customStyle: ''
    },
    
    // 所有按钮类型配置
    fabTypes: {
      basic: {
        name: '基础悬浮按钮',
        icon: '/assets/fav.png',
        text: '',
        draggable: false,
        yBounds: [],
        style: '',
        customStyle: ''
      },
      text: {
        name: '带文字按钮',
        icon: '/assets/fav.png',
        text: '收藏',
        draggable: false,
        yBounds: [],
        style: '',
        customStyle: ''
      },
      vertical: {
        name: '垂直拖动按钮',
        icon: '',
        text: '上移',
        draggable: 'vertical',
        yBounds: [100, 600],
        style: '',
        customStyle: ''
      },
      free: {
        name: '自由拖动按钮',
        icon: '',
        text: '拖动我',
        draggable: 'all',
        yBounds: [],
        style: '',
        customStyle: ''
      },
      custom: {
        name: '自定义样式按钮',
        icon: '',
        text: '收藏',
        draggable: false,
        yBounds: [],
        style: 'background-color: #ff9500; color: #fff;',
        customStyle: 'box-shadow: 0 4rpx 12rpx rgba(255, 149, 0, 0.5);'
      }
    }
  },
  
  onLoad() {
    // 初始化为基础按钮
    this.switchType({ currentTarget: { dataset: { type: 'basic' } } });
  },
  
  // 切换悬浮按钮类型
  switchType(e) {
    const type = e.currentTarget.dataset.type;
    const config = this.data.fabTypes[type];
    
    this.setData({
      currentTypeName: config.name,
      fabConfig: config
    });
    
    wx.showToast({
      title: `已切换为${config.name}`,
      icon: 'none'
    });
  },
  
  // 悬浮按钮点击事件
  onFabClick(e) {
    console.log(111);
    wx.showToast({
      title: `${this.data.currentTypeName}被点击`,
      icon: 'none'
    });
  },
  
  // 开始拖拽事件
  onDragStart(e) {
    console.log('开始拖拽', e.detail);
  },
  
  // 结束拖拽事件
  onDragEnd(e) {
    console.log('结束拖拽', e.detail);
  }
});
// pages/navbar/navbar.js
Page({
  data: {
    navbarTitle: "导航栏演示",
    titleAlign: "center",
    border: 'undefined',
    background: 'undefined',
    leftButtons: []
  },
  
  setTitleAlign(e) {
    const align = e.currentTarget.dataset.align;
    this.setData({
      titleAlign: align
    });
  },
  
  setLeftButtons(e) {
    const type = e.currentTarget.dataset.type;
    let buttons = [];
    
    switch(type) {
      case 'default':
        buttons = [];
        break;
      case 'single':
        buttons = [
          { 
            icon: "/assets/back.png", 
            text: ""
          }
        ];
        break;
      case 'multiple':
        buttons = [
          { 
            icon: "/assets/back.png", 
            text: ""
          },
          { 
            icon: "/assets/edit.png", 
            text: "",
            width: 20,
            height: 20
          }
        ];
        break;
    }
    
    this.setData({
      leftButtons: buttons
    });
  },
  
  setBorder(e) {
    const type = e.currentTarget.dataset.type;
    let border
    
    switch(type) {
      case 'default':
        border = 'undefined'
        break;
      case 'none':
        border = 'none'
        break;
      case 'custom':
        border = '1rpx solid #1677ff'
        break;
    }
    
    this.setData({
      border
    });
  },

  setBackground(e) {
    const type = e.currentTarget.dataset.type;
    let background
    
    switch(type) {
      case 'default':
        background = 'undefined'
        break;
      case 'custom':
        background = 'linear-gradient(to bottom, #1677ff2A, #fff)'
        break;
    }
    
    this.setData({
      background
    });
  },
  
  onLeftButtonClick(e) {
    const { index, text } = e.detail;
    wx.showToast({
      title: `点击左侧按钮: ${text || '按钮' + (index + 1)}`,
      icon: 'none'
    });
  },
  
  onLoad() {
    let systemInfo = wx.getSystemInfoSync()
    let menuBut = wx.getMenuButtonBoundingClientRect()

    // px转换到rpx的比例
    let pxToRpxScale = 750 / systemInfo.windowWidth;

    let statusbarheight = systemInfo.statusBarHeight
    let capsuleheight = menuBut.height
    let capsuletop = menuBut.top
    let navbarheight = (capsuletop - statusbarheight) * 2 + capsuleheight + statusbarheight
    let tabHeight = navbarheight * pxToRpxScale
    this.setData({
      tabHeight
    })
  }
});
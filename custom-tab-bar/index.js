// custom-tab-bar/index.js
// 在使用页面引入 /utils/setTabBar
// 在onLoad中调用 setTabBar.call(this, 0)
Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/home/home",
        text: "组件",
        iconPath: "/assets/home.png",
        selectedIconPath: "/assets/home-active.png"
      },
      {
        pagePath: "/pages/index/index",
        text: "功能",
        iconPath: "/assets/function.png",
        selectedIconPath: "/assets/function-active.png"
      }
    ]
  },
  
  lifetimes: {
    attached() {
      
    }
  },
  
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      
      wx.switchTab({ url })
    }
  }
});

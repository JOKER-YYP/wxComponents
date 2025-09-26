// custom-tab-bar/index.js
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
      // 从全局状态获取当前选中索引
      const app = getApp();
      if (app.globalData.tabBarSelectedIndex !== undefined) {
        this.setData({
          selected: app.globalData.tabBarSelectedIndex
        });
      }
    }
  },
  
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      const index = data.index;
      
      // 更新全局选中状态
      const app = getApp()
      app.globalData.tabBarSelectedIndex = index
      
      wx.switchTab({ url }, () => {
        this.setData({
          selected: app.globalData.tabBarSelectedIndex
        }, () => {
          console.log(this.data.selected);
        });
      });
    }
  }
});

// pages/backToTop/backToTop.js
Page({
  data: {
    list: Array(50).fill('')
  },

  onPageScroll(e) {
    // 直接调用组件方法，不再需要存储组件实例
    const backToTop = this.selectComponent('#backToTop');
    if (backToTop) {
      // 添加防抖
      if (this.scrollTimer) clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        backToTop.onScroll(e.scrollTop);
      }, 100);
    }
  },

  onReturnTop() {
    console.log('回到顶部事件触发');
    // 可以在这里添加统计等逻辑
  }
});
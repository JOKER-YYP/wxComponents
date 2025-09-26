// components/y-back-to-top/y-back-to-top.js
Component({
  properties: {
    threshold: {
      type: Number,
      value: 500 // 默认滚动500rpx后显示
    },
    shape: {
      type: String,
      value: 'circle' // 方形：square
    },
    border: {
      type: Boolean,
      value: false
    },
    bottom: {
      type: String,
      value: '250rpx'
    },
    right: {
      type: String,
      value: '40rpx'
    }
  },

  data: {
    show: false
  },

  methods: {
    handleReturnTop() {
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 400
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，暂无法使用该功能，请升级后重试。'
        });
      }
      this.triggerEvent('returntop');
    },

    // 处理滚动逻辑的方法
    onScroll(scrollTop) {
      const systemInfo = wx.getSystemInfoSync();
      const rpxRatio = systemInfo.windowWidth / 750;
      const thresholdPx = this.properties.threshold * rpxRatio;
      
      const shouldShow = scrollTop > thresholdPx;
      if (shouldShow !== this.data.show) {
        this.setData({ show: shouldShow });
      }
    }
  }
});
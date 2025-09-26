// components/y-lazy-img/y-lazy-img.js
Component({
  properties: {
    imageUrl: String,
    placeholder: {
      type: String,
      value: '../../assets/loading.png'
    },
    width: {
      type: Number,
      value: 100
    },
    height: {
      type: Number,
      value: 100
    },
    sty: {
      type: String,
      value: ''
    },
    // 添加图片加载失败时的占位图
    errorPlaceholder: {
      type: String,
      value: '../../assets/error.png' // 失败的图片地址
    }
  },

  data: {
    showImage: false,
    loaded: false,
    loadFailed: false, // 图片加载失败标志
    aspectRatio: '100%' // 宽高比
  },

  observers: {
    'width, height': function(width, height) {
      if (width && height) {
        this.setData({
          aspectRatio: `${(height / width * 100).toFixed(2)}%`
        });
      }
    }
  },

  methods: {
    // 图片加载成功处理
    handleImageLoad(e) {
      this.setData({
        loaded: true,
        loadFailed: false
      });
      
      // 获取图片实际尺寸
      const { width, height } = e.detail;
      this.triggerEvent('onLoad', { width, height });
    },
    
    // 图片加载失败处理
    handleImageError() {
      this.setData({
        loadFailed: true,
        loaded: false
      });
      this.triggerEvent('onError');
    },
    
    // 手动触发图片加载（外部调用）
    manualLoadImage() {
      if (!this.data.loaded && !this.data.loadFailed) {
        this.setData({ showImage: true });
      }
    }
  },

  lifetimes: {
    attached() {
      // 创建 IntersectionObserver 实例
      this.observer = this.createIntersectionObserver({
        thresholds: [0.01],
        observeAll: true
      });
      
      // 监听组件进入视口
      this.observer.relativeToViewport().observe('.lazy-image', (res) => {
        if (res.intersectionRatio > 0 && !this.data.loaded && !this.data.loadFailed) {
          this.setData({ showImage: true });
          this.observer.disconnect();
        }
      });
    },
    
    detached() {
      // 组件卸载时清理观察器
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }
});

// components/y-loading/y-loading.js
Component({
  properties: {
    // 加载类型：icon(纯图标), dot(三个点), horizontal(图标+文字横向), vertical(图标+文字竖向)
    type: {
      type: String,
      value: 'icon'
    },
    
    // 加载文字提示
    text: {
      type: String,
      value: '加载中...'
    },
    
    // 图标大小（单位rpx）
    size: {
      type: Number,
      value: 60
    },
    
    // 自定义图标路径
    iconPath: {
      type: String,
      value: '/assets/loading.png'
    }
  },
  
  data: {

  },
})


// components/y-fab/y-fab.js
Component({
  // 组件属性列表
  properties: {
    // 基础样式对象
    style: { 
      type: Object, 
      value: {} 
    },
    // 自定义样式对象
    customStyle: { 
      type: Object, 
      value: {} 
    },
    // 是否可拖拽（支持布尔值或方向限制）
    draggable: { 
      type: [Boolean, String], 
      value: false 
    },
    // 按钮图标（支持字体图标或图片路径）
    icon: { 
      type: String, 
      value: '' 
    },
    // 按钮文字
    text: { 
      type: String, 
      value: '' 
    },
    // 是否使用自定义导航栏（影响位置计算）
    usingCustomNavbar: { 
      type: Boolean, 
      value: false 
    },
    // 水平拖拽边界限制 [minX, maxX]
    xBounds: { 
      type: Array, 
      value: [] 
    },
    // 垂直拖拽边界限制 [minY, maxY]
    yBounds: { 
      type: Array, 
      value: [] 
    }
  },

  data: {
    dragging: false,          // 当前是否正在拖拽
    positionStyle: '',        // 位置样式字符串
    startX: 0,               // 拖拽起始点X坐标
    startY: 0,               // 拖拽起始点Y坐标
    iconType: 'font',        // 图标类型（font字体图标/image图片）
    currentX: 0,             // 当前X位置
    currentY: 0              // 当前Y位置
  },

  lifetimes: {
    attached() {
      // 判断图标类型（包含'/'视为图片路径）
      if (this.data.icon && this.data.icon.includes('/')) {
        this.setData({ iconType: 'image' });
      }
      
      // 获取系统信息计算默认位置
      const systemInfo = wx.getSystemInfoSync();
      // 计算屏幕高度（考虑自定义导航栏）
      const screenHeight = this.data.usingCustomNavbar ? 
        systemInfo.screenHeight : systemInfo.windowHeight;
      
      // 计算右下角默认位置（距右边24px，距底部100px）
      const defaultX = systemInfo.screenWidth - 56 - 24;
      const defaultY = screenHeight - 56 - 100;
      
      // 设置初始位置
      this.setData({
        currentX: defaultX,
        currentY: defaultY,
        positionStyle: `right: 24px; top: ${defaultY}px;`
      });

      // 计算默认边界
      this.calculateDefaultBounds(systemInfo, screenHeight);
    },
    ready() {
      // 组件就绪后再次检查边界（确保DOM已渲染）
      const systemInfo = wx.getSystemInfoSync();
      const screenHeight = this.data.usingCustomNavbar ? 
        systemInfo.screenHeight : systemInfo.windowHeight;
      this.calculateDefaultBounds(systemInfo, screenHeight);
    }
  },

  // 组件方法
  methods: {
    // 计算默认边界
    calculateDefaultBounds(systemInfo, screenHeight) {
      // 获取按钮实际尺寸
      const query = this.createSelectorQuery();
      query.select('.fab-button').boundingClientRect(rect => {
        if (rect) {
          const buttonWidth = rect.width;
          const buttonHeight = rect.height;
          
          // 设置默认边界（确保不超出屏幕）
          const defaultXBounds = [0, systemInfo.screenWidth - buttonWidth];
          const defaultYBounds = [0, screenHeight - buttonHeight];
          
          this.setData({
            internalXBounds: defaultXBounds,
            internalYBounds: defaultYBounds
          });
        }
      }).exec();
    },
    
    // 点击事件处理
    onTap(e) {
      console.log(2222);
      this.triggerEvent('click', { e });
    },

    // 触摸开始事件（开始拖拽）
    onTouchStart(e) {
      if (!this.isDraggable()) return;
      
      const touch = e.touches[0];
      this.setData({
        dragging: true,
        startX: touch.clientX,
        startY: touch.clientY
      });
      
      // 触发拖拽开始事件
      this.triggerEvent('drag-start', { e });
    },

    // 触摸移动事件（拖拽中）
    onTouchMove(e) {
      if (!this.data.dragging || !this.isDraggable()) return;
      
      const touch = e.touches[0];
      // 计算移动距离
      const deltaX = touch.clientX - this.data.startX;
      const deltaY = touch.clientY - this.data.startY;
      
      // 计算新位置
      let newX = this.data.currentX + deltaX;
      let newY = this.data.currentY + deltaY;
      
      // 方向限制处理
      if (this.data.draggable === 'vertical') newX = this.data.currentX;
      if (this.data.draggable === 'horizontal') newY = this.data.currentY;
      
      // 边界检查（优先使用用户设置，其次使用内部默认边界）
      const xBounds = this.data.xBounds.length ? this.data.xBounds : this.data.internalXBounds;
      const yBounds = this.data.yBounds.length ? this.data.yBounds : this.data.internalYBounds;
      
      // 水平边界检查
      if (xBounds.length === 2) {
        const minX = this.parseBoundValue(xBounds[0]);
        const maxX = this.parseBoundValue(xBounds[1]);
        newX = Math.max(minX, Math.min(newX, maxX));
      }
      
      // 垂直边界检查
      if (yBounds.length === 2) {
        const minY = this.parseBoundValue(yBounds[0]);
        const maxY = this.parseBoundValue(yBounds[1]);
        newY = Math.max(minY, Math.min(newY, maxY));
      }
      
      // 更新位置
      this.setData({
        currentX: newX,
        currentY: newY,
        positionStyle: `left: ${newX}px; top: ${newY}px;`
      });
      
      // 更新起始点为当前位置
      this.setData({
        startX: touch.clientX,
        startY: touch.clientY
      });
    },

    // 触摸结束事件（结束拖拽）
    onTouchEnd(e) {
      if (!this.data.dragging) return;
      
      this.setData({ dragging: false });
      // 触发拖拽结束事件
      this.triggerEvent('drag-end', { e });
    },

    // 边界值解析（支持px单位字符串或数字）
    parseBoundValue(value) {
      if (typeof value === 'string' && value.includes('px')) {
        return parseInt(value.replace('px', ''));
      }
      return Number(value);
    },

    // 检查是否可拖拽
    isDraggable() {
      return this.data.draggable && 
        (this.data.draggable === true || 
         this.data.draggable === 'all' || 
         this.data.draggable === 'vertical' || 
         this.data.draggable === 'horizontal');
    }
  }
});

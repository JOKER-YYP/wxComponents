// components/y-tabs/y-tabs.js
Component({
  properties: {
    // 当前激活的值（v-model）
    modelValue: { type: null, value: undefined },
    // 选项卡数据源
    dataSource: { type: Array, value: [] },
    // 字段映射配置
    propsObj: { type: Object, value: {} },
    // 是否启用动画效果
    animation: { type: Boolean, value: true },
    // 动画持续时间（毫秒）
    duration: { type: Number, value: 500 }
  },

  data: {
    currentValue: null,     // 当前激活值
    sliderOffsetLeft: 0,    // 滑块偏移量
    propsAttr: {            // 字段映射
      label: 'label',
      value: 'value'
    },
    sliderDuration: '0.5',  // 动画时长（秒）
    showSliderName: ''      // 滑块显示文本
  },

  observers: {
    // 监听多个数据变化
    'modelValue, propsObj, dataSource': function(modelValue, propsObj, dataSource) {
      // 合并字段映射配置
      const propsAttr = { ...this.data.propsAttr, ...propsObj };
      
      // 确定当前激活值：优先使用外部传入的modelValue
      const activeValue = modelValue !== undefined && modelValue !== null ? 
                         modelValue : this.data.currentValue;
      
      // 查找当前激活项
      const target = dataSource.find(item => 
        item[propsAttr.value] === activeValue
      );
      
      // 更新组件数据
      this.setData({ 
        currentValue: activeValue,
        propsAttr,
        sliderDuration: this.properties.duration / 1000,
        showSliderName: target ? target[propsAttr.label] : ''
      });
    }
  },

  methods: {
    // 切换选项卡
    changeSlide(e) {
      const { index, value } = e.currentTarget.dataset;
      
      // 使用nextTick确保在下一次渲染后获取节点信息
      wx.nextTick(() => {
        const query = this.createSelectorQuery();
        query.selectAll('.item').boundingClientRect();
        query.exec(res => {
          if (res[0] && res[0][index]) {
            // 计算滑块偏移量（相对于第一个选项卡）
            const sliderOffsetLeft = res[0][index].left - res[0][0].left;
            
            // 更新当前激活值和滑块位置
            this.setData({ 
              currentValue: value,
              sliderOffsetLeft
            });
            
            // 触发事件通知外部
            this.triggerEvent('change', { value });
            this.triggerEvent('update:modelValue', { value });
          }
        });
      });
    }
  }
});
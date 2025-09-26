// pages/tabs/tabs.js
Page({
  data: {
    activeTab: 0, // 当前激活的选项卡
    activeCategory: 'fruit', // 当前激活的分类
    tabs: [
      { label: '选项一', value: 0 },
      { label: '选项二', value: 1 },
      { label: '选项三', value: 2 }
    ]
  },

  // 选项卡change事件
  onTabChange(e) {
    const { value } = e.detail;
    console.log('选项卡改变:', value);
    // 这里可以执行一些逻辑，但注意不要直接修改activeTab，因为modelValue是通过事件更新的
  },

  // 更新modelValue事件（用于v-model）
  onModelValueUpdate(e) {
    const { value } = e.detail;
    this.setData({
      activeTab: value
    });
  }
});
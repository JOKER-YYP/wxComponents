// pages/calendar/calendar.js
Page({
  data: {
    mode: 'single',
    markedDates: ['2023-10-01', '2023-10-15', '2023-10-20'],
    maxSelection: 5,
    disablePast: false,
    resultText: '尚未选择日期'
  },

  onLoad() {
    this.calendar = this.selectComponent('#calendar');
  },

  changeMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ 
      mode,
      resultText: '模式已切换，请重新选择日期'
    });
  },
  
  toggleDisablePast(e) {
    this.setData({
      disablePast: e.detail.value
    });
  },
  
  changeMaxSelection(e) {
    this.setData({
      maxSelection: Number(e.detail.value) || 0
    });
  },

  onSelect(e) {
    const value = e.detail.value;
    let resultText = '';
    
    if (this.data.mode === 'single') {
      if (value) {
        const dateStr = this.formatDate(value);
        resultText = `单选日期: ${dateStr}`;
      } else {
        resultText = '未选择日期';
      }
    } else if (this.data.mode === 'multiple') {
      if (value && value.length > 0) {
        const dates = value.map(d => this.formatDate(d));
        resultText = `多选日期 (${value.length}个): ${dates.join(', ')}`;
      } else {
        resultText = '未选择日期';
      }
    } else if (this.data.mode === 'range') {
      if (value && value.length === 2) {
        const start = this.formatDate(value[0]);
        const end = this.formatDate(value[1]);
        resultText = `范围选择: ${start} 至 ${end}`;
      } else if (value && value.length === 1) {
        const start = this.formatDate(value[0]);
        resultText = `范围选择: ${start} (请选择结束日期)`;
      } else {
        resultText = '未选择日期范围';
      }
    }
    
    this.setData({ resultText });
  },

  onConfirm(e) {
    const value = e.detail.value;
    let message = '';
    
    if (this.data.mode === 'single') {
      if (value) {
        const dateStr = this.formatDate(value);
        message = `已确认选择日期: ${dateStr}`;
      } else {
        message = '请先选择日期';
      }
    } else if (this.data.mode === 'multiple') {
      if (value && value.length > 0) {
        message = `已确认选择 ${value.length} 个日期`;
      } else {
        message = '请先选择日期';
      }
    } else if (this.data.mode === 'range') {
      if (value && value.length === 2) {
        const start = this.formatDate(value[0]);
        const end = this.formatDate(value[1]);
        message = `已确认日期范围: ${start} 至 ${end}`;
      } else {
        message = '请选择完整的日期范围';
      }
    }
    
    if (message) {
      wx.showToast({
        title: message,
        icon: 'success'
      });
    }
  },

  onReset() {
    this.setData({ resultText: '已重置选择' });
  },

  goToday() {
    this.calendar.onToday();
    this.setData({ resultText: '已回到今天' });
  },

  addMarkedDate() {
    const date = new Date();
    // 随机添加未来7天内的一个日期
    const randomDay = Math.floor(Math.random() * 7);
    date.setDate(date.getDate() + randomDay);
    
    const dateStr = this.formatDate(date);
    const markedDates = [...this.data.markedDates, dateStr];
    
    this.setData({ markedDates });
    wx.showToast({
      title: `已添加标记: ${dateStr}`,
      icon: 'none'
    });
  },

  formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
});
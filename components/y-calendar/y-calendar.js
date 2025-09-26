// components/y-calendar/y-calendar.js
Component({
  properties: {
    mode: {
      type: String,
      value: 'single', // 可选值: 'single', 'multiple', 'range'
    },
    markedDates: {
      type: Array,
      value: []
    },
    maxSelection: {
      type: Number,
      value: 0 // 0表示无限制
    },
    disablePast: {
      type: Boolean,
      value: false // 是否禁用今天之前的日期
    }
  },
  data: {
    year: 0,
    month: 0,
    days: [],
    selectedDate: null,
    selectedDates: [],
    rangeStart: null,
    rangeEnd: null,
    today: new Date()
  },
  methods: {
    // 初始化日历
    initCalendar() {
      const date = new Date();
      this.setData({
        year: date.getFullYear(),
        month: date.getMonth(),
        today: date
      });
      this.updateCalendar();
    },

    // 更新日历
    updateCalendar() {
      const { year, month, selectedDate, selectedDates, rangeStart, rangeEnd, mode, markedDates, disablePast } = this.data;
      const today = new Date();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      const prevMonthLastDay = new Date(year, month, 0).getDate();

      let days = [];

      // 添加上月的日期
      for (let i = 0; i < firstDayOfWeek; i++) {
        const prevDate = new Date(year, month - 1, prevMonthLastDay - firstDayOfWeek + i + 1);
        const isPast = disablePast && prevDate < today && prevDate.toDateString() !== today.toDateString();
        
        days.push({
          text: prevMonthLastDay - firstDayOfWeek + i + 1,
          className: `day other-month ${isPast ? 'disabled' : ''}`,
          timestamp: prevDate.getTime(),
          disabled: isPast
        });
      }

      // 添加当月的日期
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        let className = 'day current';
        let rangeLabel = '';

        // 创建当前日期的Date对象和时间戳
        const currentDate = new Date(year, month, i);
        const timestamp = currentDate.getTime();
        
        // 检查是否是过去日期
        const isPast = disablePast && currentDate < today && currentDate.toDateString() !== today.toDateString();

        // 检查是否是今天
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
          className += ' today';
        }

        // 单选模式
        if (mode === 'single' && selectedDate && 
          year === selectedDate.getFullYear() && 
          month === selectedDate.getMonth() && 
          i === selectedDate.getDate()) {
          className += ' selected';
        }

        // 多选模式
        if (mode === 'multiple') {
          const isSelected = selectedDates.some(d => 
            d.getFullYear() === year && 
            d.getMonth() === month && 
            d.getDate() === i
          );
          if (isSelected) {
            className += ' selected';
          }
        }

        // 范围模式
        if (mode === 'range') {
          if (rangeStart && !rangeEnd) {
            if (currentDate.getTime() === rangeStart.getTime()) {
              className += ' range-start';
              rangeLabel = '开始';
            }
          } else if (rangeStart && rangeEnd) {
            if (currentDate >= rangeStart && currentDate <= rangeEnd) {
              className += ' range';
              if (currentDate.getTime() === rangeStart.getTime()) {
                className += ' range-start';
                rangeLabel = '开始';
              }
              if (currentDate.getTime() === rangeEnd.getTime()) {
                className += ' range-end';
                rangeLabel = '结束';
              }
            }
          }
        }

        // 检查是否有标记
        const mark = markedDates.includes(dateStr);

        days.push({
          text: i,
          className: `${className} ${isPast ? 'disabled' : ''}`,
          timestamp: timestamp,
          mark: mark,
          rangeLabel: rangeLabel,
          disabled: isPast
        });
      }

      // 添加下月的日期
      const totalCells = 42; // 6行7列
      const remainingCells = totalCells - (firstDayOfWeek + daysInMonth);
      for (let i = 1; i <= remainingCells; i++) {
        const nextDate = new Date(year, month + 1, i);
        const isPast = disablePast && nextDate < today && nextDate.toDateString() !== today.toDateString();
        
        days.push({
          text: i,
          className: `day other-month ${isPast ? 'disabled' : ''}`,
          timestamp: nextDate.getTime(),
          disabled: isPast
        });
      }

      this.setData({ days });
    },

    onPrevMonth() {
      let { year, month } = this.data;
      if (month === 0) {
        month = 11;
        year--;
      } else {
        month--;
      }
      this.setData({ year, month });
      this.updateCalendar();
    },

    onNextMonth() {
      let { year, month } = this.data;
      if (month === 11) {
        month = 0;
        year++;
      } else {
        month++;
      }
      this.setData({ year, month });
      this.updateCalendar();
    },

    onSelectDate(e) {
      const timestamp = e.currentTarget.dataset.timestamp;
      const disabled = e.currentTarget.dataset.disabled;
      
      if (timestamp == null || disabled) return; // 非当前月或禁用的日期不可选

      const date = new Date(timestamp);
      const { mode, maxSelection, selectedDates } = this.data;

      if (mode === 'single') {
        this.selectSingleDate(date);
      } else if (mode === 'multiple') {
        this.selectMultipleDate(date);
      } else if (mode === 'range') {
        this.selectRangeDate(date);
      }
    },

    selectSingleDate(date) {
      this.setData({
        selectedDate: date,
        selectedDates: [],
        rangeStart: null,
        rangeEnd: null
      });
      this.updateCalendar();
      this.triggerEvent('select', { value: date });
    },

    selectMultipleDate(date) {
      let { selectedDates } = this.data;
      const dateStr = date.toISOString().split('T')[0];
      
      // 检查是否已选中
      const index = selectedDates.findIndex(d => 
        d.toISOString().split('T')[0] === dateStr
      );
      
      if (index >= 0) {
        // 如果已选中，则取消选中
        selectedDates.splice(index, 1);
      } else {
        // 检查是否达到最大选择数量
        if (this.data.maxSelection > 0 && selectedDates.length >= this.data.maxSelection) {
          wx.showToast({
            title: `最多选择${this.data.maxSelection}个日期`,
            icon: 'none'
          });
          return;
        }
        // 否则添加
        selectedDates.push(date);
      }

      this.setData({ selectedDates });
      this.updateCalendar();
      this.triggerEvent('select', { value: selectedDates });
    },

    selectRangeDate(date) {
      let { rangeStart, rangeEnd } = this.data;
      const dateTimestamp = date.getTime();

      if (!rangeStart || (rangeStart && rangeEnd)) {
        rangeStart = date;
        rangeEnd = null;
      } else {
        // 使用时间戳进行比较
        if (dateTimestamp < rangeStart.getTime()) {
          rangeEnd = rangeStart;
          rangeStart = date;
        } else {
          rangeEnd = date;
        }
      }

      this.setData({
        rangeStart,
        rangeEnd,
        selectedDate: null,
        selectedDates: []
      });
      this.updateCalendar();

      if (rangeStart && rangeEnd) {
        this.triggerEvent('select', { value: [rangeStart, rangeEnd] });
      } else if (rangeStart) {
        this.triggerEvent('select', { value: [rangeStart] });
      }
    },

    onToday() {
      const today = new Date();
      this.setData({
        year: today.getFullYear(),
        month: today.getMonth(),
        selectedDate: today,
        selectedDates: [],
        rangeStart: null,
        rangeEnd: null
      });
      this.updateCalendar();
    },

    onReset() {
      this.setData({
        selectedDate: null,
        selectedDates: [],
        rangeStart: null,
        rangeEnd: null
      });
      this.updateCalendar();
      this.triggerEvent('reset');
    },

    onConfirm() {
      const { mode, selectedDate, selectedDates, rangeStart, rangeEnd } = this.data;
      
      if (mode === 'single') {
        this.triggerEvent('confirm', { value: selectedDate });
      } else if (mode === 'multiple') {
        this.triggerEvent('confirm', { value: selectedDates });
      } else if (mode === 'range') {
        if (rangeStart && rangeEnd) {
          this.triggerEvent('confirm', { value: [rangeStart, rangeEnd] });
        } else if (rangeStart) {
          this.triggerEvent('confirm', { value: [rangeStart] });
        } else {
          this.triggerEvent('confirm', { value: null });
        }
      }
    },
    
    // 清空所有选择状态
    clearSelection() {
      this.setData({
        selectedDate: null,
        selectedDates: [],
        rangeStart: null,
        rangeEnd: null
      });
      this.updateCalendar();
    }
  },
  observers: {
    // 当模式改变时，清空所有选择状态
    'mode': function(mode) {
      this.clearSelection();
    },
    // 当disablePast改变时，更新日历
    'disablePast': function() {
      this.updateCalendar();
    }
  },
  ready() {
    this.initCalendar();
  }
});
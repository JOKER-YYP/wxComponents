// pages/watch/watch.js
import { setWatcher } from '../../utils/watch';

Page({
  data: {
    message: 'Hello World',
    counter: 0,
    userInfo: {
      name: '张三',
      age: 25,
      scores: [85, 90, 78]
    }
  },

  onLoad() {
    // 设置监听器
    setWatcher(this);
  },

  // 监听器配置
  watch: {
    'message': function(newVal, oldVal) {
      console.log(`message变化: ${oldVal} -> ${newVal}`);
    },
    'counter': {
      handler: function(newVal, oldVal) {
        console.log(`counter变化: ${oldVal} -> ${newVal}`);
      },
      immediate: true
    },
    'userInfo.name': function(newVal) {
      console.log(`用户名更新: ${newVal}`);
    },
    'userInfo.scores': {
      handler: function(newVal) {
        console.log('分数数组变化:', newVal);
      },
      deep: true
    }
  },

  // 事件处理函数
  changeMessage() {
    this.setData({ message: 'Hello ' + Date.now() });
  },

  incrementCounter() {
    this.setData({ counter: this.data.counter + 1 });
  },

  updateUserName() {
    this.setData({ 
      'userInfo.name': '李四' + Math.floor(Math.random() * 10)
    });
  },

  addScore() {
    const newScores = [...this.data.userInfo.scores];
    newScores.push(Math.floor(Math.random() * 100));
    this.setData({ 'userInfo.scores': newScores });
  }
});

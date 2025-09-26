// 封装数据请求request
const authvalue = 'XXX'; // 自定义
const baseURL = 'https://www.XXX.com'; // 自己的网址

// 全局加载提示状态管理
let loadingCount = 0;
const showGlobalLoading = () => {
  if (loadingCount === 0) {
    wx.showLoading({ title: '正在加载中...', mask: true });
  }
  loadingCount++;
};

const hideGlobalLoading = () => {
  loadingCount--;
  if (loadingCount === 0) {
    wx.hideLoading();
  }
};

export default function request(url, data = {}, method = 'POST', options = {}) {
  return new Promise((resolve, reject) => {
    // 合并配置选项
    const {
      showLoading = true,
      contentType = 'application/json',
      timeout = 15000
    } = options;

    // 显示加载提示（根据配置）
    if (showLoading) showGlobalLoading();

    wx.request({
      url: baseURL + url,
      data,
      method,
      timeout,
      header: {
        'Authorization': authvalue,
        'content-type': contentType
      },
      dataType: 'json',
      success: (res) => {
        if (showLoading) hideGlobalLoading();
        
        // HTTP状态码成功判断
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          const error = new Error(`请求失败: ${res.statusCode}`);
          error.response = res;
          handleApiError(error);
          reject(error);
        }
      },
      fail: (err) => {
        if (showLoading) hideGlobalLoading();
        handleApiError(err);
        reject(err);
      }
    });
  });
}

// 统一错误处理
function handleApiError(error) {
  console.error('API请求错误:', error);
  
  let message = '请求失败，请重试';
  if (error.errMsg) {
    if (error.errMsg.includes('timeout')) {
      message = '网络请求超时';
    } else if (error.errMsg.includes('fail')) {
      message = '网络连接失败';
    }
  }
  
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 3000
  });
}
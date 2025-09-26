// 监听器
// 支持：深度监听、立即执行、数组监听、性能优化
// 使用方法：
// 1. 在页面引入
// 2. 在onLoad()中调用setWatcher(this)
// 3. 在页面中使用watch配置项

// 使用WeakMap存储监听状态，避免内存泄漏
const observedObjects = new WeakMap();

/**
 * 设置监听器
 * @param {Object} page - 页面实例
 */
export function setWatcher(page) {
  if (!page || !page.watch) return;
  
  const data = page.data;
  const watch = page.watch;
  
  Object.keys(watch).forEach(path => {
    const config = watch[path];
    const handler = typeof config === 'function' ? config : config.handler;
    const deep = config.deep || false;
    const immediate = config.immediate || false;
    
    // 获取当前值
    const keys = path.split('.');
    let value = data;
    for (let i = 0; i < keys.length; i++) {
      if (value === null || value === undefined) break;
      value = value[keys[i]];
    }
    
    // 立即执行
    if (immediate) {
      handler.call(page, value);
    }
    
    // 设置监听
    observe(data, path, handler, deep, page);
  });
}

/**
 * 监听属性并执行监听函数
 * @param {Object} obj - 监听对象
 * @param {string} path - 属性路径
 * @param {Function} handler - 处理函数
 * @param {boolean} deep - 是否深度监听
 * @param {Object} context - 执行上下文
 */
function observe(obj, path, handler, deep, context) {
  const keys = path.split('.');
  const key = keys.pop();
  let target = obj;
  
  // 遍历路径获取目标对象
  for (let i = 0; i < keys.length; i++) {
    const currentKey = keys[i];
    if (!target[currentKey]) {
      // 如果路径不存在，创建一个空对象
      target[currentKey] = {};
    }
    target = target[currentKey];
  }
  
  // 如果目标对象已经被监听过，直接返回
  if (observedObjects.has(target)) {
    const observedProps = observedObjects.get(target);
    if (observedProps.has(key)) return;
    observedProps.add(key);
  } else {
    observedObjects.set(target, new Set([key]));
  }
  
  let value = target[key];
  
  // 深度监听处理
  if (deep && value !== null && typeof value === 'object') {
    // 监听对象
    if (Array.isArray(value)) {
      observeArray(value, path, handler, deep, context);
    } else {
      Object.keys(value).forEach(subKey => {
        observe(value, `${path}.${subKey}`, handler, deep, context);
      });
    }
  }
  
  // 定义属性监听
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get() {
      return value;
    },
    set(newVal) {
      const oldVal = value;
      
      // 值未变化时直接返回
      if (newVal === oldVal) return;
      
      value = newVal;
      
      // 执行监听函数
      handler.call(context, newVal, oldVal);
      
      // 深度监听处理
      if (deep) {
        // 移除旧值的监听
        if (oldVal !== null && typeof oldVal === 'object') {
          unobserve(oldVal);
        }
        
        // 监听新值
        if (newVal !== null && typeof newVal === 'object') {
          if (Array.isArray(newVal)) {
            observeArray(newVal, path, handler, deep, context);
          } else {
            Object.keys(newVal).forEach(subKey => {
              observe(newVal, `${path}.${subKey}`, handler, deep, context);
            });
          }
        }
      }
    }
  });
}

/**
 * 监听数组变化
 * @param {Array} arr - 要监听的数组
 * @param {string} path - 属性路径
 * @param {Function} handler - 处理函数
 * @param {boolean} deep - 是否深度监听
 * @param {Object} context - 执行上下文
 */
function observeArray(arr, path, handler, deep, context) {
  // 保存原始数组方法
  const arrayProto = Array.prototype;
  const arrayMethods = Object.create(arrayProto);
  
  // 需要拦截的数组方法
  const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];
  
  methodsToPatch.forEach(method => {
    const original = arrayProto[method];
    
    Object.defineProperty(arrayMethods, method, {
      value: function(...args) {
        const result = original.apply(this, args);
        
        // 深度监听新添加的元素
        if (deep && (method === 'push' || method === 'unshift')) {
          args.forEach(item => {
            if (item !== null && typeof item === 'object') {
              Object.keys(item).forEach(key => {
                observe(item, `${path}.${key}`, handler, deep, context);
              });
            }
          });
        }
        
        // 触发监听
        handler.call(context, this);
        
        return result;
      },
      configurable: true,
      writable: true,
      enumerable: false
    });
  });
  
  // 覆盖数组的原型方法
  Object.setPrototypeOf(arr, arrayMethods);
  
  // 深度监听现有元素
  if (deep) {
    arr.forEach((item, index) => {
      if (item !== null && typeof item === 'object') {
        Object.keys(item).forEach(key => {
          observe(item, `${path}.${key}`, handler, deep, context);
        });
      }
    });
  }
}

/**
 * 移除对象的监听
 * @param {Object} obj - 要移除监听的对象
 */
function unobserve(obj) {
  if (observedObjects.has(obj)) {
    observedObjects.delete(obj);
  }
}

export default {
  setWatcher
};
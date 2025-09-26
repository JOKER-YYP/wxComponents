/**
 * Base64 字符集
 * 用于 Base64 编码和解码
 */
const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Base64 正则表达式
 * 用于验证 Base64 字符串格式
 */
const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

/**
 * 模拟浏览器的 btoa 函数
 * 将字符串编码为 Base64
 * @param {string} string - 要编码的字符串
 * @returns {string} Base64 编码结果
 */
exports.weBtoa = function (string) {
    string = String(string);
    let bitmap, a, b, c;
    let result = "";
    let i = 0;
    const rest = string.length % 3; // 计算余数，用于处理填充
    
    // 每次处理3个字符（24位）
    for (; i < string.length;) {
        a = string.charCodeAt(i++);
        b = string.charCodeAt(i++);
        c = string.charCodeAt(i++);
        
        // 检查字符是否在 Latin1 范围内
        if (a > 255 || b > 255 || c > 255) {
            throw new TypeError(
                "Failed to execute 'btoa': The string contains characters outside of the Latin1 range."
            );
        }
        
        // 将3个8位字符组合成24位
        bitmap = (a << 16) | (b << 8) | c;
        
        // 将24位分成4个6位组，并映射到Base64字符
        result += 
            b64.charAt((bitmap >> 18) & 63) +
            b64.charAt((bitmap >> 12) & 63) +
            b64.charAt((bitmap >> 6) & 63) +
            b64.charAt(bitmap & 63);
    }
    
    // 处理填充
    return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
};

/**
 * 模拟浏览器的 atob 函数
 * 将 Base64 字符串解码为原始字符串
 * @param {string} string - Base64 编码的字符串
 * @returns {string} 解码后的原始字符串
 */
exports.weAtob = function (string) {
    // 移除空白字符
    string = String(string).replace(/[\t\n\f\r ]+/g, "");
    
    // 验证 Base64 格式
    if (!b64re.test(string)) {
        throw new TypeError(
            "Failed to execute 'atob': The string is not correctly encoded."
        );
    }
    
    // 添加必要的填充字符
    string += "==".slice(2 - (string.length & 3));
    
    let bitmap;
    let result = "";
    let r1, r2;
    let i = 0;
    
    // 每次处理4个字符
    for (; i < string.length;) {
        // 将4个Base64字符转换为24位
        bitmap = 
            (b64.indexOf(string.charAt(i++)) << 18) |
            (b64.indexOf(string.charAt(i++)) << 12) |
            ((r1 = b64.indexOf(string.charAt(i++))) << 6) |
            (r2 = b64.indexOf(string.charAt(i++)));
        
        // 将24位分成3个8位字符
        if (r1 === 64) {
            // 只有1个有效字节的情况
            result += String.fromCharCode((bitmap >> 16) & 255);
        } else if (r2 === 64) {
            // 只有2个有效字节的情况
            result += String.fromCharCode(
                (bitmap >> 16) & 255, 
                (bitmap >> 8) & 255
            );
        } else {
            // 3个有效字节的情况
            result += String.fromCharCode(
                (bitmap >> 16) & 255, 
                (bitmap >> 8) & 255, 
                bitmap & 255
            );
        }
    }
    
    return result;
};

/**
 * 解码包含 Unicode 字符的 Base64 字符串
 * @param {string} str - Base64 编码的字符串
 * @returns {string} 解码后的 Unicode 字符串
 */
function b64DecodeUnicode(str) {
    // 将二进制字符串转换为百分号编码的字符串
    const percentEncoded = exports.weAtob(str).replace(/(.)/g, function (char) {
        // 获取字符的十六进制表示
        const hex = char.charCodeAt(0).toString(16).toUpperCase();
        // 确保是两位十六进制数
        return "%" + (hex.length < 2 ? "0" + hex : hex);
    });
    
    // 解码百分号编码的字符串
    return decodeURIComponent(percentEncoded);
}

/**
 * 解码 Base64URL 字符串
 * Base64URL 是 Base64 的变体，用于 URL 安全
 * @param {string} str - Base64URL 编码的字符串
 * @returns {string} 解码后的字符串
 */
function base64_url_decode(str) {
    // 将 Base64URL 转换为标准 Base64
    let output = str
        .replace(/-/g, "+")  // 替换 '-' 为 '+'
        .replace(/_/g, "/"); // 替换 '_' 为 '/'
    
    // 添加必要的填充字符
    switch (output.length % 4) {
        case 0:
            break; // 长度正好，无需填充
        case 2:
            output += "=="; // 添加两个填充字符
            break;
        case 3:
            output += "=";  // 添加一个填充字符
            break;
        default:
            throw new Error("Illegal base64url string!");
    }
    
    try {
        // 尝试解码为 Unicode 字符串
        return b64DecodeUnicode(output);
    } catch (err) {
        // 如果失败，使用基本的 Base64 解码
        return exports.weAtob(output);
    }
}

/**
 * JWT 解码函数
 * 解析 JSON Web Token (JWT)
 * @param {string} token - JWT 字符串
 * @param {Object} [options] - 配置选项
 * @param {boolean} [options.header] - 是否解析头部（默认为 false，解析负载）
 * @returns {Object} 解码后的 JWT 头部或负载
 */
function weappJwtDecode(token, options = {}) {
    if (typeof token !== "string") {
        throw new Error("Invalid token specified");
    }
    
    // 确定要解析的部分（header 或 payload）
    const pos = options.header === true ? 0 : 1;
    
    // 分割 JWT 的三个部分
    const parts = token.split(".");
    if (parts.length < 3) {
        throw new Error("Invalid JWT format");
    }
    
    try {
        // 解码并解析 JSON
        return JSON.parse(base64_url_decode(parts[pos]));
    } catch (e) {
        throw new Error(`Invalid token specified: ${e.message}`);
    }
}

exports.default = weappJwtDecode;
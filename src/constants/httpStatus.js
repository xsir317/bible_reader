// HTTP 状态码常量
export const HTTP_STATUS = {
    // 客户端错误 (4xx)
    REQUEST_TIMEOUT: 408,        // 请求超时
    TIMESTAMP_MISMATCH: 409,    // 时间戳不匹配
    
    // 扩展性预留
    // 可以根据需要添加更多状态码
};

// 状态码描述
export const HTTP_STATUS_MESSAGE = {
    [HTTP_STATUS.REQUEST_TIMEOUT]: '请求超时',
    [HTTP_STATUS.TIMESTAMP_MISMATCH]: '客户端时间与服务器时间不匹配',
};
import axios from 'axios';
import { securityHandler } from './security';
import { BASE_API_DOMAIN } from '../config';
import { HTTP_STATUS } from '../constants/httpStatus';

// 创建axios实例
const http = axios.create({
    baseURL: BASE_API_DOMAIN,
    timeout: 10000
});

// 请求拦截器
http.interceptors.request.use(async (config) => {
    // 跳过初始化相关接口
    if (config.url.includes('system/init') || config.url.includes('system/set-key') || config.url.includes('system/time')) {
        return config;
    }

    const session_id = localStorage.getItem('session_id');
    // 检查会话有效性
    try {
        if (!session_id) {
            await securityHandler.syncServerTime();  // 先同步时间
            await securityHandler.initializeCommunication();
        }

        // 使用 createSecureRequest 生成安全请求配置
        const secureConfig = securityHandler.createSecureRequest(
            config.method,
            config.url,
            config.data
        );

        // 合并安全配置到现有配置
        config.headers = {
            ...config.headers,
            ...secureConfig.headers
        };
        
        if (secureConfig.data) {
            config.data = secureConfig.data;
        }

        return config;
    } catch (error) {
        console.error('请求处理错误:', error);
        return Promise.reject(error);
    }
});

// 响应拦截器
http.interceptors.response.use(
    (response) => {
        // 解密响应数据
        if (response.data?.encrypted_data) {
            response.data = securityHandler.decryptResponseData(
                response.data.encrypted_data
            );
        }
        return response;
    },
    async (error) => {
        // 处理408会话过期
        if (error.response?.data?.code === HTTP_STATUS.SESSION_EXPIRED) {
            localStorage.removeItem('session_id');
            // 自动重试原请求
            return http(error.config);
        }
        return Promise.reject(error);
    }
);

export default http; // 导出配置后的实例
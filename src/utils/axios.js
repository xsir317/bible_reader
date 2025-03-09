import axios from 'axios';
import { securityHandler } from './security'; // 引入之前创建的security模块

// 创建axios实例（推荐）
const http = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000
});

// 请求拦截器
http.interceptors.request.use(async (config) => {
    // 跳过初始化相关接口
    if (config.url.includes('system/init') || config.url.includes('system/set-key')) {
        return config;
    }

    // 检查会话有效性
    if (!localStorage.getItem('session_id')) {
        await securityHandler.initializeCommunication();
    }

    // 加密请求数据（仅处理POST/PUT/PATCH）
    if (config.data && ['post', 'put', 'patch'].includes(config.method)) {
        config.data = securityHandler.encryptRequestData(config.data);
    }

    // 添加session_id到URL参数
    config.params = {
        ...config.params,
        session_id: localStorage.getItem('session_id')
    };

    return config;
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
        if (error.response?.data?.code === 408) {
            localStorage.removeItem('session_id');
            // 自动重试原请求
            return http(error.config);
        }
        return Promise.reject(error);
    }
);

export default http; // 导出配置后的实例
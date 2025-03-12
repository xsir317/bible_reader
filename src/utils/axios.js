import axios from 'axios';
import { securityHandler } from './security';
import { BASE_URL } from '../config';

// 创建axios实例
const http = axios.create({
    baseURL: BASE_URL,
    timeout: 10000
});

// 请求拦截器
http.interceptors.request.use(async (config) => {
    // 跳过初始化相关接口
    if (config.url.includes('system/init') || config.url.includes('system/set-key') || config.url.includes('system/time')) {
        return config;
    }

    // 检查会话有效性
    try {
        console.log('正在检查session_id，请求URL:', config.url);
        if (!localStorage.getItem('session_id')) {
            console.log("need init")
            await securityHandler.initializeCommunication();
        }
    } catch (error) {
        console.error('localStorage访问错误:', error);
        console.error('出错时的请求URL:', config.url);
    }
    // 继续执行，让错误在控制台可见

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
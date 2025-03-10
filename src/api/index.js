import axios from 'axios';
import { securityHandler } from '../utils/security';

const api = {
    async request(method, url, data = null) {
        // 对于不需要加密的系统接口，直接使用 axios
        if (url.startsWith('/system/')) {
            const response = await axios({
                method,
                url: `http://bb.ku10.com${url}`,
                ...(data && { data })
            });
            return response.data.data;
        }

        // 使用 securityHandler 处理加密请求
        try {
            const result = await securityHandler.request(method, url, data);
            if (result.code !== 200) {
                throw new Error(result.msg || '请求失败');
            }
            return result.data;
        } catch (error) {
            throw error;
        }
    },

    // 便捷方法
    get(url, params) {
        return this.request('GET', url, params);
    },

    post(url, data) {
        return this.request('POST', url, data);
    },

    put(url, data) {
        return this.request('PUT', url, data);
    },

    delete(url, data) {
        return this.request('DELETE', url, data);
    }
};

export default api;
import http from '../utils/axios';

const api = {
    async request(method, url, data = null) {
        try {
            const response = await http({
                method,
                url,
                ...(data && { data })
            });
            if (response.data.code !== 200) {
                throw new Error(response.data.msg || '请求失败');
            }
            return response.data.data;
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
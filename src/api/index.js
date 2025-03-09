import axios from 'axios';

const api = axios.create({
    baseURL: 'http://bb.ku10.com/', // 根据实际API地址修改
});

api.interceptors.response.use(
    response => {
        const res = response.data;
        if (res.code !== 200) {
            return Promise.reject(new Error(res.msg || '请求失败'));
        }
        return res.data;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;
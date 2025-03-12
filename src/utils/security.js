import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';
import axios from 'axios';
import { BASE_URL } from '../config';

// 加密处理器
class SecurityHandler {
    constructor() {
        this.aesKey = null;
        this.sessionId = null;
        this.rsaPublicKey = null;
        this.timeOffset = 0;
    }

    // 获取服务器时间并计算时间差
    async syncServerTime() {
        try {
            const response = await axios.get(`${BASE_URL}/common/system/time`);
            const serverTime = response.data.data.time;
            const localTime = Math.floor(Date.now() / 1000);
            this.timeOffset = serverTime - localTime;
            localStorage.setItem('time_offset', this.timeOffset.toString());
            return true;
        } catch (error) {
            console.error('同步服务器时间失败:', error);
            return false;
        }
    }

    // 获取当前调整后的时间戳
    getCurrentTimestamp() {
        return Math.floor(Date.now() / 1000) + (parseInt(this.timeOffset) || 0);
    }

    // 计算请求校验和
    calculateChecksum(requestUri, content, timestamp) {
        const checkString = `REQUEST_URI=${requestUri}&content=${content}&timestamp=${timestamp}&secret_key=${this.aesKey}`;
        return CryptoJS.MD5(checkString).toString();
    }

    // 初始化通信
    async initializeCommunication() {
        try {
            // 1. 直接使用原始 axios 获取RSA公钥和session_id，避免触发拦截器
            const initResponse = await axios.get(`${BASE_URL}/common/system/init`);
            const { session_id: sessionId, public: publicKey } = initResponse.data.data;
            console.log('initResponseData:', initResponse.data.data);

            // 2. 生成AES密钥
            const aesKey = CryptoJS.lib.WordArray.random(32).toString();
            console.log('AES Key:', aesKey);

            // 3. 使用RSA加密AES密钥
            const rsa = new NodeRSA();
            console.log('RSA Public Key:', publicKey);
            rsa.importKey(publicKey, 'public');
            const encryptedKey = rsa.encrypt(Buffer.from(aesKey), 'base64');

            // 4. 存储并发送密钥，使用原始 axios 避免触发拦截器
            await axios.get(`${BASE_URL}/common/system/set-key`, {
                params: {
                    session_id: sessionId,
                    encrypted_key: encryptedKey
                }
            });

            // 5. 存储本地信息
            localStorage.setItem('session_id', sessionId);
            this.sessionId = sessionId;
            this.aesKey = aesKey;

            return true;
        } catch (error) {
            console.error('初始化失败:', error);
            return false;
        }
    }

    // 创建加密请求配置
    createSecureRequest(method, url, data = null) {
        const timestamp = this.getCurrentTimestamp();
        const requestData = data ? this.encryptRequestData(data) : null;
        const content = requestData ? requestData.encrypted_data : '';
        
        return {
            method,
            url,
            data: requestData,
            headers: {
                'x-session-id': this.sessionId,
                'timestamp': timestamp.toString(),
                'checksum': this.calculateChecksum(url, content, timestamp)
            }
        };
    }

    // 通用请求方法
    async request(method, url, data = null) {
        try {
            const config = this.createSecureRequest(method, url, data);
            const response = await axios(config);
            
            // 处理时间戳错误
            if (response.status === 409) {
                await this.syncServerTime();
                const newConfig = this.createSecureRequest(method, url, data);
                const retryResponse = await axios(newConfig);
                return this.decryptResponseData(retryResponse.data);
            }

            return this.decryptResponseData(response.data);
        } catch (error) {
            console.error('请求失败:', error);
            throw error;
        }
    }

    // 请求加密
    encryptRequestData(data) {
        if (!this.aesKey) return data;

        const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(data),
            this.aesKey
        ).toString();

        return { encrypted_data: encrypted };
    }

    // 响应解密
    decryptResponseData(encryptedData) {
        if (!this.aesKey) return encryptedData;

        const bytes = CryptoJS.AES.decrypt(
            encryptedData,
            this.aesKey
        );

        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
}

export const securityHandler = new SecurityHandler();
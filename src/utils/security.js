import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';
import axios from 'axios';
import { BASE_API_DOMAIN } from '../config';
import { HTTP_STATUS } from '../constants/httpStatus';

// 加密处理器
class SecurityHandler {
    constructor() {
        this.aesKey = localStorage.getItem('aes_key') || null;
        this.sessionId = localStorage.getItem('session_id') || null;
        this.rsaPublicKey = null;
        this.timeOffset = 0;
    }

    // 获取服务器时间并计算时间差
    async syncServerTime() {
        try {
            const response = await axios.get(`${BASE_API_DOMAIN}/common/system/time`);
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
        // console.log('checkString:', checkString);
        return CryptoJS.MD5(checkString).toString();
    }

    // 初始化通信
    async initializeCommunication() {
        try {
            // 1. 直接使用原始 axios 获取RSA公钥和session_id，避免触发拦截器
            const initResponse = await axios.get(`${BASE_API_DOMAIN}/common/system/init`);
            const { session_id: sessionId, public: publicKey } = initResponse.data.data;

            // 2. 生成AES密钥
            const aesKey = CryptoJS.lib.WordArray.random(16).toString();

            // 3. 使用RSA加密AES密钥，指定 PKCS1_OAEP 填充
            const rsa = new NodeRSA({ encryptionScheme: 'pkcs1-oaep' });
            rsa.importKey(publicKey, 'public');
            const encryptedKey = rsa.encrypt(Buffer.from(aesKey), 'base64');

            // 4. 存储并发送密钥，使用原始 axios 避免触发拦截器
            await axios.get(`${BASE_API_DOMAIN}/common/system/set-key`, {
                params: {
                    session_id: sessionId,
                    encrypted: encryptedKey
                }
            });

            // 5. 存储本地信息
            localStorage.setItem('session_id', sessionId);
            localStorage.setItem('aes_key', aesKey);  // 新增：保存 AES Key 到 localStorage
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
        
        // 如果是 POST 请求且 data 为空，添加时间字段
        if (method.toLowerCase() === 'post' && !data) {
            data = { _time: timestamp };
        }
        
        const requestData = data ? this.encryptRequestData(data) : null;
        
        return {
            method,
            url,
            data: requestData,
            headers: {
                'x-session-id': this.sessionId,
                'timestamp': timestamp.toString(),
                'checksum': this.calculateChecksum(url, requestData, timestamp)
            }
        };
    }

    // 通用请求方法
    async request(method, url, data = null) {
        try {
            const config = this.createSecureRequest(method, url, data);
            const response = await axios(config);
            
            // 处理时间戳错误
            if (response.status === HTTP_STATUS.TIMESTAMP_MISMATCH) {
                await this.syncServerTime();
                const newConfig = this.createSecureRequest(method, url, data);
                const retryResponse = await axios(newConfig);
                return this.decryptResponseData(retryResponse.data);
            }

            try {
                return this.decryptResponseData(response.data);
            } catch (error) {
                if (error.message === 'COMMUNICATION_KEY_EXPIRED') {
                    // 重新初始化通信
                    const initialized = await this.initializeCommunication();
                    if (!initialized) {
                        throw new Error('Failed to re-initialize communication');
                    }
                    // 重试请求
                    const retryConfig = this.createSecureRequest(method, url, data);
                    const retryResponse = await axios(retryConfig);
                    return this.decryptResponseData(retryResponse.data);
                }
                throw error;
            }
        } catch (error) {
            console.error('请求失败:', error);
            throw error;
        }
    }

    // 请求加密
    encryptRequestData(data) {
        if (!this.aesKey) return data;

        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(data),
            CryptoJS.enc.Utf8.parse(this.aesKey),
            { 
              iv: iv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7
            }
        );

        const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
        return ivBase64 + ':' + encrypted.toString();
    }

    // 响应解密
    decryptResponseData(encryptedData) {
        if (!this.aesKey) return encryptedData;
        
        try {
            // 验证数据格式
            const parts = encryptedData.split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid encrypted data format');
            }

            // 验证 IV 长度
            const iv = CryptoJS.enc.Base64.parse(parts[0]);
            if (iv.words.length !== 4) { // 16 bytes = 4 words
                throw new Error('Invalid IV length');
            }

            const bytes = CryptoJS.AES.decrypt(
                { ciphertext: CryptoJS.enc.Base64.parse(parts[1]) },
                CryptoJS.enc.Utf8.parse(this.aesKey),
                {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (!decrypted) {
                throw new Error('Decryption failed - possible key mismatch');
            }
            
            return JSON.parse(decrypted);
        } catch (error) {
            if (error.message === 'Decryption failed - possible key mismatch') {
                // 通信密钥可能失效
                throw new Error('COMMUNICATION_KEY_EXPIRED');
            }
            console.error('Decryption error:', error);
            throw new Error('DECRYPTION_FAILED');
        }
    }
}

export const securityHandler = new SecurityHandler();
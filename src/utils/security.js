import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';

// 加密处理器
class SecurityHandler {
    constructor() {
        this.aesKey = null;
        this.sessionId = null;
        this.rsaPublicKey = null;
    }

    // 初始化通信
    async initializeCommunication() {
        try {
            // 1. 获取RSA公钥和session_id
            const initResponse = await axios.get('/system/init');
            const { session_id: sessionId, public: publicKey } = initResponse.data;

            // 2. 生成AES密钥
            const aesKey = CryptoJS.lib.WordArray.random(32).toString();

            // 3. 使用RSA加密AES密钥
            const rsa = new NodeRSA(publicKey);
            const encryptedKey = rsa.encrypt(aesKey, 'base64');

            // 4. 存储并发送密钥
            await axios.get('/system/set-key', {
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
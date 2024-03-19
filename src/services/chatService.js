const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { getAllchatHistory, createChatHistory, getWeddingMeta, getchatAIHistory, getMapDetails } = require("../models/Chat");

// YAML 파일 로드 및 파싱
const yamlFilePath = path.join(__dirname, "..", "application.yml");
let config;

try {
    const configFile = fs.readFileSync(yamlFilePath, "utf8");
    config = yaml.load(configFile);
} catch (error) {
    console.error("Error reading YAML file:", error);
}

function toCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            result[camelCaseKey] = toCamelCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
}

const getChatHistoryWithMapMeta = async (userId) => {
    try {
        const res = await getAllchatHistory(userId);

        return toCamelCase(res);
    } catch (err) {
        console.error("채팅 서버 error:", err);
        return {
            message: "API 통신 오류.",
            error: err.message,
        };
    }
};

const getGPT = async (userId, user_input) => {
    try {
        // userId를 기준으로 필요한 데이터를 비동기적으로 뽑아냄
        console.log(userId, user_input)
        const documents = await getWeddingMeta();
        const chat_history = await getchatAIHistory(userId);

        const data = {
            user_input: user_input,
            documents: documents,
            chat_history: chat_history
        };

        console.log(data);

        const requestUrl = `http://ai.bloomm.co.kr:8000/bloom/chat`;

        // const requestUrl = `http://0.0.0.0:8000/bloom/chat`;
        

        const response = await fetch(requestUrl, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json",
            },
        });


        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        await createChatHistory({
            user_id: userId,
            chat_type: 'user',
            message: user_input,
        });

        console.log(responseData)

        const responseChatInfo = {
            user_id: userId,
            chat_type: 'chatbot',
            message: responseData.message,
            map_info: responseData.mapInfo ? JSON.stringify(responseData.mapInfo) : ''
        };

        res = await createChatHistory(responseChatInfo);
        console.log(res)
        if (res.map_info) {
            const mapIds = res.map_info
            const mapDetails = await getMapDetails(mapIds);
            console.log(mapDetails)
            res.mapInfo = mapDetails;
        }
        return toCamelCase(res);

    } catch (err) {
        console.error("채팅서버 error:", err);
        return {
            message: "API 통신 오류.",
            error: err.message,
        };
    }
};

module.exports = {
    getChatHistoryWithMapMeta,
    getGPT
};

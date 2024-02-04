const dbConnection = require("../utils/db");
const {v4: UUID} = require("uuid");

async function getAllchatHistory(userId) {
    const query = `
        SELECT 
            chat_id AS chatId,
            user_id AS userId,
            chat_type AS chatType,
            message,
            map_info AS mapInfo,
            created_at AS createdAt
        FROM chatHistory WHERE user_id = ?`;
    try {
        const chatHistories = await doQuery(query, [userId]);

        const chatHistoriesWithMapDetails = await Promise.all(chatHistories.map(async (chatHistory) => {
            if (chatHistory.mapInfo) {
                try {
                    const mapIds = JSON.parse(chatHistory.mapInfo);
                    const mapDetails = await getMapDetails(mapIds);
                    chatHistory.mapInfo = mapDetails;
                } catch (parseError) {
                    console.error('JSON parsing error for mapInfo:', parseError);
                    chatHistory.mapInfo = [];
                }
            } else {
                chatHistory.mapInfo = [];
            }
            return chatHistory;
        }));

        return chatHistoriesWithMapDetails;
    } catch (error) {
        console.error('Error retrieving chat history:', error);
        throw error;
    }
}


async function getchatAIHistory(userId) {
    const query = `
        SELECT 
            message
        FROM chatHistory WHERE user_id = ${userId} and chat_type = 'user'`;
    const result = await doQuery(query);

    const chat_history = result.map(row => row.message);
    return chat_history;
}

async function getWeddingMeta() {
    const query = `
        SELECT
            pd.place_id,
            pd.hall_type,
            pd.mood,
            pd.meal,
            pd.brid_type,
            pd.min_guarantee,
            pd.capacity,
            pd.virgin_road_length,
            pd.is_stage_available,
            pd.ceremony_interval,
            pd.parking,
            m.place_name,
            m.region
        FROM placeDetail pd
        JOIN map m ON pd.place_id = m.map_id`;

    const result = await doQuery(query);

    // const columnHeaders = "place_id,place_name,hall_type,mood,meal,brid_type,min_guarantee,capacity,virgin_road_length,is_stage_available,ceremony_interval,parking,phone";

    const documents = result.map(row =>
        `${row.place_id}?${row.place_name}?${row.hall_type}?${row.mood}?${row.meal}?${row.brid_type}?${row.min_guarantee}?${row.capacity}?${row.virgin_road_length}?${row.is_stage_available}?${row.ceremony_interval}?${row.parking}?${row.region}`
    );

    // documents.unshift(columnHeaders);

    return documents;
}


async function getMapDetails(mapIds) {
    const placeholders = mapIds.map(() => '?').join(',');
    const query = `
        SELECT
            map_id AS mapId,
            place_name AS placeName,
            thumbnail
        FROM map
        WHERE map_id IN (${placeholders})`;

    // 쿼리 실행
    const results = await doQuery(query, mapIds);

    // 결과 반환
    return results;
}

const createChatHistory = async (chatInfo) => {
    // 채팅 정보 삽입 쿼리
    const insertQuery = `
        INSERT INTO chatHistory (user_id, chat_type, message, map_info) 
        VALUES (?, ?, ?, ?);`;
    // 삽입된 행의 ID를 가져오기 위한 쿼리
    const lastIdQuery = `SELECT LAST_INSERT_ID() AS lastId;`;

    try {
        // 채팅 정보 삽입
        await doQuery(insertQuery, [chatInfo.user_id, chatInfo.chat_type, chatInfo.message, chatInfo.map_info || '']);
        // 마지막 삽입 ID 조회
        const result = await doQuery(lastIdQuery);
        const lastId = result[0].lastId;
        // 삽입된 채팅 정보 조회
        const selectQuery = `SELECT * FROM chatHistory WHERE chat_id = ?;`;
        const newChatHistoryResult = await doQuery(selectQuery, [lastId]);

        const newChatHistory = newChatHistoryResult[0];
        if (newChatHistory && newChatHistory.map_info) {
            newChatHistory.map_info = JSON.parse(newChatHistory.map_info);
        }

        return newChatHistory;
    } catch (error) {
        console.error('Error saving chat history:', error);
        throw error;
    }
};

const doQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        dbConnection.query(query, params, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {getAllchatHistory, getchatAIHistory, getWeddingMeta, createChatHistory, getMapDetails };

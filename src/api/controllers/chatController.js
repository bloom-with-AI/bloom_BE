const express = require("express");
const chatService = require("../../services/chatService");
const chatController = express.Router();

const getHistoryCallback = async (req, res) => {
  // #swagger.tags = ['Chat']
  // #swagger.summary = '챗봇 대화 기록'
  try {
    let { userId } = req.query;

    const chat = await chatService.getChatHistoryWithMapMeta(userId, res);

    return res.send(chat);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
};

const chatCallback = async (req, res) => {
  // #swagger.tags = ['Chat']
  // #swagger.summary = '챗봇 답변'
  try {
    let { userId, message } = req.body;

    const chat = await chatService.getGPT(userId, message, res);

    return res.send(chat);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
};

module.exports = { getHistoryCallback, chatCallback };

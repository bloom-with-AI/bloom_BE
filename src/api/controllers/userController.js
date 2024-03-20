const express = require("express");
const userService = require("../../services/userService");
const userController = express.Router();

//카카오 로그인 인가 코드로 진행
const kakaoCallback = async (req, res) => {
  try {
    let { code } = req.query;

    const kakaoUser = await userService.kakaoLogin(code, res);

    return res.send(kakaoUser);
  } catch (err) {
    return res.send(err);
  }
};

//네이버 로그인 진행
const naverCallback = async (req, res) => {
  try {
    let { code } = req.query;
    let { state } = req.query;

    const naverUser = await userService.naverLogin(code, state, res);

    return res.send(naverUser);
  } catch (err) {
    return res.send(err);
  }
};

module.exports = { userController, kakaoCallback, naverCallback };

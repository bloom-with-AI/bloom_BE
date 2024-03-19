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

module.exports = { userController, kakaoCallback };

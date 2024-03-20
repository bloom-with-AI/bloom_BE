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
  let { code } = req.query;
  let { state } = req.query;

  const naverUser = await userService.naverLogin(code, state, res);

  return res.send(naverUser);
};

//로그아웃
const logout = async (req, res) => {
  try {
    const userId = req.params.userId;

    await userService.userLogout(userId, res);

    return res.send("로그아웃 성공!");
  } catch (err) {
    return res;
  }
};

module.exports = { userController, kakaoCallback, naverCallback, logout };

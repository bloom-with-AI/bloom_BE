const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

//카카오 인가코드로 로그인 및 신규 회원가입
router.get("/login/kakao/callback", userController.kakaoCallback);

//네이버 인가코드로 로그인 및 신규 회원가입
router.get("/login/naver/callback", userController.naverCallback);

//로그아웃
router.post("/logout/:userId", userController.logout);

module.exports = router;

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

//카카오 인가코드로 로그인 및 신규 회원가입
router.get("/kakao/callback", userController.kakaoCallback);

module.exports = router;

const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController");

//map에서 웨딩홀 검색 (주소, 웨딩홀 이름)
router.get("/map", searchController.searchByKeywords);

module.exports = router;

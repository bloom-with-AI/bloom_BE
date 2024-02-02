const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController");

//map에서 웨딩홀 검색 (주소, 웨딩홀 이름)
router.get("/map", searchController.searchByKeywords);

//웨딩홀 상세 정보
router.get("/wedding/detail/:mapId", searchController.weddingDetail);

//웨딩홀 간략 정보
router.get("/wedding/summary/:mapId", searchController.weddingSummary);

module.exports = router;

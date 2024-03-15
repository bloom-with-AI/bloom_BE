const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController");

//map에서 웨딩홀 검색 (필터, 검색)
router.get("/map", searchController.searchByKeywords);

//map에서 웨딩홀 검색 (필터, 검색) -속도 개선
router.get("/map/wedding", searchController.searchWithIndexing);

//웨딩홀 상세 정보
router.get("/wedding/detail/:mapId", searchController.weddingDetail);

//웨딩홀 간략 정보
router.get("/wedding/summary/:mapId", searchController.weddingSummary);

module.exports = router;

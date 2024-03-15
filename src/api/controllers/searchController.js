const express = require("express");
require("dotenv").config();
const searchService = require("../../services/searchService");

const searchController = express.Router();

const searchByKeywords = async (req, res) => {
  // #swagger.tags = ['Search']
  // #swagger.summary = '키워드 검색'
  try {
    const result = await searchService.searchByKeywords(req);

    const { keyword } = req.query;

    let isKeywordExist;
    if (keyword === undefined) {
      isKeywordExist = false;
    } else {
      isKeywordExist = true;
    }

    return res.json({
      result: result,
      isKeywordExist: isKeywordExist,
    });
  } catch (err) {
    return res.send(err);
  }
};

const searchWithIndexing = async (req, res) => {
  // #swagger.tags = ['Search']
  // #swagger.summary = '키워드 검색(Index)'
  try {
    const result = await searchService.searchWithIndexing(req);

    const { keyword } = req.query;
    const isKeywordExist = keyword === undefined ? false : true;

    const totalCnt = result.length;

    return res.json({
      result: result,
      total: totalCnt,
      isKeywordExist: isKeywordExist,
    });
  } catch (err) {
    return res.send(err);
  }
};

// 간략(summary) 페이지 정보
const weddingSummary = async (req, res) => {
  // #swagger.tags = ['Search']
  // #swagger.summary = '웨딩홀 요약 정보 검색'
  const { mapId } = req.params;
  const venueSummary = await searchService.searchVenueInfo([mapId, true], res);

  return venueSummary;
};

// 디테일(detail) 페이지 정보
const weddingDetail = async (req, res) => {
  // #swagger.tags = ['Search']
  // #swagger.summary = '웨딩홀 상세 정보 검색'
  const { mapId } = req.params;
  const venueDetail = await searchService.searchVenueInfo([mapId, false], res);

  return venueDetail;
};

module.exports = {
  searchController,
  searchByKeywords,
  searchWithIndexing,
  weddingDetail,
  weddingSummary,
};

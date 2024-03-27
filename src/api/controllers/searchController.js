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

    const totalCnt = result.searchResult.length;

    return res.json({
      searchResult: result.searchResult,
      total: totalCnt,
      isKeywordExist: isKeywordExist,
      saveResult: result.saveResult,
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

//유저별 검색 히스토리 불러오기
const userSearchHistory = async (req, res) => {
  // #swagger.tags = ['Search']
  // #swagger.summary = '유저별 검색 히스토리 불러오기'
  const { userId } = req.params;
  const history = await searchService.getSearchHistory(userId, res);

  return res.json({
    history: history.history,
    total: history.history.length,
    getList: history.getList,
    err: history.err,
  });
};

module.exports = {
  searchController,
  searchByKeywords,
  searchWithIndexing,
  weddingDetail,
  weddingSummary,
  userSearchHistory,
};

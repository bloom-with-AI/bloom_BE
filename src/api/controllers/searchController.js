const express = require("express");
const searchService = require("../../services/searchService");

const searchController = express.Router();

const searchByKeywords = async (req, res) => {
  try {
    const {
      hallType,
      weddingStyle,
      mood,
      meal,
      minGuarantee,
      parking,
      keyword,
    } = req.query;

    const conditions = {
      hallType: hallType,
      weddingStyle: weddingStyle,
      mood: mood,
      meal: meal,
      minGuarantee: minGuarantee,
      parking: parking,
      keyword: keyword,
    };

    const result = await searchService.searchByKeywords(conditions);

    let is_null;
    if (result.length[0] === 0) {
      is_null = true;
    } else {
      is_null = false;
    }

    return res.json({
      result: result,
      is_null: is_null,
    });
  } catch (err) {
    return res.send(err);
  }
};

// 간략(summary) 페이지 정보
const weddingSummary = async (req, res) => {
  const { mapId } = req.params;
  const venueSummary = await searchService.searchVenueInfo([mapId, true], res);

  return venueSummary;
};

// 디테일(detail) 페이지 정보
const weddingDetail = async (req, res) => {
  const { mapId } = req.params;
  const venueDetail = await searchService.searchVenueInfo([mapId, false], res);

  return venueDetail;
};

module.exports = {
  searchController,
  searchByKeywords,
  weddingDetail,
  weddingSummary,
};

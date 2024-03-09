const express = require("express");
require("dotenv").config();
const searchService = require("../../services/searchService");

const searchController = express.Router();

const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

const searchBasedLocation = () => {
  app.get("/image", async (req, res) => {
    const { query, display, start } = req.query;

    if (!query) {
      return res.status(400).send("파라미터 확인 요망");
    }

    try {
      const localParams = new URLSearchParams({
        query: query,
        display: display || "10",
        start: start || "1",
        sort: "random",
      });

      const localUrl = `${
        process.env.NAVER_URL_SEARCH_LOCAL
      }?${localParams.toString()}`;

      const localResponse = await fetch(localUrl, {
        method: "GET",
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
        },
      });

      const localData = await localResponse.json();

      console.log("localData=======>", localData);

      const combinedResults = await Promise.all(
        localData.items.map(async (item, index) => {
          const imageQuery = item.title; // 이미지 검색을 위한 쿼리 (예: 지역 검색 결과의 제목)
          const imageParams = new URLSearchParams({
            query: imageQuery,
            display: 1,
          });
          const imageUrl = `${
            process.env.NAVER_URL_SEARCH_IMAGE
          }?${imageParams.toString()}`;

          const imageResponse = await fetch(imageUrl, {
            headers: {
              "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
              "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
            },
          });

          const imageData = await imageResponse.json();

          // const blogParams = new URLSearchParams({
          //     query: imageQuery,
          //     display: 10,
          //     start: 1
          // });
          //
          // const blogUrl = `https://openapi.naver.com/v1/search/blog.json?${blogParams.toString()}`;
          // const blogResponse = await fetch(blogUrl, {
          //     headers: {
          //         "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
          //         "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
          // },
          // });
          //
          // const blogData = await blogResponse.json();
          //
          // console.log(blogData)

          const geocodeParams = new URLSearchParams({ query: item.address });

          const geoUrl = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?${geocodeParams.toString()}`;
          const geoResponse = await fetch(geoUrl, {
            headers: {
              "X-NCP-APIGW-API-KEY-ID": "2dnkk6ir2t",
              "X-NCP-APIGW-API-KEY": "hAZG3obLpUdKjCBusz0kojTbUzwgk1q4BZVAzmA6",
            },
          });

          const geoData = await geoResponse.json();

          let x, y;
          if (
            geoData.status === "OK" &&
            geoData.addresses &&
            geoData.addresses.length > 0
          ) {
            const addressInfo = geoData.addresses[0];
            x = addressInfo.x; // 경도
            y = addressInfo.y; // 위도

            // console.log("경도:", x, "위도:", y);
          } else {
            console.log("Geocoding 결과가 없습니다.");
          }
          console.log(x, y, item.title, item.description);
          return {
            index: index,
            title: item.title,
            link: item.link,
            category: item.category,
            description: item.description,
            telephone: item.telephone,
            address: item.address,
            roadAddress: item.roadAddress,
            x: x,
            y: y,
            img:
              imageData.items.length > 0 ? imageData.items[0].thumbnail : null, // 첫 번째 이미지 링크를 사용
          };
        })
      );

      // console.log('Combined Results:', combinedResults);
      res.json(combinedResults);
      // console.log(res)
    } catch (error) {
      res.status(500).send(error);
    }
  });
};

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
  weddingDetail,
  weddingSummary,
  searchBasedLocation,
};

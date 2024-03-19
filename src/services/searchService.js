const Venue = require("../models/Venue");

let combineWord;
let cnt;

const searchByKeywords = async (req) => {
  combineWord = "";
  cnt = 0;

  const { hallType, bridType, mood, meal, minGuarantee, parking, keyword } =
    req.query;

  const conditions = {
    hallType: hallType,
    bridType: bridType,
    mood: mood,
    meal: meal,
    minGuarantee: minGuarantee,
    parking: parking,
    keyword: keyword,
  };

  const conditionArr = Object.entries(conditions);

  //query 만드는 곳

  for (let i = 0; i < conditionArr.length; i++) {
    if (conditionArr[i][1] !== undefined) {
      if (cnt !== 0 && conditionArr[i][0] !== "keyword") {
        combineWord = combineWord + " AND ";
      }

      if (conditionArr[i][0] === "hallType") {
        await makeQuery(
          typeof conditionArr[i][1],
          conditionArr[i][1],
          "p.hall_type"
        );
      } else if (conditionArr[i][0] === "bridType") {
        await makeQuery(
          typeof conditionArr[i][1],
          conditionArr[i][1],
          "p.brid_type"
        );
      } else if (conditionArr[i][0] === "mood") {
        await makeQuery(
          typeof conditionArr[i][1],
          conditionArr[i][1],
          "p.mood"
        );
      } else if (conditionArr[i][0] === "meal") {
        await makeQuery(
          typeof conditionArr[i][1],
          conditionArr[i][1],
          "p.meal"
        );
      } else if (conditionArr[i][0] === "minGuarantee") {
        await makeQuery(
          typeof conditionArr[i][1],
          conditionArr[i][1],
          "p.min_guarantee"
        );
      } else if (conditionArr[i][0] === "parking") {
        await makeQuery(
          typeof conditionArr[i][1],
          conditionArr[i][1],
          "p.parking"
        );
      } else if (conditionArr[i][0] === "keyword") {
        if (cnt !== 0) {
          combineWord = combineWord + " AND ";
        }

        await makeQuery(
          typeof conditionArr[i][1],
          conditionArr[i][1],
          "m.place_name"
        );

        combineWord = combineWord + " OR ";

        await makeQuery(
          typeof conditionArr[i][1],
          conditionArr[i][1],
          "m.road_address_name"
        );
      }
    }
  }

  let searchResult;

  for (let i = 0; i < conditionArr.length; i++) {
    if (conditionArr[i][1] !== undefined) {
      searchResult = await Venue.getSearchResult(combineWord);

      return searchResult;
    } else {
      if (i == conditionArr.length - 1) {
        searchResult = await Venue.getAllList();
      }
    }
  }

  return searchResult;
};

const makeQuery = async (type, content, columnName) => {
  let word = "";

  cnt++;

  if (type === "object") {
    for (let i = 0; i < content.length; i++) {
      if (i === 0) {
        word = word + `(${columnName} like "%${content[i]}%" `;
      } else if (i === content.length - 1) {
        word = word + `OR ${columnName} like "%${content[i]}%" )`;
      } else {
        word = word + `OR ${columnName} like "%${content[i]}%" `;
      }
    }
  } else if (type === "string") {
    word = word + `${columnName} like "%${content}%" `;
  }

  combineWord = combineWord + word;
};

const searchVenueInfo = async ([mapId, isSummary], res) => {
  try {
    let venueInfo = await Venue.findBymapId(mapId);

    if (venueInfo.length == 0) {
      return res.json({
        message: "해당하는 웨딩홀이 없습니다.",
        getList: false,
      });
    }

    if (isSummary) {
      venueInfo = {
        place_name: venueInfo[0].place_name,
        hall_type: venueInfo[0].hall_type,
        meal: venueInfo[0].meal,
        mood: venueInfo[0].mood,
        distance: venueInfo[0].distance,
      };
    }

    return res.json({
      venueInfo,
      getList: true,
    });
  } catch (err) {
    return res.json({
      err: err,
      getList: false,
    });
  }
};

module.exports = { searchByKeywords, searchVenueInfo };

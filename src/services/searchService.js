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

  console.log("conditionArr=====>", conditionArr);

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

  console.log("combineWord=======>", combineWord);

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
  let filterData;

  cnt++;

  if (type === "object") {
    for (let i = 0; i < content.length; i++) {
      if (columnName === "p.min_guarantee" || columnName === "p.parking") {
        console.log("if문 진입 content[i]=======>", content[i]);

        filterData = await contentFilter(columnName, content[i]);

        console.log("가공 후 content[i]=======>", filterData);

        if (i === 0) {
          word =
            word +
            `( (${content[i].min} <= ${columnName} and ${columnName} <= ${content[i].max}) `;
        } else if (i === content.length - 1) {
          word =
            word +
            `OR (${content[i].min} <= ${columnName} and ${columnName} <= ${content[i].max}) )`;
        } else {
          word =
            word +
            `OR (${content[i].min} <= ${columnName} and ${columnName} <= ${content[i].max}) `;
        }
      } else if (columnName === "p.brid_type") {
        content = await contentFilter(columnName, content);

        if (i === 0) {
          word = word + `(${columnName} like "%${content[i]}%" `;
        } else if (i === content.length - 1) {
          word = word + `OR ${columnName} like "%${content[i]}%" )`;
        } else {
          word = word + `OR ${columnName} like "%${content[i]}%" `;
        }
      } else {
        if (i === 0) {
          word = word + `(${columnName} like "%${content[i]}%" `;
        } else if (i === content.length - 1) {
          word = word + `OR ${columnName} like "%${content[i]}%" )`;
        } else {
          word = word + `OR ${columnName} like "%${content[i]}%" `;
        }
      }
    }
  } else if (type === "string") {
    console.log("content=======>", content);

    if (columnName === "p.min_guarantee" || columnName === "p.parking") {
      let filterData = await contentFilter(columnName, content);
      console.log("if 문 진입 content=======>", filterData);

      word =
        word +
        `(${filterData.min} <= ${columnName} and ${columnName} <= ${filterData.max}) `;
    } else if (columnName === "p.brid_type") {
      content = await contentFilter(columnName, content);
      word = word + `${columnName} like "%${content}%" `;
    } else {
      word = word + `${columnName} like "%${content}%" `;
    }
  }

  combineWord = combineWord + word;
};

const contentFilter = (columnName, data) => {
  let filterData;

  console.log("data in 185 =======>", data);
  if (columnName === "p.brid_type") {
    filterData = data.substring(0, 2);

    //주차인원, 보증인원 map으로 각 필터 범위별 min 숫자 max 숫자 지정 후 해당 값을 key로 data에 return
  } else if (columnName === "p.min_guarantee") {
    const guaranteeMap = {
      "100명 미만": { min: 0, max: 100 }, // 0 <= x <= 100
      "150명": { min: 101, max: 150 }, // 101 <= x <= 150
      "200명": { min: 151, max: 200 }, // 151 <= x <= 200
      "250명": { min: 201, max: 250 }, // 201 <= x <= 250
      "300명": { min: 251, max: 300 }, // 251 <= x <= 300
      "350명": { min: 301, max: 350 }, // 301 <= x <= 350
      "400명": { min: 351, max: 400 }, // 351 <= x <= 400
      "450명": { min: 401, max: 450 }, // 401 <= x <= 450
      "500명": { min: 451, max: 500 }, // 451 <= x <= 500
      "500명 이상": { min: 501 }, // 501 <= x
    };

    filterData = guaranteeMap.data;
  } else if (columnName === "p.parking") {
    //prettier-ignore
    const parkingMap = {
      "불가": { max: 0 }, // x <= 0
      "100대 미만": { min: 1, max: 99 }, // 1 <= x <= 99
      "100-199대": { min: 100, max: 199 }, // 100 <= x <= 199
      "200-299대": { min: 200, max: 299 }, // 200 <= x <= 299
      "300-399대": { min: 300, max: 399 }, // 300 <= x <= 399
      "400-499대": { min: 400, max: 499 }, // 400 <= x <= 350
      "500-599대": { min: 500, max: 599 }, // 500 <= x <= 400
      "600-1000대": { min: 600, max: 1000 }, // 600 <= x <= 1000
      "무제한": { min: 1001 }, // 1001 <= x
    };

    filterData = parkingMap.data;
  }

  return filterData;
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

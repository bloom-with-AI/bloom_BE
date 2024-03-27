const dbConnection = require("../utils/db");
const User = require("./User");

const getAllList = async () => {
  const query =
    "select * from map m inner join placeDetail p on m.place_id = p.place_id;";

  const result = await doQuery(query);
  return result;
};

const getSearchResult = async (combineWord) => {
  const query = `select * from map m
                inner join placeDetail p on m.place_id = p.place_id
                where ${combineWord};`;

  // hallType(홀타입): [a, b, c] -> hall_type placeDetail
  // bridType(예식형태): [a] -> brid_type placeDetail
  // mood(분위기): [] -> mood placeDetail
  // meal(식사형태): [a] -> meal placeDetail
  // minGuarantee(최소 보증인원): int(?) -> min_guarantee placeDetail
  // parking(주차): int(?) -> parking placeDetail
  // keyword: string

  const result = await doQuery(query);

  return result;
};

const findBymapId = async (mapId) => {
  const query = `select * from map m
                  inner join placeDetail p on m.place_id = p.place_id
                  where m.map_id = ${mapId}`;

  const venueDetail = await doQuery(query);

  return venueDetail;
};

const saveHistoryByUserId = async (userId, keyword) => {
  let result;
  const user = await User.findOneByUserId(userId);

  if (user.length === 0) {
    result = false;
  } else {
    const query = `INSERT INTO searchHistory (search_text, user_id) VALUES ('${keyword}', ${userId})`;
    const historyResult = await doQuery(query);

    const serverStatus = historyResult.serverStatus;
    result = serverStatus === 2 ? true : false;
  }

  return result;
};

const getHistoryByUserId = async (userId) => {
  const query = `select * from searchHistory
                  WHERE user_id = ${userId}`;

  const history = await doQuery(query);

  return history;
};

const doQuery = (query) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  getAllList,
  findBymapId,
  getSearchResult,
  getHistoryByUserId,
  saveHistoryByUserId,
};

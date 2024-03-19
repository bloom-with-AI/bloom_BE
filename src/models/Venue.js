const dbConnection = require("../utils/db");

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

module.exports = { getAllList, findBymapId, getSearchResult };

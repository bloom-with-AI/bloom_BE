const dbConnection = require("../utils/db");

const getAllList = async () => {
  const query =
    "select * from map m inner join placeDetail p on m.place_id = p.place_id;";
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

module.exports = { getAllList, findBymapId };

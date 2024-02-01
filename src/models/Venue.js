const dbConnection = require("../utils/db");

const getAllList = async () => {
  const query =
    "select * from map m inner join placeDetail p on m.place_id = p.place_id;";
  const result = await doQuery(query);

  return result;
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

module.exports = { getAllList };

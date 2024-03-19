const Venue = require("../models/Venue");

const searchByKeywords = () => {
  const list = Venue.getAllList();

  return list;
};

module.exports = { searchByKeywords };

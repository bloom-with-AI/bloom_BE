const Venue = require("../models/Venue");

const searchByKeywords = () => {
  const list = Venue.getAllList();

  return list;
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

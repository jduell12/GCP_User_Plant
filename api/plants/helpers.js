const { nextTick } = require("process");

require("dotenv").config();

module.exports = {
  validatePlant,
};

function validatePlant(req, res, next) {
  let plantObj = req.body;
  if (
    plantObj.name &&
    plantObj.type &&
    plantObj.harvestable &&
    plantObj.water_schedule
  ) {
    if (check_types(plantObj)) {
      next();
    } else {
      res.status(400).json({
        Error:
          "The request object attributes have one or more of the wrong type.",
      });
    }
  } else {
    res
      .status(400)
      .json({ Error: "The request object is missing required attributes." });
  }
}

function check_types(plantObj) {
  if (!plantObj.plot_id) {
    plantObj.plot_id = 0;
  } else if (typeof plantObj.plot_id !== "number") {
    return false;
  }

  if (
    typeof plantObj.name === "string" &&
    typeof plantObj.type === "string" &&
    typeof plantObj.harvestable === "boolean" &&
    typeof plantObj.water_schedule === "string"
  ) {
    return true;
  }
  return false;
}

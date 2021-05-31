const Plots = require("./plot_model");
const Plants = require("../plants/plant_model");

module.exports = {
  validatePlot,
  validateEditPlot,
  checkPatchTypes,
  checkPlotAvail,
  checkPlantBelongstoUser,
  checkPlotHasPlant,
};

async function validatePlot(req, res, next) {
  const plot = req.body;
  if (
    (plot.plot_number || plot.plot_number === 0) &&
    (plot.sprinkler_system || plot.sprinkler_system === false)
  ) {
    const isValid = checkTypes(plot);
    const uniquePlotNumber = await checkAvailPlotNumber(plot);

    if (isValid && uniquePlotNumber) {
      req.body.plant_id = 0;
      req.body.available = true;
      next();
    } else if (!isValid) {
      res.status(400).json({
        Error:
          "The request object attributes have one or more of the wrong type",
      });
    } else {
      res.status(403).json({
        Error: "Please enter a valid and empty plot number",
      });
    }
  } else {
    res
      .status(400)
      .json({ Error: "The request object is missing required attributes" });
  }
}

function checkTypes(plotObj) {
  if (
    typeof plotObj.plot_number === "number" &&
    typeof plotObj.sprinkler_system === "boolean"
  ) {
    return true;
  }
  return false;
}

async function checkAvailPlotNumber(plotObj) {
  try {
    const plot_list = await Plots.getAllPlots();
    for (const plot of plot_list) {
      if (plot.plot_number === plotObj.plot_number) {
        return false;
      }
    }
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function validateEditPlot(req, res, next) {
  const plot = req.body;
  if (
    plot.plot_number &&
    (plot.available || plot.available === false) &&
    (plot.sprinkler_system || plot.sprinkler_system === false) &&
    (plot.plant_id || plot.plant_id === 0)
  ) {
    if (
      typeof plot.plot_number === "number" &&
      typeof plot.plant_id === "number"
    ) {
      next();
    } else {
      res.status(400).json({
        Error: "The request attributes have one or more of the wrong type",
        stack: "plot helpers line 84",
      });
    }
  } else {
    res.status(400).json({
      Error: "The request object is missing required attributes",
      stack: "plot helpers line 90",
    });
  }
}

function checkPatchTypes(req, res, next) {
  const plot = req.body;
  let flag = false;

  if (plot.plot_number) {
    if (typeof plot.plot_number === "number") {
      flag = true;
    }
  }

  if (plot.available === true || plot.available === false) {
    flag = true;
  }

  if (plot.plant_id) {
    if (typeof plot.plant_id === "number") {
      flag = true;
    }
  }

  if (plot.sprinkler_system === true || plot.sprinkler_system === false) {
    flag = true;
  }

  if (flag) {
    next();
  } else {
    res.status(400).json({
      Error: "Please enter a valid attribute or valid attribute type",
    });
  }
}

async function checkPlotAvail(req, res, next) {
  const plot_id = req.params.plot_id;
  const plot = await Plots.getPlotById(plot_id);

  if (plot) {
    if (plot.available) {
      next();
    } else {
      res
        .status(400)
        .json({ Error: "The plot with the given id is not available" });
    }
  } else {
    res.status(404).json({ Error: "No plot with that id exists" });
  }
}

async function checkPlantBelongstoUser(req, res, next) {
  const plant_id = req.params.plant_id;
  const plant = await Plants.getPlantById(plant_id);
  if (plant && plant.owner_id === req.sub) {
    next();
  } else {
    if (!plant) {
      res.status(404).json({
        Error: "No plant with that id exists",
        stack: "plot helpers line 154",
      });
    } else {
      res.status(401).json({
        Error:
          "The plant id provided is not a plant of the owner. Please verify the plant id.",
        stack: "plot helper line 160",
      });
    }
  }
}

async function checkPlotHasPlant(req, res, next) {
  const plot = await Plots.getPlotById(req.params.plot_id);
  if (plot.plant_id === 0) {
    next();
  } else {
    res.status(401).json({
      Error: "To remove a plot that has a plant please use the correct URL",
    });
  }
}

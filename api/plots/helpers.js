const Plots = require("./plot_model");

module.exports = {
  validatePlot,
  validateEditPlot,
  checkPatchTypes,
  checkPlotAvail,
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
      res.status(400).json({
        Error: "Please enter a plot number that is not taken",
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
        stack: "plot helpers line 82",
      });
    }
  } else {
    res.status(400).json({
      Error: "The request object is missing required attributes",
      stack: "plot helpers line 88",
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

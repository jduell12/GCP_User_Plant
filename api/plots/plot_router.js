const router = require("express").Router();
const Plots = require("./plot_model");
const Plants = require("../plants/plant_model");
const helpers = require("./helpers");
const authenticate_jwt = require("../middleware/jwt-auth");

//get all the plots
router.get("/", async (req, res) => {
  Plots.getPlots()
    .then((plots) => {
      res.status(200).json(plots);
    })
    .catch((e) => {
      res.status(500).json({
        error: e,
        errorMessage: "Error with google database",
        stack: "plot_router line 14",
      });
    });
});

//add a plot and initializes the plant id to 0 and available to true
router.post("/", helpers.validatePlot, async (req, res) => {
  Plots.addPlot(req.body)
    .then((plot) => {
      res.status(200).json(plot);
    })
    .catch((e) => {
      res.status(500).json({
        error: e,
        errorMessage: "Error with google database",
        stack: "plot_router line 30",
      });
    });
});

//edit plots
router.put(
  "/:plot_id",
  authenticate_jwt,
  helpers.validateEditPlot,
  async (req, res) => {
    try {
      const old_plot = await Plots.getPlotById(req.params.plot_id);
      let plot = {};
      if (old_plot) {
        plot = await Plots.editPlot(old_plot, req.body, true);
      } else {
        plot = await Plots.addPlot(req.body);
      }
      res.status(200).json(plot);
    } catch (e) {
      res.status(500).json({
        error: e,
        errorMessage: "Error with google database",
        stack: "plot_router line 56",
      });
    }
  },
);

router.patch(
  "/:plot_id",
  authenticate_jwt,
  helpers.checkPatchTypes,
  async (req, res) => {
    try {
      const old_plot = await Plots.getPlotById(req.params.plot_id);
      if (old_plot) {
        const new_plot = await Plots.editPlot(old_plot, req.body, false);
        res.status(200).json(new_plot);
      } else {
        res.status(404).json({ Error: "No plot with this id exists " });
      }
    } catch (e) {
      res.status(500).json({
        error: e,
        errorMessage: "Error with google database",
        stack: "plot_router line 79",
      });
    }
  },
);

//adds a plant to a plot
router.patch(
  "/:plot_id/plants/:plant_id",
  authenticate_jwt,
  helpers.checkPatchTypes,
  async (req, res) => {
    res.status(200).json({});
  },
);

module.exports = router;

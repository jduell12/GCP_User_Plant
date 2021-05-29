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

//edit plot attributes
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

router.delete("/:plot_id", authenticate_jwt, async (req, res) => {
  Plots.deletePlot(req.params.plot_id).then((check) => {
    if (check) {
      res.status(200).json(`Successfully deleted plot`);
    } else {
      res.status(404).json(`No plot with that id exists`);
    }
  });
});

/***************************************************
 * Plant to Plot relationship endpoints            *
 ***************************************************/
//add a plant to a plot
router.patch(
  "/:plot_id/plants/:plant_id",
  authenticate_jwt,
  helpers.checkPlotAvail,
  async (req, res) => {
    Plots.addPlantToPlot(req.params.plot_id, req.params.plant_id)
      .then(async (check) => {
        if (check) {
          const plot = await Plots.getPlotById(req.params.plot_id, false);
          res.status(200).json(plot);
        } else {
          res.status(404).json({
            Error:
              "The plot and/or the plant do not exist with the provided ids",
          });
        }
      })
      .catch((e) => {
        res.status(500).json({
          error: e,
          errorMessage: "Error with Google database",
          stack: "plot_router line 106",
        });
      });
  },
);

module.exports = router;

const router = require("express").Router();
const Plants = require("./plant_model");
const helpers = require("./helpers");
const authenticate_jwt = require("../middleware/jwt-auth");

//get a list of all user plants
router.get("/", authenticate_jwt, async (req, res) => {
  try {
    if (req.jwt) {
      const plants = await Plants.getPlants(req.sub);
      res.status(200).json(plants);
    } else {
      res.stutus(200).json({ message: "no plants" });
    }
  } catch (e) {
    res.status(500).json({
      error: e,
      errorMessage: "Something went wrong with google cloud",
      stack: "plant_router line 19",
    });
  }
});

//add a plant for the user
router.post("/", authenticate_jwt, helpers.validatePlant, async (req, res) => {
  let plantObj = req.body;
  plantObj.owner_id = req.sub;

  Plants.addPlant(plantObj)
    .then((added_plant) => {
      res.status(201).json(added_plant);
    })
    .catch((e) => {
      res.status(500).json({
        error: e,
        errorMessage: "Something went wrong with google cloud",
        stack: "plant_router line 34",
      });
    });
});

//edit a plant belonging to the validated user
router.put(
  "/:plant_id",
  authenticate_jwt,
  helpers.validatePlant,
  async (req, res) => {
    try {
      const old_plant = await Plants.getPlantById(req.params.plant_id);
      let plant = {};
      if (old_plant) {
        plant = await Plants.editPlant(old_plant, req.body, true);
      } else {
        let plantObj = req.body;
        plantObj.owner_id = req.sub;
        plant = await Plants.addPlant(req.body);
      }
      res.status(200).json(plant);
    } catch (e) {
      res.status(500).json({
        error: e,
        errorMessage: "Error with Google Cloud Database",
        stack: "plant_router line 63",
      });
    }
  },
);

router.patch("/:plant_id", authenticate_jwt, async (req, res) => {
  try {
    const old_plant = await Plants.getPlantById(req.params.plant_id);
    if (old_plant) {
      const new_plant = await Plants.editPlant(old_plant, req.body, false);
      res.status(200).json(new_plant);
    } else {
      res.status(404).json({ Error: "No plant with this id exists" });
    }
  } catch (e) {
    res.status(500).json({
      error: e,
      errorMessage: "Error with Google Cloud Database",
      stack: "plant_router line 82",
    });
  }
});

module.exports = router;

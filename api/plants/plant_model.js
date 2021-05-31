/*
    Used documentation at: 
        https://cloud.google.com/datastore/docs/concepts/entities
        https://cloud.google.com/datastore/docs/concepts/entities#updating_an_entity
*/

const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
const onGoogle = process.env.GOOGLE_CLOUD;
const Plots = require("../plots/plot_model");
let url = onGoogle
  ? "https://osu-493-portfolio.ue.r.appspot.com/plants/"
  : "http://localhost:5000/plants/";

module.exports = {
  getPlants,
  getAllPlants,
  addPlant,
  getPlantById,
  editPlant,
  deletePlant,
  getPlantByPlotId,
  removePlotFromPlant,
  addPlotToPlant,
};

async function getPlants(owner_id) {
  const query = await datastore.createQuery("Plant");
  const [plants] = await datastore.runQuery(query);
  let plant_list = [];

  for (const plant of plants) {
    if (plant.owner_id === owner_id) {
      let plantId = plant[datastore.KEY].id;
      let plantObj = plant;
      plantObj.id = plantId;
      plantObj.self = url + plantId;
      plant_list.push(plantObj);
    }
  }

  return plant_list;
}

async function getAllPlants(req) {
  let query = await datastore.createQuery("Plant");
  const [plants] = await datastore.runQuery(query);
  let plant_obj = { total_plants: plants.length };
  let prev;
  query = await datastore.createQuery("Plant").limit(5);

  if (Object.keys(req.query).includes("cursor")) {
    prev =
      req.protocol +
      "://" +
      req.get("host") +
      req.baseUrl +
      "?cursor=" +
      req.query.cursor;
    query = query.start(req.query.cursor);
  }

  return datastore.runQuery(query).then((res) => {
    const plants = res[0];
    let plant_list = [];

    for (const plant of plants) {
      let add_plant = {
        id: plant[datastore.KEY],
        name: plant.name,
        type: plant.type,
        harvestable: plant.harvestable,
        water_schedule: plant.water_schedule,
        owner_id: plant.owner_id,
        self: url + plant[datastore.KEY],
        plot_id: plant.plot_id,
      };
      plant_list.push(add_plant);
    }
    plant_obj.plants = plant_list;

    if (typeof prev !== undefined) {
      plant_obj.previous = prev;
    }

    if (res[1].moreResults !== datastore.NO_MORE_RESULTS) {
      plant_obj.next = url + "?cursor=" + res[1].endCursor;
    }
    return plant_obj;
  });
}

async function addPlant(plantObj) {
  const plantKey = await datastore.key("Plant", plantObj.name);
  const entity = {
    key: plantKey,
    data: plantObj,
  };
  await datastore.save(entity);
  return {
    id: plantKey.id,
    name: plantObj.name,
    type: plantObj.type,
    harvestable: plantObj.harvestable,
    water_schedule: plantObj.water_schedule,
    owner_id: plantObj.owner_id,
    self: url + plantKey.id,
    plot_id: plantObj.plot_id,
  };
}

async function getPlantById(plant_id) {
  const query = await datastore.createQuery("Plant");
  const [plants] = await datastore.runQuery(query);

  for (const plant of plants) {
    const plantId = plant[datastore.KEY].id;
    if (plantId === plant_id) {
      plant.id = plant_id;
      plant.self = url + plant_id;
      return plant;
    }
  }
  return;
}

async function editPlant(oldPlant, changes, is_put) {
  if (is_put) {
    changes.owner_id = oldPlant.owner_id;
    const new_plant = {
      key: oldPlant[datastore.KEY],
      data: changes,
    };
    await datastore.update(new_plant);
    return {
      id: oldPlant[datastore.KEY].id,
      name: changes.name,
      type: changes.type,
      water_schedule: changes.water_schedule,
      harvestable: changes.harvestable,
      plot_id: changes.plot_id,
      owner_id: oldPlant.owner_id,
      self: url + oldPlant[datastore.KEY].id,
    };
  } else {
    const plant_key = oldPlant[datastore.KEY];
    const new_plant = {
      name: changes.name ? changes.name : oldPlant.name,
      type: changes.type ? changes.type : oldPlant.type,
      harvestable: changes.harvestable
        ? changes.harvestable
        : oldPlant.harvestable,
      water_schedule: changes.water_schedule
        ? changes.water_schedule
        : oldPlant.water_schedule,
      plot_id: changes.plot_id ? changes.plot_id : oldPlant.plot_id,
      owner_id: oldPlant.owner_id,
    };
    //if the user wants to reset a plot number to 0 the above check will always go with the old plot_id since 0 is false
    if (changes.plot_id === 0) {
      new_plant.plot_id = 0;
    }

    const entity = {
      key: plant_key,
      data: new_plant,
    };
    await datastore.update(entity);

    return {
      id: oldPlant.id,
      name: changes.name ? changes.name : oldPlant.name,
      type: changes.type ? changes.type : oldPlant.type,
      harvestable: changes.harvestable
        ? changes.harvestable
        : oldPlant.harvestable,
      water_schedule: changes.water_schedule
        ? changes.water_schedule
        : oldPlant.water_schedule,
      plot_id: changes.plot_id ? changes.plot_id : oldPlant.plot_id,
      owner_id: oldPlant.owner_id,
      self: url + oldPlant.id,
    };
  }
}

async function deletePlant(oldPlant) {
  const key = oldPlant[datastore.KEY];
  const plant_id = key.id;
  const plot_id = oldPlant.plot_id;
  await Plots.removePlantFromPlot(plot_id, plant_id);
  await datastore.delete(key);
  return;
}

async function addPlotToPlant(plant_id, plot_id) {
  try {
    const plant = await getPlantById(plant_id);
    if (plant) {
      const changes = { plot_id: plot_id };
      const changed_plant = await editPlant(plant, changes, false);
      return changed_plant;
    } else {
      return false;
    }
  } catch (e) {
    console.log("plant_model line 150");
    return false;
  }
}

async function getPlantByPlotId(plot_id) {
  const query = await datastore.createQuery("Plot");
  const [plants] = await datastore.runQuery(query);

  for (const plant of plants) {
    if (plant.plot_id === plot_id) {
      return plant;
    }
  }
  return;
}

async function removePlotFromPlant(plant_id, plot_id) {
  try {
    const plant = await getPlantById(plant_id);
    if (plant && plant.plot_id === plot_id) {
      const changes = { plot_id: 0 };
      const changed_plant = await editPlant(plant, changes, false);
      return changed_plant;
    }
    return false;
  } catch (e) {
    console.log("plant_model line 178");
    return false;
  }
}

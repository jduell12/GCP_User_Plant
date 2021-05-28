/*
    Used documentation at: 
        https://cloud.google.com/datastore/docs/concepts/entities
        https://cloud.google.com/datastore/docs/concepts/entities#updating_an_entity
*/

const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
const onGoogle = process.env.GOOGLE_CLOUD;
let url = onGoogle
  ? "https://osu-493-portfolio.ue.r.appspot.com/plants"
  : "http://localhost:5000/plants";

module.exports = {
  getPlants,
  addPlant,
  getPlantById,
  editPlant,
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
      plantObj.self = `${url}/${plantId}`;
      plant_list.push(plantObj);
    }
  }
  return plant_list;
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
    self: `${url}/${plantKey.id}`,
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
    };
  } else {
    const new_plant = {
      key: oldPlant[datastore.KEY],
      name: changes.name ? changes.name : oldPlant.name,
      type: changes.type ? changes.type : oldPlant.type,
      harvestable: changes.harvestable
        ? changes.harvestable
        : oldPlant.harvestable,
      water_schedule: changes.water_schedule
        ? changes.water_schedule
        : oldPlant.water_schedule,
      plot_id: changes.plot_id ? changes.plot_id : oldPlant.plot_id,
    };

    await datastore.update(new_plant);

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
      self: url + oldPlant.id,
    };
  }
}

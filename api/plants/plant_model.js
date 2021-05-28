/*
    Used documentation at https://cloud.google.com/datastore/docs/concepts/entities
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
};

async function getPlants(owner_id) {
  const query = await datastore.createQuery("Plant");
  const [plants] = await datastore.runQuery(query);
  let plant_list = [];

  for (const plant in plants) {
    if (plant.owner_id === owner_id) {
      plant_list.push(plant);
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
  };
}

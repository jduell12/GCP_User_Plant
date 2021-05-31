/*
    Used documentation at: 
        https://cloud.google.com/datastore/docs/concepts/entities
        https://cloud.google.com/datastore/docs/concepts/entities#updating_an_entity
*/

const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
const onGoogle = process.env.GOOGLE_CLOUD;
let url = onGoogle
  ? "https://osu-493-portfolio.ue.r.appspot.com/plots/"
  : "http://localhost:5000/plots/";

module.exports = {
  getPlots,
  getAllPlots,
  addPlot,
  getPlotById,
  editPlot,
  addPlantToPlot,
  deletePlot,
  removePlantFromPlot,
};

async function getPlots(req) {
  let query = await datastore.createQuery("Plot");
  const [plots] = await datastore.runQuery(query);
  let plot_obj = { total_plots: plots.length };
  query = await datastore.createQuery("Plot").limit(5);
  let prev;

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
    const plots = res[0];
    plot_obj.plots = [];
    for (const plot of plots) {
      let add_plot = {
        id: plot[datastore.KEY].id,
        plot_number: plot.plot_number,
        available: plot.available,
        plant_id: plot.plant_id,
        sprinkler_system: plot.sprinkler_system,
        self: url + plot[datastore.KEY].id,
      };
      plot_obj.plots.push(add_plot);
    }

    if (typeof prev !== undefined) {
      plot_obj.previous = prev;
    }
    if (res[1].moreResults !== datastore.NO_MORE_RESULTS) {
      plot_obj.next =
        req.protocol +
        "://" +
        req.get("host") +
        req.baseUrl +
        "?cursor=" +
        res[1].endCursor;
    }
    return plot_obj;
  });
}

async function getAllPlots() {
  const query = await datastore.createQuery("Plot");
  const [plots] = await datastore.runQuery(query);
  let plot_list = [];

  for (const plot of plots) {
    let add_plot = {
      id: plot[datastore.KEY].id,
      plot_number: plot.plot_number,
      available: plot.available,
      plant_id: plot.plant_id,
      sprinkler_system: plot.sprinkler_system,
      self: url + plot[datastore.KEY].id,
    };
    plot_list.push(add_plot);
  }
  return plot_list;
}

async function addPlot(plot_obj) {
  const plot_key = await datastore.key("Plot", plot_obj.plot_number);
  const entity = {
    key: plot_key,
    data: plot_obj,
  };
  await datastore.save(entity);
  return {
    id: plot_key.id,
    plot_number: plot_obj.plot_number,
    available: plot_obj.available,
    sprinkler_system: plot_obj.sprinkler_system,
    plant_id: plot_obj.plant_id,
    self: url + plot_key.id,
  };
}

async function getPlotById(plot_id, for_db = true) {
  const query = await datastore.createQuery("Plot");
  const [plots] = await datastore.runQuery(query);

  for (const plot of plots) {
    if (plot[datastore.KEY].id === plot_id) {
      if (for_db) {
        return plot;
      }
      return {
        id: plot_id,
        available: plot.available,
        plot_number: plot.plot_number,
        plant_id: plot.plant_id,
        sprinkler_system: plot.sprinkler_system,
        self: url + plot_id,
      };
    }
  }
  return false;
}

async function editPlot(old_plot, changes, is_put) {
  if (is_put) {
    const new_plot = {
      key: old_plot[datastore.KEY],
      data: changes,
    };
    await datastore.update(new_plot);

    return {
      id: old_plot[datastore.KEY].id,
      plot_number: changes.plot_number,
      available: changes.available,
      sprinkler_system: changes.sprinkler_system,
      plant_id: changes.plant_id,
      self: url + old_plot[datastore.KEY].id,
    };
  } else {
    const plot_key = old_plot[datastore.KEY];
    const new_plot = {
      plot_number: changes.plot_number
        ? changes.plot_number
        : old_plot.plot_number,
      plant_id: changes.plant_id ? changes.plant_id : old_plot.plant_id,
    };

    if (changes.plot_number === 0) {
      new_plot.plot_number = 0;
    }
    if (changes.plant_id === 0) {
      new_plot.plant_id = 0;
    }
    if (changes.available || changes.available === false) {
      new_plot.available = changes.available;
    } else {
      new_plot.available = old_plot.available;
    }
    if (changes.sprinkler_system || changes.sprinkler_system === false) {
      new_plot.sprinkler_system = changes.sprinkler_system;
    } else {
      new_plot.sprinkler_system = old_plot.sprinkler_system;
    }

    const entity = {
      key: plot_key,
      data: new_plot,
    };

    await datastore.update(entity);

    new_plot.id = plot_key.id;
    new_plot.self = url + plot_key.id;

    return new_plot;
  }
}

async function addPlantToPlot(plot_id, plant_id) {
  try {
    const plot = await getPlotById(plot_id, true);
    if (plot) {
      const changes = { plant_id: plant_id, available: false };
      const changed_plot = await editPlot(plot, changes, false);
      if (changed_plot) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.log("plot_model line 148");
  }
}

async function deletePlot(plot_id) {
  const plot = await getPlotById(plot_id);
  if (plot) {
    if (plot.plant_id) {
      await Plants.removePlotFromPlant(plot.plant_id, plot_id);
    }
    const key = plot[datastore.KEY];
    await datastore.delete(key);
    return true;
  } else {
    return false;
  }
}

async function removePlantFromPlot(plot_id) {
  const plot = await getPlotById(plot_id);

  const changes = {
    plant_id: 0,
    available: true,
  };
  const changed_plot = await editPlot(plot, changes, false);
  if (changed_plot) {
    return true;
  }

  return false;
}

const router = require('express').Router();
const Plants = require('./plant_model');
const helper = require('./helpers');
const authenticate_jwt = require('../middleware/jwt-auth');

//get a list of all user plants
router.get('/', authenticate_jwt, async (req, res) => {
    try{
        if(req.jwt){
            const plants = await Plants.getPlants(req.sub);
            res.status(200).json(plants)
        } else {
            
        }
    }
})
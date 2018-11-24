const express = require('express');
var router = express.Router();
const idHelper = require('../helpers/id')

var {
    Reward
} = require('../models/reward');

router.get('/v1/rewards/feed/:limit', (req, res) => {
    var limit = req.params.limit;
  
    if (!parseInt(limit)) {limit = 3;}
    Reward.find({accepted: true}).sort({_id: '-1'}).limit(parseInt(limit))
    .then((rewards) => {
    if (!rewards || rewards.length === 0) {return res.status(400).send({message: 'Geen rewards gevonden'});}
        return res.status(200).send(rewards);
    });
});

module.exports = router;
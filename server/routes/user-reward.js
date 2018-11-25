const express = require('express');
var router = express.Router();
var m = require('../helpers/message');

const {
  ObjectID
} = require('mongodb');
const idHelper = require('../helpers/id');

var {
  Reward
} = require('../models/reward');
var {
  User
} = require('../models/user');

router.put('/v1/user/reward/add', (req, res) => {
    var token = req.headers['authorization'];
    var reward = new Reward({
      title: req.body.title,
      points: req.body.points,
      description: req.body.description,
      accepted: true
    });

    if (!token) {return res.status(400).send({message: m.message.wrongLogin});}
    reward.save().then((reward) => {
      if (!reward) {return res.status(400).send({message: m.message.noRewardAdded});}
      User.findOne({token: token})
        .then((user) => {
          if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
          if (user.points < reward.points) {return res.status(400).send({message: m.message.notEnoughPoints});}
          user.rewards.push(reward._id);
          user.points = user.points - reward.points;
          user.save().then(() => {
          return res.status(200).send({message: m.message.addedReward, rewardId: reward._id, points: user.points});
          })
        })
    })
  });

router.get('/v1/user/rewards', (req, res) => {
  var token = req.headers['authorization'];

  if (!token) {return res.status(400).send({message: m.message.wrongLogin});}
  User.findOne({token: token})
  .then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
    var ids = idHelper.convertToObjectIds(user.rewards);
    Reward.find({'_id': {$in: ids}})
    .then((rewards) => {
      if (!rewards || rewards.length === 0) {return res.status(400).send({message: m.message.noRewards});}
      {return res.status(200).send(rewards);}
    });
  });
});

module.exports = router;
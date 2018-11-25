const express = require('express');
var router = express.Router();
var m = require('../helpers/message');

var {
  User
} = require('../models/user');
var {
  RewardTemplate
} = require('../models/reward-template');

router.get('/v1/user/target', (req, res) => {
  var token = req.headers['authorization'];

  User.findOne({token: token})
  .then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
    RewardTemplate.findById(user.target)
    .then((reward) => {
      if (!reward) {return res.status(400).send({message: m.message.noTarget});}
      return res.status(200).send({title: reward.title, target: reward.points});
    });
  });
});

router.post('/v1/user/target', (req, res) => {
  var token = req.headers['authorization'];
  var rewardId = req.body.rewardId;

  User.findOne({token: token})
  .then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
    RewardTemplate.findById(rewardId)
    .then((target) => {
      if (!target) {return res.status(400).send({message: m.message.noTarget});}
      console.log(target._id);
      user.target = target._id;
      user.save()
      .then(() => {
        console.log()
        return res.status(200).send({message: m.message.addedTarget});
      });
    });
  });
});

module.exports = router;
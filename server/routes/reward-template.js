const express = require('express');
var router = express.Router();
var m = require('../helpers/message');

var {
  RewardTemplate
} = require('../models/reward-template');
var {
  User
} = require('../models/user');

router.get('/v1/rewards/templates', (req, res) => {
  RewardTemplate.find().then((rewards) => {
    if (!rewards || rewards.length === 0) {return res.status(400).send({message: m.message.noRewardTemplate});}
    return res.status(200).send(rewards);
  });
});

router.get('/v1/reward/template/:id', (req, res) => {
  var id = req.params.id;
  RewardTemplate.findById(id).then((reward) => {
    if (!reward) {return res.status(400).send({message: m.message.noRewardTemplate});}
    console.log(reward);
    return res.status(200).send(reward);
  });
});

router.delete('/v1/reward/template/:id', (req, res) => {
  var id = req.params.id;
  RewardTemplate.findByIdAndDelete(id).then((reward) => {
    if (!reward) {return res.status(400).send({message: m.message.noRewardTemplate});}
    return res.status(200).send({message: m.message.deletedRewardTemplate});
  });
});

router.post('/v1/reward/template/add', (req, res) => {
  var token = req.headers['authorization'];
  var reward = new RewardTemplate({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!token) {return res.status(400).send({message: m.message.wrongLogin});}
  User.findOne({token: token}).then((user) => {
    if (!user || user.type !== 'admin') {return res.status(400).send({message: m.message.wrongLogin});}
    reward.save()
    .then(() => {return res.status(200).send({message: m.message.addedRewardTemplate})});
  });
});

router.put('/v1/reward/template/:id', (req, res) => {
  var token = req.headers['authorization'];
  var title = req.body.title;
  var points = req.body.points;
  var description = req.body.description;
  var id = req.params.id;

  if (!token) {return res.status(400).send({message: m.message.wrongLogin});}
  User.findOne({token: token}).then((user) => {
    if (!user || user.type !== 'admin') {return res.status(400).send({message: m.message.wrongLogin});}
  }).then(() => {
    RewardTemplate.findById(id).then((reward) => {
      if (!reward) {return res.status(400).send({message: m.message.noRewardTemplate});}
      reward.title = title;
      reward.points = points;
      reward.description = description;
      reward.save().then(() => {
        return res.status(200).send({message: m.message.updatedRewardTemplate});
      });
    });
  });
});

module.exports = router;
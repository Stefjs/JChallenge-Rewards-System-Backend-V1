const express = require('express');
var router = express.Router();
var message = require('../helpers/message');

var {
  RewardTemplate
} = require('../models/reward-template');

var {
  User
} = require('../models/user');

router.get('/v1/rewards/templates', (req, res) => {
  RewardTemplate.find().then((rewards) => {
    if (!rewards || rewards.length === 0) {return res.status(400).send({message: message.noRewardTemplate});}
    return res.status(200).send(rewards);
  });
});

router.get('/v1/reward/template/:id', (req, res) => {
  var id = req.params.id;
  RewardTemplate.findById(id).then((reward) => {
    if (!reward) {return res.status(400).send({message: message.noRewardTemplate});}
    return res.status(200).send(reward);
  });
});

router.delete('/v1/reward/template/:id', (req, res) => {
  var id = req.params.id;
  RewardTemplate.findByIdAndDelete(id).then((reward) => {
    if (!reward) {return res.status(400).send({message: message.noRewardTemplate});}
    return res.status(200).send({message: message.deletedRewardTemplate});
  });
});

router.post('/v1/reward/template/add', (req, res) => {
  var token = req.headers['authorization'];
  var reward = new RewardTemplate({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!token) {return res.status(400).send({message: message.wrongLogin});}
  User.findOne({token: token}).then((user) => {
    if (!user || user.type !== 'admin') {return res.status(400).send({message: message.wrongLogin});}
    reward.save()
    .then(() => {return res.status(200).send({message: message.addedRewardTemplate})});
  });
});

router.put('/v1/reward/template/:id', (req, res) => {
  var token = req.headers['authorization'];
  var title = req.body.title;
  var points = req.body.points;
  var description = req.body.description;
  var id = req.params.id;

  if (!token) {return res.status(400).send({message: message.wrongLogin});}
  User.findOne({token: token}).then((user) => {
    if (!user || user.type !== 'admin') {return res.status(400).send({message: message.wrongLogin});}
  }).then(() => {
    RewardTemplate.findById(id).then((reward) => {
      if (!reward) {return res.status(400).send({message: message.noRewardTemplate});}
      reward.title = title;
      reward.points = points;
      reward.description = description;
      reward.save().then(() => {
        return res.status(200).send({message: message.updatedRewardTemplate});
      });
    });
  });
});

module.exports = router;
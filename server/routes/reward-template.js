const express = require('express');
const app = (module.exports = express());

var {
  RewardTemplate
} = require('../models/reward-template');

var {
  User
} = require('../models/user');

app.get('/v1/rewards/templates', (req, res) => {
  RewardTemplate.find().then((rewards) => {
    if (!rewards || rewards.length === 0) {return res.status(400).send({message: 'Geen reward templates gevonden'});}
    return res.status(200).send(rewards);
  });
});

app.get('/v1/reward/template/:id', (req, res) => {
  var id = req.params.id;
  RewardTemplate.findById(id).then((reward) => {
    if (!reward) {return res.status(400).send({message: 'Geen reward templates gevonden'});}
    return res.status(200).send(reward);
  });
});

app.delete('/v1/reward/template/:id', (req, res) => {
  var id = req.params.id;
  RewardTemplate.findByIdAndDelete(id).then((reward) => {
    if (!reward) {return res.status(400).send({message: 'Geen reward template gevonden'});}
    return res.status(400).send({message: 'Reward template verwijderd'});
  });
});

app.post('/v1/reward/template/add', (req, res) => {
  var token = req.headers['authorization'];
  var reward = new RewardTemplate({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!token) {return res.status(400).send({message: 'Foute login'});}
  User.findOne({token: token}).then((user) => {
    if (!user || user.type !== 'admin') {return res.status(400).send({message: 'Foute login'});}
    reward.save()
    .then((reward) => {return res.status(200).send(reward)});
  });
});
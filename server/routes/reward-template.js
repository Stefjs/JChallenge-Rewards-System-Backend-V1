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
    return res.status(200).send(rewards);
  }, (e) => {
    return res.status(400).send(e);
  });
});

app.get('/v1/reward/template/:id', (req, res) => {
  RewardTemplate.findById(req.params.id).then((reward) => {
    if (reward) {
      return res.status(200).send(reward);
    } else {
      return res.status(400).send({
        message: 'Geen reward template gevonden'
      });
    }
  }, (e) => {
    return res.status(400).send({
      message: 'Er is iets mis gegaan'
    });
  });
});

app.delete('/v1/reward/template/:id', (req, res) => {
  RewardTemplate.findByIdAndDelete(req.params.id).then(() => {
    return res.status(200).send({
      message: 'Reward template verwijderd'
    });
  }, (e) => {
    return res.status(400).send({
      message: 'Er is iets mis gegaan'
    });
  });
});

app.post('/v1/reward/template/add', (req, res) => {
  var reward = new RewardTemplate({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!req.body.token) {
    return res.status(400).send({
      message: 'Foute login'
    });
  }

  User.findOne({
    token: req.body.token
  }).then((user) => {

    if (!user) {
        return res.status(400).send({
        message: 'Foute login'
    });}

    if (user.type === 'admin') {
      reward.save().then((doc) => {
        return res.status(200).send(doc);
      }, (e) => {
        return res.status(400).send({
          message: 'Er is iets mis gegaan'
        });
      });
    } else {
      return res.status(400).send({
        message: 'Foute login'
      });
    }

  });
});
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
      description: req.body.description
    });
  
    if (!token) {return res.status(400).send({message: m.message.wrongLogin});}
    reward.save().then((reward) => {
      if (!reward) {return res.status(400).send({message: m.message.noRewardAdded});}
      User.findOne({token: token})
        .then((user) => {
          if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
          if (user.points < reward.points) {return res.status(400).send({message: m.message.notEnoughPoints});}
          user.rewards.push(reward._id);
          user.save().then(() => {
          return res.status(200).send({message: m.message.addedReward, rewardId: reward._id});
          })
        })
    })
  });

router.patch('/v1/user/reward/accept', (req, res) => {
  var rewardId = req.body.rewardId;
  var token = req.headers['authorization'];

  if (!ObjectID.isValid(rewardId)) {return res.status(400).send({message: m.message.wrongRewardId});}

  User.findOne({token: token}).then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
    if (user.type !== 'admin') {return res.status(400).send({message: m.message.noRights});}

    Reward.findById(rewardId).then((reward) => {
      if (!reward || reward.accepted === true) {return res.status(400).send({message: m.message.noAccept});}
      reward.accepted = true;
      reward.save()
      .then((reward) => {
        User.findOne({rewards: reward._id})
        .then((user) => {
          if (!user) {return res.status(400).send({message: m.message.noRewardToAccept});}
          if (user.points < reward.points) {return res.status(400).send({message: m.message.notEnoughPoints});}
          user.points = user.points - reward.points;
          user.save()
          .then(() => {return res.status(200).send({message: m.message.rewardAccepted});
          });
        });
      });
    });
  });
});

router.delete('/v1/user/reward/reject', (req, res) => {
  var rewardId = req.body.rewardId;
  var token = req.headers['authorization'];

  if (!ObjectID.isValid(rewardId)) {return res.status(400).send({message: m.message.wrongRewardId});}

  User.findOne({token: token}).then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
    if (user.type !== 'admin') {return res.status(400).send({message: m.message.noRights});}

    Reward.findById(rewardId).then((reward) => {
      if (!reward) {return res.status(400).send({message: m.message.noReward});}
      reward.delete().then(() => {
        return res.status(200).send({message: m.message.rewardRejected});
      })
    });
  });
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

router.get('/v1/users/rewards', (req, res) => {
  var allData = [];

  User.find({'type': 'worker'})
  .then((users) => {
    var counter = 0;
    Promise.all(
      users.map((user) => {
        if (user.rewards.length !== 0) {
          var data = {user: '', rewards: []};
          data.user = user.name;
          Reward.find({'_id': {$in: user.rewards}})
          .then((rewards) => {
            data.rewards.push(rewards);
            counter++;
            if (counter === users.length) {return res.status(200).send(allData)}
          });
          allData.push(data);
        } else {
          counter++;
        }
      })
    )
  });
});

module.exports = router;
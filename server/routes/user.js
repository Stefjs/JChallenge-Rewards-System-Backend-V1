const express = require('express');
var router = express.Router();
var m = require('../helpers/message');

const {
  ObjectID
} = require('mongodb');
const bcryptjs = require('bcryptjs');
const tokenHelper = require('../helpers/token');
const idHelper = require('../helpers/id');

var {
  Task
} = require('../models/task');
var {
  User
} = require('../models/user');
var {
  Reward
} = require('../models/reward');
var {
  RewardTemplate
} = require('../models/reward-template');


router.post('/v1/user/login', (req, res) => {
  var password = req.body.password;
  var email = req.body.email;

  User.findOne({
    email: email
  }).then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin})};
    var valid = bcryptjs.compareSync(password, user.password);
    if (!valid) {return res.status(400).send({message: m.message.wrongLogin})};
    user.token = tokenHelper.generateToken(user);
    user.save().then(() => {
      return res.status(200).send({
        _id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
        points: user.points,
        token: user.token,
        target: user.target
      }); 
    });
  });
});

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
        user.save();
        res.status(200).send({message: m.message.addedReward, rewardId: reward._id});
      })
  })
});

router.put('/v1/user/task/add', (req, res) => {
  var token = req.headers['authorization'];
  var task = new Task({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!token) {return res.status(400).send({message: m.message.wrongLogin});}
  task.save().then((task) => {
    User.findOne({token: token})
      .then((user) => {
        user.tasks.push(task._id);
        user.save();
        res.status(200).send({message: m.message.addedTask,taskId: task._id});
      });
  })
});

router.patch('/v1/user/task/accept', (req, res) => {
  var taskId = req.body.taskId;
  var token = req.headers['authorization'];

  if (!ObjectID.isValid(taskId)) {return res.status(400).send({message: m.message.wrongTaskId});}

  User.findOne({token: token}).then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
    if (user.type !== 'admin') {return res.status(400).send({message: m.message.noRights});}

    Task.findById(taskId).then((task) => {
      if (!task || task.accepted === true) {return res.status(400).send({message: m.message.noTaskToaccept});}
      task.accepted = true;
      task.save()
      .then((task) => {
        User.findOne({tasks: task._id})
        .then((user) => {
          if (!user) {return res.status(400).send({message: m.message.noTaskToaccept});}
          user.points = user.points + task.points;
          user.save()
          .then(() => {return res.status(400).send({message: m.message.taskAccepted});
          });
        });
      });
    });
  });
});

router.patch('/v1/user/reward/accept', (req, res) => {
  var rewardId = req.body.rewardId;
  var token = req.headers['authorization'];

  if (!ObjectID.isValid(rewardId)) {return res.status(400).send({message: m.message.wrongRewardId});}

  User.findOne({token: token}).then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
    if (user.type !== 'admin') {return res.status(400).send({message: m.message.noRights});}

    Reward.findById(rewardId).then((reward) => {
      if (!reward || reward.accepted === true) {return res.status(400).send({message: m.message.noRewardToAccept});}
      reward.accepted = true;
      reward.save()
      .then((reward) => {
        User.findOne({rewards: reward._id})
        .then((user) => {
          if (!user) {return res.status(400).send({message: m.message.noRewardToAccept});}
          if (user.points < reward.points) {return res.status(400).send({message: m.message.notEnoughPoints});}
          user.points = user.points - reward.points;
          user.save()
          .then(() => {return res.status(400).send({message: m.message.rewardAccepted});
          });
        });
      });
    });
  });
});

router.get('/v1/user/tasks', (req, res) => {
  var token = req.headers['authorization'];

  if (!token) {return res.status(400).send({message: m.message.wrongLogin});}
  User.findOne({token: token})
  .then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
    var ids = idHelper.convertToObjectIds(user.tasks);
    Task.find({'_id': {$in: ids}})
    .then((tasks) => {
      if (!tasks || tasks.length === 0) {return res.status(400).send({message: m.message.noTasks});}
      {return res.status(400).send(tasks);}
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
      {return res.status(400).send(rewards);}
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

router.get('/v1/users/tasks', (req, res) => {
  var allData = [];

  User.find({'type': 'worker'})
  .then((users) => {
    var counter = 0;
    Promise.all(
      users.map((user) => {
        if (user.tasks.length !== 0) {
          var data = {user: '', tasks: []};
          data.user = user.name;
          Task.find({'_id': {$in: user.tasks}})
          .then((tasks) => {
            data.tasks.push(tasks);
            counter++;
            if (counter === users.length) {return res.status(200).send(allData)}
          });
          allData.push(data);
        } else {
          counter++;
        }
      })
    )
  })
});

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
      user.target = target._id;
      user.save()
      .then(() => {
        return res.status(200).send({message: m.message.addedTarget});
      });
    });
  });
});

module.exports = router;
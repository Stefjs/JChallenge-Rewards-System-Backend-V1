const express = require('express');
const app = (module.exports = express());
const {
  ObjectID
} = require('mongodb');
const bcryptjs = require('bcryptjs');
const tokenHelper = require('../helpers/token');
const idHelper = require('../helpers/id')

var {
  Task
} = require('../models/task');
var {
  User
} = require('../models/user');
var {
  Reward
} = require('../models/reward');

app.post('/v1/user/login', (req, res) => {
  var password = req.body.password;
  var email = req.body.email;

  User.findOne({
    email: email
  })
  .then((user) => {
    if (!user) {return res.status(400).send({message: 'Foute login'})};
    var valid = bcryptjs.compareSync(password, user.password);
    if (!valid) {return res.status(400).send({message: 'Foute login'})};
    user.token = tokenHelper.generateToken(user);
    user.save().then(() => {
      return res.status(200).send({
        _id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
        points: user.points,
        token: user.token
      }); 
    });
  });
});

app.put('/v1/user/reward', (req, res) => {
  var reward = new Reward({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!req.body.token) {return res.status(400).send({message: 'Foute login'});}
  reward.save().then((reward) => {
    if (!reward) {return res.status(400).send({message: 'Reward niet toegevoegd'});}
    User.findOne({token: req.body.token})
      .then((user) => {
        if (!user) {return res.status(400).send({message: 'Foute login'});}
        if (user.points < reward.points) {return res.status(400).send({message: 'Niet genoeg punten'});}
        user.rewards.push(reward._id);
        user.save();
        res.status(200).send({message: 'Reward toegevoegd', rewardId: reward._id});
      })
  })
});

app.put('/v1/user/task', (req, res) => {
  var task = new Task({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!req.body.token) {return res.status(400).send({message: 'Foute login'});}
  task.save().then((task) => {
    User.findOne({token: req.body.token})
      .then((user) => {
        user.tasks.push(task._id);
        user.save();
        res.status(200).send({message: 'Task toegevoegd',taskId: task._id});
      });
  })
});

app.patch('/v1/user/task/accept', (req, res) => {
  var taskId = req.body.taskId;
  var token = req.body.token;

  if (!ObjectID.isValid(taskId)) {return res.status(400).send({message: 'Foute taskId'});}

  User.findOne({token: token}).then((user) => {
    if (!user) {return res.status(400).send({message: 'Foute login'});}
    if (user.type !== 'admin') {return res.status(400).send({message: 'U bent niet bevoegd om deze actie uit te voeren'});}

    Task.findById(taskId).then((task) => {
      if (!task || task.accepted === true) {return res.status(400).send({message: 'Geen task om te accepteren'});}
      task.accepted = true;
      task.save()
      .then((task) => {
        User.findOne({tasks: task._id})
        .then((user) => {
          if (!user) {return res.status(400).send({message: 'Geen task om te accepteren'});}
          user.points = user.points + task.points;
          user.save()
          .then(() => {return res.status(400).send({message: 'Task is geaccepteerd'});
          });
        });
      });
    });
  });
});

app.patch('/v1/user/reward/accept', (req, res) => {
  var rewardId = req.body.rewardId;
  var token = req.body.token;

  if (!ObjectID.isValid(rewardId)) {return res.status(400).send({message: 'Foute rewardId'});}

  User.findOne({token: token}).then((user) => {
    if (!user) {return res.status(400).send({message: 'Foute login'});}
    if (user.type !== 'admin') {return res.status(400).send({message: 'U bent niet bevoegd om deze actie uit te voeren'});}

    Reward.findById(rewardId).then((reward) => {
      if (!reward || reward.accepted === true) {return res.status(400).send({message: 'Geen reward om te accepteren'});}
      reward.accepted = true;
      reward.save()
      .then((reward) => {
        User.findOne({rewards: reward._id})
        .then((user) => {
          if (!user) {return res.status(400).send({message: 'Geen reward om te accepteren'});}
          if (user.points < reward.points) {return res.status(400).send({message: 'Niet genoeg punten'});}
          user.points = user.points - reward.points;
          user.save()
          .then(() => {return res.status(400).send({message: 'Reward is geaccepteerd'});
          });
        });
      });
    });
  });
});

app.get('/v1/user/:token/tasks', (req, res) => {
  var token = req.params.token;

  if (!token) {return res.status(400).send({message: 'Foute login'});}
  User.findOne({token: token})
  .then((user) => {
    if (!user) {return res.status(400).send({message: 'Foute login'});}
    var ids = idHelper.convertToObjectIds(user.tasks);
    Task.find({'_id': {$in: ids}})
    .then((tasks) => {
      if (!tasks || tasks.length === 0) {return res.status(400).send({message: 'Geen tasks gevonden'});}
      {return res.status(400).send(tasks);}
    });
  });
});

app.get('/v1/user/:token/rewards', (req, res) => {
  var token = req.params.token;

  if (!token) {return res.status(400).send({message: 'Foute login'});}
  User.findOne({token: token})
  .then((user) => {
    if (!user) {return res.status(400).send({message: 'Foute login'});}
    var ids = idHelper.convertToObjectIds(user.rewards);
    Reward.find({'_id': {$in: ids}})
    .then((rewards) => {
      if (!rewards || rewards.length === 0) {return res.status(400).send({message: 'Geen rewards gevonden'});}
      {return res.status(400).send(rewards);}
    });
  });
});

app.get('/v1/users/rewards', (req, res) => {
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
  })
});

app.get('/v1/users/tasks', (req, res) => {
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
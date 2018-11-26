const express = require('express');
var router = express.Router();
var m = require('../helpers/message');

const {
  ObjectID
} = require('mongodb');
const idHelper = require('../helpers/id');

var {
  Task
} = require('../models/task');
var {
  User
} = require('../models/user');

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
          .then(() => {return res.status(200).send({message: m.message.taskAccepted});
          });
        });
      });
    });
  });
});

router.delete('/v1/user/task/reject', (req, res) => {
  var taskId = req.body.taskId;
  var token = req.headers['authorization'];

  if (!ObjectID.isValid(taskId)) {return res.status(400).send({message: m.message.wrongRewardId});}

  User.findOne({token: token}).then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin});}
    if (user.type !== 'admin') {return res.status(400).send({message: m.message.noRights});}

    Task.findById(taskId).then((task) => {
      if (!task) {return res.status(400).send({message: m.message.noTask});}
      task.delete().then(() => {
        return res.status(200).send({message: m.message.taskRejected});
      })
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
      {return res.status(200).send(tasks);}
    });
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

module.exports = router;
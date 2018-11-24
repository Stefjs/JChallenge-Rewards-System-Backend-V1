const express = require('express');
var router = express.Router();
var m = require('../helpers/message');

var {
  TaskTemplate
} = require('../models/task-template');

var {
  User
} = require('../models/user');

router.get('/v1/tasks/templates', (req, res) => {
  TaskTemplate.find().then((tasks) => {
    if (!tasks || tasks.length === 0) {return res.status(400).send({message: m.message.noTaskTemplate});}
    return res.status(200).send(tasks);
  });
});

router.get('/v1/task/template/:id', (req, res) => {
  var id = req.params.id;
  TaskTemplate.findById(id).then((tasks) => {
    if (!tasks) {return res.status(400).send({message: m.message.noTaskTemplate});}
    return res.status(200).send(tasks);
  });
});

router.delete('/v1/task/template/:id', (req, res) => {
  var id = req.params.id;
  TaskTemplate.findByIdAndDelete(id).then((tasks) => {
    if (!tasks) {return res.status(400).send({message: m.message.noTaskTemplate});}
    return res.status(200).send({message: m.message.deletedTaskTemplate});
  });
});

router.post('/v1/task/template/add', (req, res) => {
  var token = req.headers['authorization'];
  var task = new TaskTemplate({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!token) {return res.status(400).send({message: 'Foute login'});}
  User.findOne({token: token}).then((user) => {
    if (!user || user.type !== 'admin') {return res.status(400).send({message: m.message.wrongLogin});}
    task.save()
    .then(() => {return res.status(200).send({message: m.message.addedTaskTemplate})});
  });
});

router.put('/v1/task/template/:id', (req, res) => {
  var token = req.headers['authorization'];
  var title = req.body.title;
  var points = req.body.points;
  var description = req.body.description;
  var id = req.params.id;

  if (!token) {return res.status(400).send({message: 'Foute login'});}
  User.findOne({token: token}).then((user) => {
    if (!user || user.type !== 'admin') {return res.status(400).send({message: m.message.wrongLogin});}
  }).then(() => {
    TaskTemplate.findById(id).then((task) => {
      if (!task) {return res.status(400).send({message: m.message.noTaskTemplate});}
      task.title = title;
      task.points = points;
      task.description = description;
      task.save().then(() => {
        return res.status(200).send({message: m.message.updatedTaskTemplate});
      });
    });
  });
});

module.exports = router;
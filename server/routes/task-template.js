const express = require('express');
const app = (module.exports = express());

var {
  TaskTemplate
} = require('../models/task-template');

var {
  User
} = require('../models/user');

app.get('/v1/tasks/templates', (req, res) => {
  TaskTemplate.find().then((tasks) => {
    if (!tasks || tasks.length === 0) {return res.status(400).send({message: 'Geen task templates gevonden'});}
    return res.status(200).send(tasks);
  });
});

app.get('/v1/task/template/:id', (req, res) => {
  var id = req.params.id;
  TaskTemplate.findById(id).then((tasks) => {
    if (!tasks) {return res.status(400).send({message: 'Geen task template gevonden'});}
    return res.status(200).send(tasks);
  });
});

app.delete('/v1/task/template/:id', (req, res) => {
  var id = req.params.id;
  TaskTemplate.findByIdAndDelete(id).then((tasks) => {
    if (!tasks) {return res.status(400).send({message: 'Geen task template gevonden'});}
    return res.status(400).send({message: 'Task template verwijderd'});
  });
});

app.post('/v1/task/template/add', (req, res) => {
  var token = req.headers['authorization'];
  var task = new TaskTemplate({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!token) {return res.status(400).send({message: 'Foute login'});}
  User.findOne({token: token}).then((user) => {
    if (!user || user.type !== 'admin') {return res.status(400).send({message: 'Foute login'});}
    task.save()
    .then((task) => {return res.status(200).send(task)});
  });
});

app.put('/v1/task/template/:id', (req, res) => {
  var token = req.headers['authorization'];
  var title = req.body.title;
  var points = req.body.points;
  var description = req.body.description;
  var id = req.params.id;

  if (!token) {return res.status(400).send({message: 'Foute login'});}
  User.findOne({token: token}).then((user) => {
    if (!user || user.type !== 'admin') {return res.status(400).send({message: 'Foute login'});}
  }).then(() => {
    TaskTemplate.findById(id).then((task) => {
      if (!task) {return res.status(400).send({message: 'Geen reward template gevonden'});}
      task.title = title;
      task.points = points;
      task.description = description;
      task.save().then((task) => {
        return res.status(200).send({message: 'Reward template geupdate'});
      });
    });
  });
});
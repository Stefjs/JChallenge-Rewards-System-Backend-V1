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
    return res.status(200).send(tasks);
  }, (e) => {
    return res.status(400).send(e);
  });
});

app.get('/v1/task/template/:id', (req, res) => {
  TaskTemplate.findById(req.params.id).then((task) => {
    if (task) {
      return res.status(200).send(task);
    } else {
      return res.status(400).send({
        message: 'Geen task template gevonden'
      });
    }
  }, (e) => {
    return res.status(400).send(e);
  });
});

app.delete('/v1/task/template/:id', (req, res) => {
  TaskTemplate.findByIdAndDelete(req.params.id).then(() => {
    return res.status(200).send({
      message: 'Task template verwijderd'
    });
  }, (e) => {
    return res.status(400).send(e);
  });
});

app.post('/v1/task/template/add', (req, res) => {
  var task = new TaskTemplate({
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
      task.save().then((doc) => {
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
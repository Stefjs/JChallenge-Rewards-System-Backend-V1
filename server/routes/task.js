const express = require('express');
const app = (module.exports = express());

var {
  Task
} = require('../models/task');

var {
  User
} = require('../models/user');

// app.post('/v1/task/add', (req, res) => {
//   var task = new Task({
//     title: req.body.title,
//     points: req.body.points,
//     description: req.body.description
//   });

//   if (!req.body.token) {
//     return res.status(400).send({
//       message: 'Foute login'
//     });
//   }

//   User.findOne({
//     token: req.body.token
//   }).then((user) => {

//     if (user.type === 'admin') {
//       task.save().then((doc) => {
//         return res.status(200).send(doc);
//       }, (e) => {
//         res.status(400).send({
//           message: 'Er is iets mis gegaan'
//         });
//       });
//     } else {
//       res.status(400).send({
//         message: 'Foute login'
//       });
//     }
//   });
// });

app.get('/v1/tasks', (req, res) => {
  Task.find({accepted: false}).then((tasks) => {

    if(tasks.length === 0) {
      return res.status(400).send({
        message: 'Geen tasks gevonden die moeten goedgekeurd worden'
      });
    }

    console.log(tasks[0]._id);

    User.findOne({
      rewards: tasks[0]._id
    }).then((user) => {
      console.log(user);
      if(!user) {
        return res.status(400).send({
          message: 'Geen tasks gevonden die moeten goedgekeurd worden'
        });
      }

     return res.status(200).send({
      name: user.name,
      tasks
     });
    });  
  }, (e) => {
    return res.status(400).send({
      message: 'Er is iets mis gegaan'
    });
  });

  
});

app.get('/v1/tasks/feed/:limit', (req, res) => {
  var limit = req.params.limit;

  if (!parseInt(limit)) {
    limit = 3;
  }

  Task.find({
      accepted: true
    }).sort({
      _id: '-1'
    }).limit(parseInt(limit))
    .then((tasks) => {
      return res.status(200).send(
        tasks
      );
    }, (e) => {
      res.status(400).send({
        message: 'Er is iets mis gegaan'
      });
    });
});
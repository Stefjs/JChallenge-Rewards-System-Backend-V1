const express = require('express');
const app = (module.exports = express());

var {
  Task
} = require('../models/task');

app.get('/v1/tasks/feed/:limit', (req, res) => {
  var limit = req.params.limit;
    console.log("Limit: " + limit);

  if (!parseInt(limit)) {limit = 3;}
  Task.find({accepted: true}).sort({_id: '-1'}).limit(parseInt(limit))
  .then((tasks) => {
    if (!tasks || tasks.length === 0) {
        return res.status(400).send({message: 'Geen tasks gevonden'});
    }
      return res.status(200).send(tasks);
  });
});
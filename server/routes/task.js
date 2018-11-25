const express = require('express');
var router = express.Router();
var m = require('../helpers/message');

var {
  Task
} = require('../models/task');
var {
  User
} = require('../models/user');

router.get('/v1/tasks/feed/:limit', (req, res) => {
  var limit = req.params.limit;
  var allTexts = [];

  if (!parseInt(limit)) {limit = 3;}
  Task.find({accepted: true}).sort({_id: '-1'}).limit(parseInt(limit))
  .then((tasks) => {
    if (!tasks || tasks.length === 0) {return res.status(400).send({message: m.message.noTasks});}
    var counter = 0;
    Promise.all(
      tasks.map((task) => {
        User.findOne({'tasks': task._id}).then((user) => {
          var texts = {text: ''};
          var text = user.name +
           " heeft de opdracht " +
           task.title+
          " voltooid en heeft hiervoor " +
          task.points + " punten gekregen";
          texts.text = text;
          allTexts.push(texts);
          counter++;
          if (counter === tasks.length) {return res.status(200).send(allTexts);}
        });
      })
    )
  });
});

module.exports = router;

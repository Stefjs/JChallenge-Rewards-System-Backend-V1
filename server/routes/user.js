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
  User.findOne({
    email: req.body.email
  }, function (err, user) {
    if (err) {
      res.status(400).send({
        message: 'Foute login'
      });
    }
    if (user) {
      var valid = bcryptjs.compareSync(password, user.password);
      if (valid) {
        user.token = tokenHelper.generateToken(user);
        user.save();
        return res.status(200).send({
          _id: user._id,
          email: user.email,
          name: user.name,
          type: user.type,
          points: user.points,
          token: user.token
        });
      }
    } else {
      res.status(400).send({
        message: 'Foute login'
      });
    }
  });
});

app.put('/v1/user/reward', (req, res) => {
  var reward = new Reward({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!req.body.token) {
    return res.status(400).send({
      message: 'Foute login'
    });
  }

  reward.save().then((reward) => {
    User.findOne({
        token: req.body.token
      }).then((user) => {
        user.rewards.push(reward._id);
        user.save();
      })
      .then(() => res.status(200).send({
        message: 'Reward toegevoegd',
        rewardId: reward._id
      }));
  });
});

app.put('/v1/user/task', (req, res) => {
  var task = new Task({
    title: req.body.title,
    points: req.body.points,
    description: req.body.description
  });

  if (!req.body.token) {
    return res.status(400).send({
      message: 'Foute login'
    });
  }

  task.save().then((task) => {
    User.findOne({
        token: req.body.token
      }).then((user) => {
        user.tasks.push(task._id);
        user.save();
      })
      .then(() => res.status(200).send({
        message: 'Task toegevoegd',
        taskId: task._id
      }));
  });
});

app.patch('/v1/user/task/accept', (req, res) => {
  var taskId = req.body.taskId;
  if (!ObjectID.isValid(taskId)) {
    return res.status(404).send();
  }

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
      Task.findById(taskId).then((task) => {
        if (task && task.acccept != true) {
          task.accepted = true;
          task.save();

          User.findOne({
            tasks: task._id
          }).then((user) => {
            user.points = user.points + task.points;
            user.save();
          });  

          return res.status(200).send({
            message: 'Task is geaccepteerd'
          });
        } else {
          return res.status(400).send({
            message: 'Task niet gevonden'
          });
        }
      }).catch((e) => {
        return res.status(400).send({
          message: 'Er is iets mis gegaan'
        });
      });
    } else {
      return res.status(400).send({
        message: 'Foute login'
      });
    }
  })
});

app.patch('/v1/user/reward/accept', (req, res) => {
  var rewardId = req.body.rewardId;
  if (!ObjectID.isValid(rewardId)) {
    return res.status(400).send();
  }

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
      Reward.findById(rewardId).then((reward) => {
        if (reward && reward.accept != true) {
          reward.accepted = true;
          reward.save();

        User.findOne({
          rewards: reward._id
        }).then((user) => {
          user.points = user.points - reward.points;
          user.save();
        });  

          return res.status(200).send({
            message: 'Reward is geaccepteerd'
          });
        } else {
          return res.status(400).send({
            message: 'Reward niet gevonden'
          });
        }
      }).catch((e) => {
        return res.status(400).send({
          message: 'Er is iets mis gegaan'
        });
      });
    } else {
      return res.status(400).send({
        message: 'Foute login'
      });
    }
  })
});

app.get('/v1/user/:token/tasks', (req, res) => {
  if (!req.params.token) {
    return res.status(400).send({
      message: 'Foute login'
    });
  }
  User.findOne({
    token: req.params.token
  }, function (err, user) {
    if (user) {
      var ids = idHelper.convertToObjectIds(user.tasks);
      Task.find({
        '_id': {
          $in: ids
        }
      }, function (err, tasks) {
        return res.status(200).send(tasks);
      });
    } else {
      return res.status(400).send({
        message: 'Foute login'
      });
    }
  }).catch((e) => {
    return res.status(400).send({
      message: 'Er is iets mis gegaan'
    });
  });
});

app.get('/v1/user/:token/rewards', (req, res) => {
  if (!req.params.token) {
    return res.status(400).send({
      message: 'Foute login'
    });
  }
  User.findOne({
    token: req.params.token
  }, function (err, user) {
    if (user) {
      var ids = idHelper.convertToObjectIds(user.rewards);
      Reward.find({
        '_id': {
          $in: ids
        }
      }, function (err, rewards) {
        return res.status(200).send(rewards);
      });
    } else {
      return res.status(400).send({
        message: 'Foute login'
      });
    }
  }).catch((e) => {
    return res.status(400).send({
      message: 'Er is iets mis gegaan'
    });
  });
});

app.get('/v1/users/rewards', (req, res) => {
  var allData = [];
  
  User.find({'type': 'worker'}).then((users) => {
    var counter = 0;
    users.forEach(function(user) {

      if (user.rewards.length != 0) {
        var data = {
          user: '',
          rewards: []
        };
  
        data.user = user.name;
        
        Reward.find({
          '_id': {
            $in: user.rewards
          }
        }).then((rewards) => {
          data.rewards.push(rewards);
          counter++;
          if(counter === users.length) {
            return res.send(allData);
          }
        });
        allData.push(data);
      } else {
        counter++;
      }
  });
  });
});

app.get('/v1/users/tasks', (req, res) => {
  var allData = [];
  
  User.find({'type': 'worker'}).then((users) => {
    var counter = 0;
    users.forEach(function(user) {

      if (user.tasks.length != 0) {
        var data = {
          user: '',
          tasks: []
        };
  
        data.user = user.name;
        
        Task.find({
          '_id': {
            $in: user.tasks
          }
        }).then((tasks) => {
          data.tasks.push(tasks);
          counter++;
          if(counter === users.length) {
            return res.send(allData);
          }
        });
        allData.push(data);
      } else {
        counter++;
      }
  });
  });
});

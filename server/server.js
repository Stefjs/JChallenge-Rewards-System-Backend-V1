const _ = require('lodash');
const express = require('express');
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const {
  ObjectID
} = require('mongodb');

const screen = require('./helpers/screen');

const task = require('./routes/task');
const taskTemplate = require('./routes/task-template');
const reward = require('./routes/reward');
const rewardTemplate = require('./routes/reward-template');
const user = require('./routes/user');

const optionDefinitions = [
  { name: 'clean', alias: 'c', type: Boolean }
]
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)

const cleaner = require('./data/clean-database');
const filler = require('./data/fill-database')

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(task, taskTemplate, reward, rewardTemplate, user);

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

var onStartup = () => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
  screen.showScreen('Team11 - API');
}

if(options.clean === true) {
  console.log('Restoring database')
  cleaner.cleanDatabase()
  .then(() => filler.fillDatabase())
  .then(() => {
    return onStartup();
  });
} else {
  return onStartup();
}


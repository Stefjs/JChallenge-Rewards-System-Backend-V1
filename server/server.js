const _ = require('lodash');
const express = require('express');
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const {
  ObjectID
} = require('mongodb');

const screen = require("./helpers/screen");

const task = require("./routes/task");
const taskTemplate = require("./routes/task-template");
const reward = require("./routes/reward");
const rewardTemplate = require("./routes/reward-template");
const user = require("./routes/user");

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(task, taskTemplate, reward, rewardTemplate, user);

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

screen.showScreen('Team11 - API');


// data.cleanDatabase();
// data.fillDatabase();
const _ = require('lodash');
const express = require('express');
var app = express();
const bodyParser = require('body-parser');
const {
  ObjectID
} = require('mongodb');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// data.cleanDatabase();
// data.fillDatabase();
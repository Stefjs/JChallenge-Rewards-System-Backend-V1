const express = require('express');
var router = express.Router();
var m = require('../helpers/message');

const bcryptjs = require('bcryptjs');
const tokenHelper = require('../helpers/token');

var {
  User
} = require('../models/user');

router.post('/v1/user/login', (req, res) => {
  var password = req.body.password;
  var email = req.body.email;

  User.findOne({
    email: email
  }).then((user) => {
    if (!user) {return res.status(400).send({message: m.message.wrongLogin})};
    var valid = bcryptjs.compareSync(password, user.password);
    if (!valid) {return res.status(400).send({message: m.message.wrongLogin})};
    user.token = tokenHelper.generateToken(user);
    user.save().then(() => {
      return res.status(200).send({
        _id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
        points: user.points,
        token: user.token,
        target: user.target
      }); 
    });
  });
});

module.exports = router;
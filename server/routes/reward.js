const express = require('express');
var router = express.Router();
var m = require('../helpers/message');

var {
    Reward
} = require('../models/reward');
var {
    User
} = require('../models/user');

router.get('/v1/rewards/feed/:limit', (req, res) => {
    var limit = req.params.limit;
    var allTexts = [];
  
    if (!parseInt(limit)) {limit = 3;}
    Reward.find({accepted: true}).sort({_id: '1'}).limit(parseInt(limit))
    .then((rewards) => {
      if (!rewards || rewards.length === 0) {return res.status(400).send({message: m.message.noRewards});}
      var counter = 0;
      Promise.all(
        rewards.map((reward) => {
          User.findOne({'rewards': reward._id}).then((user) => {
            if (user) {
              var texts = {text: ''};
              var text = user.name +
               " heeft " +
               reward.title+
              " ontvangen ";
              texts.text = text;
              allTexts.push(texts);
              counter++;
            } else {
              counter++;
            }
            if (counter === rewards.length) {return res.status(200).send(allTexts);}
          });
        })
      )
    });
  });

module.exports = router;
const express = require('express');
const app = (module.exports = express());

const idHelper = require('../helpers/id')

var {
    Reward
} = require('../models/reward');

var {
    User
} = require('../models/user');

app.get('/v1/rewards', (req, res) => {
    Reward.find({accepted: false}).then((rewards) => {

        if(rewards.length === 0) {
            return res.status(400).send({
              message: 'Geen rewards gevonden die moeten goedgekeurd worden'
            });
        }

        User.findOne({
            rewards: rewards[0]._id
          }).then((user) => {

            if(!user) {
                return res.status(400).send({
                  message: 'Geen rewards gevonden die moeten goedgekeurd worden'
                });
            }

           return res.status(200).send({
            name: user.name,
            rewards
           });
          });  
    }, (e) => {
        return res.status(400).send({
            message: 'Er is iets mis gegaan'
        });
    });
});

// app.post('/v1/reward/add', (req, res) => {
//     var reward = new Reward({
//         title: req.body.title,
//         points: req.body.points,
//         description: req.body.description
//     });

//     if (!req.body.token) {
//         return res.status(400).send({
//             message: 'Foute login'
//         });
//     }

//     User.findOne({
//         token: req.body.token
//     }).then((user) => {

//         if (user.type === 'admin') {
//             reward.save().then((doc) => {
//                 return res.status(200).send(doc);
//             }, (e) => {
//                 return res.status(400).send({
//                     message: 'Er is iets mis gegaan'
//                 });
//             });
//         } else {
//             return res.status(400).send({
//                 message: 'Foute login'
//             });
//         }
//     });
// });

app.get('/v1/rewards/feed/:limit', (req, res) => {
    var limit = req.params.limit;

    if (!parseInt(limit)) {
        limit = 3;
    }

    Reward.find({
            accepted: true
        }).sort({
            _id: '-1'
        }).limit(parseInt(limit))
        .then((rewards) => {
            return res.status(200).send(
                rewards
            );
        }, (e) => {
            return res.status(400).send({
                message: 'Er is iets mis gegaan'
            });
        });
});
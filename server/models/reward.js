var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rewardSchema = Schema ({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  points: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  accepted: {
    type: Boolean,
    default: false
  },
});

var Reward = mongoose.model('Reward', rewardSchema);

module.exports = {Reward}

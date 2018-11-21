var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema ({
  _id: Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  type: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: false
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  tasks: [{type: Schema.Types.ObjectId, ref: 'Task' }],
  rewards: [{type: Schema.Types.ObjectId, ref: 'Reward' }]
});

var User = mongoose.model('User', userSchema);

module.exports = {User}
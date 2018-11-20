var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskSchema = Schema ({
  title: {
    type: String,
    minlength: 1,
    trim: true
  },
  points: {
    type: Number,
    default: null
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

var Task = mongoose.model('Task', taskSchema);

module.exports = {Task};

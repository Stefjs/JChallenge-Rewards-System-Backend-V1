var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskTemplateSchema = Schema ({
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

var TaskTemplate = mongoose.model('TaskTemplate', taskTemplateSchema);

module.exports = {TaskTemplate};

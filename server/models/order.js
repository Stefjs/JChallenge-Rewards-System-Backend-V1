var mongoose = require('mongoose');

var orderSchema = Schema ({
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  accepted: {
    type: Boolean,
    default: false
  }
});

var Order = mongoose.model('Order', orderSchema);

module.exports = {Order};

var mongoose = require('mongoose');

const options = {
    useNewUrlParser: true
  };

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://admin:admin123@ds024748.mlab.com:24748/reward', options);


module.exports = {mongoose};

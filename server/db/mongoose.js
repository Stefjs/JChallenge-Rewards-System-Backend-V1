var mongoose = require('mongoose');

const options = {
    useNewUrlParser: true
  };

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://admin:admin123@ds051077.mlab.com:51077/reward-stef', options);

module.exports = {mongoose};

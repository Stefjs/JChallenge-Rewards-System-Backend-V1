var mongoose = require('mongoose');

const databaseUrl = 'mongodb://admin:admin123@ds024748.mlab.com:24748/reward';
const testDatabaseUrl = 'mongodb://admin:admin123@ds051077.mlab.com:51077/reward-stef';

const options = {
    useNewUrlParser: true
  };

mongoose.Promise = global.Promise;
mongoose.connect(testDatabaseUrl, options);

module.exports = {mongoose};

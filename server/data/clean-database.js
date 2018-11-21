var mongoose = require('mongoose');

var cleanDatabase = () => {
  return new Promise((resolve, reject) => {
    mongoose.connection.on('open', function(){
        mongoose.connection.db.dropDatabase();
        return resolve();
    });
  });
}

module.exports = {
    cleanDatabase
}
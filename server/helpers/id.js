const _ = require('lodash');
var {
    mongoose
  } = require('../db/mongoose');

var convertToObjectIds = (ids) => {
    userIds = _.map(ids, function (userId) {
        return mongoose.Types.ObjectId(userId)
    });
    return userIds;
}

module.exports = {
    convertToObjectIds
};
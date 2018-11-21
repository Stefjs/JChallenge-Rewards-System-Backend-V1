var mongoose = require('mongoose');
var {User} = require('../models/user');
var {TaskTemplate} = require('../models/task-template');
var {RewardTemplate} = require('../models/reward-template');
const bcryptjs = require('bcryptjs');

var taskTemplateData = {
  'blogpost-template': {
    'title': 'Blogpost schrijven',
    'points': '1',
    'description': 'Schrijf een blogpost over wat je geprogrammeerd hebt'
  },
  'presentation-template': {
    'title': 'Presentatie geven',
    'points': '5',
    'description': 'Geef een presentatie voor een publiek'
  },
  'technology-template': {
    'title': 'Nieuwe technologie onderzoeken',
    'points': '10',
    'description': 'De wereld is steeds aan het inoveren'
  },
  'conference-template': {
    'title': 'Bijwonen van een conferentie',
    'points': '10',
    'description': 'Vergaderen met een ruim publiek'
  },
  'meetup-template': {
    'title': 'Naar een meetup gaan',
    'points': '5',
    'description': 'Leer nieuwe mensen kennen'
  }
}

var rewardTemplateData = {
  'beer-template': {
    'title': 'Een bak bier',
    'points': '15',
    'description': 'Grote dorst?'
  },
  'bol-template': {
    'title': 'Bol.com bon van 25 euro',
    'points': '5',
    'description': 'Goed shoppen'
  },
  'champagne-template': {
    'title': 'Een fles champagne',
    'points': '30',
    'description': 'Dorst?'
  },
  'arube-template': {
    'title': 'Een reis naar Aruba',
    'points': '3000',
    'description': 'Lekker zonnen'
  }
}

var userData = {
  'user-jan': {
    'email': 'jan@gmail.com',
    'name': 'Jan Van denbergen',
    'password': 'jan123',
    'type': 'worker',
    'points' : 10
  },
  'user-jonas': {
    'email': 'jonas@gmail.com',
    'name': 'Jonas Van engelen',
    'password': 'jonas123',
    'type': 'worker',
    'points' : 3000
    
  },
  'user-jarne': {
    'email': 'jarne@gmail.com',
    'name': 'Jarne ',
    'password': 'jarne123',
    'type': 'worker',
    'points' : 20
  }
}

var fillDatabase = () => {
  return new Promise((resolve, reject) => {
    insertAdminData();
    insertRewardTemplateData();
    insertTaskTemplateData();
    insertUserData();
    return resolve();
  });
}

var insertAdminData = () => {
  var admin = new User({
    _id: new mongoose.Types.ObjectId(),
    email: 'team11@gmail.com',
    name: 'Admin',
    password: bcryptjs.hashSync('admin123'),
    type: 'admin',
  });

  admin.save(function (err) {
    if (err) {console.log(err);}
  });

}

var insertUserData = () => {
  var userArray = Object.keys(userData).map(i => userData[i])
  
  for(var i = 0; i < userArray.length; i++) {
    var user = new User({
      _id: new mongoose.Types.ObjectId(),
      email: userArray[i].email,
      name: userArray[i].name,
      password: bcryptjs.hashSync(userArray[i].password),
      type: userArray[i].type
    });

    user.save(function (err) {
      if (err) {console.log(err);}
    });
  }
}

var insertTaskTemplateData = () => {
  var taskArray = Object.keys(taskTemplateData).map(i => taskTemplateData[i])

  for(var i = 0; i < taskArray.length; i++) {
    var task = new TaskTemplate({
      title: taskArray[i].title,
      points: taskArray[i].points,
      description: taskArray[i].description
    });
    
    task.save(function (err) {
      if (err) {console.log(err);}
    });
  };
}

var insertRewardTemplateData = () => {
  var rewardArray = Object.keys(rewardTemplateData).map(i => rewardTemplateData[i])

  for(var i = 0; i < rewardArray.length; i++) {
    var reward = new RewardTemplate({
      title: rewardArray[i].title,
      points: rewardArray[i].points,
      description: rewardArray[i].description
    });
    
    reward.save(function (err) {
      if (err) {console.log(err);}
    });
  };
}

module.exports = {
  fillDatabase
};

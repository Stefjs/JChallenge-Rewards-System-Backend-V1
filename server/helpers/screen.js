var figlet = require('figlet');

var showScreen = (text) => {
    figlet(text, function(err, data) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(data)
    });
}

module.exports = {
    showScreen
};
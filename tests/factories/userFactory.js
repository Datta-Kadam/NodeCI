const mongoonse = require('mongoose');
const User= mongoonse.model('User');

module.exports = () => {
    return new User({}).save();
}
const passport = require('passport');
const {BasicStrategy} = require('passport-http');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const {User} = require('../users/models');
const {JWT_SECRET} = require('../config');

const basicStrategy = new BasicStrategy((username, password, callback) => {
  let user;
  User 
    .findOne({username: username})
    .then(_user => {
      user = _user;
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return callback(null, user)
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return callback(null, false, err);
      }
      return callback(err, false);
    });
});

//basicStrategy allowed the user to supply a username and password to authenticate with an endpoint; this second strategy will do the same thing for JWT's.

const jwtStrategy = new JwtStrategy({
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  algorithms: ['HS256']
  },
  (payload, done) => {
    done(null, payload.user)
  }
);

module.exports = {basicStrategy, jwtStrategy};
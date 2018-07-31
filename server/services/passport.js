const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const User = require('../models/user');
const config = require('../../config');

//setup options for local strategy, using emails, need to tell passport to look at
//email property of the request... password property handled automatically
const localOptions = { usernameField: 'email' };
//create local strategy
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return done(null, false);
      }
      return user.comparePassword(password, (err, isMatch) => {
        if (err) { return done(err); }
        if (!isMatch) { return done(null, false); }
        return done(null, user);
      });
    })
    .catch((err) => {
      return done(err);
    })
});

//setup options for JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret,
};
//create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findById(payload.sub)
    .then((user) => {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch((err) => {
      return done(err, false);
    })
});

//Tell passport to use our strategies
passport.use(jwtLogin);
passport.use(localLogin);

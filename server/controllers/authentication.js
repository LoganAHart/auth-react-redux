const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../../config');

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = (req, res, next) => {
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email and password' });
  }
  User.findOne({ email: email })
    .then((existingUser) => {
      if (existingUser) {
        throw new Error('Email is in use');
      }
      const user = new User({
        email: email,
        password: password,
      });
      return user.save();
    })
    .then((user) => {
      return res.json({ token: tokenForUser(user) });
    })
    .catch((err) => {
      if (err.message === 'Email is in use') {
        return res.status(422).send({ error: err.message });
      }
      return next(err);
    });
}

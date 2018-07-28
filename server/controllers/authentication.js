const User = require('../models/user');

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
    .then(() => {
      return res.json({ success: true });
    })
    .catch((err) => {
      if (err.message === 'Email is in use') {
        return res.status(422).send({ error: err.message });
      }
      return next(err);
    });
}

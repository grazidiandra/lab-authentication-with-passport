const express = require('express');
const passportRouter = express.Router();
const User = require('../models/user');
const passport = require('passport');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

passportRouter.get('/signup', (req, res, next) => {
  res.render('passport/signup');
});

passportRouter.post('/signup', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === '' || password === '') {
    res.render('passport/signup', {message: 'Indicate username and password'});
    return;
  }

  User.findOne({username})
    .then(user => {
      if (user !== null) {
        res.render('passport/signup', {message: 'The username already exists'});
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass
      });

      newUser.save(err => {
        if (err) {
          res.render('passport/signup', {message: 'Something went wrong'});
        } else {
          res.redirect('/');
        }
      });
    })
    .catch(error => {
      next(error);
    });
});

passportRouter.get('/login', (req, res, next) => {
  res.render('passport/login');
});

passportRouter.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
    passReqToCallback: true
  })
);

const ensureLogin = require('connect-ensure-login');

passportRouter.get(
  '/private-page',
  ensureLogin.ensureLoggedIn(),
  (req, res) => {
    res.render('passport/private', {user: req.user});
  }
);

passportRouter.get('/passport/slack', passport.authenticate('slack'));
passportRouter.get(
  '/passport/slack/callback',
  passport.authenticate('slack', {
    successRedirect: '/private-page',
    failureRedirect: '/' // here you would navigate to the classic login page
  })
);

module.exports = passportRouter;

const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//get user list
router.get(`/`, async (req, res) => {
  const userList = await User.find().select('-passwordHash');

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

//get a user by Id
router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');

  if (!user) {
    res.status(500).json({ success: false });
  }
  res.send(user);
});

//create a user by admin
router.post('/', async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    street: req.body.street,
    flat: req.body.flat,
    city: req.body.city,
    postalCode: req.body.postalCode,
    country: req.body.country,
    isAdmin: req.body.isAdmin,
  });
  user = await user.save();

  if (!user) return res.status(400).send('the user cannot be created');
  res.send(user);
});

//login to get authorization token
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send('User was not found');
  }
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      {
        expiresIn: '1d',
      }
    );
    res
      .status(200)
      .send({ user: user.email, isAdmin: user.isAdmin, token: token });
  } else {
    res.status(400).send('Password is wrong');
  }
});

//all users to self-register
router.post('/register', async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    street: req.body.street,
    flat: req.body.flat,
    city: req.body.city,
    postalCode: req.body.postalCode,
    country: req.body.country,
    isAdmin: req.body.isAdmin,
  });
  user = await user.save();

  if (!user) return res.status(400).send('the user cannot be created');
  res.send(user);
});

//delete a user
router.delete('/:id', (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: 'the user has been deleted' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'user not found' });
      }
    })
    .catch((err) => {
      return err.status(400).json({ success: false, error: err });
    });
});

// get user count
router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

module.exports = router;

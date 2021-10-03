const router = require('express').Router();
const {
  User,
  Post,
  Book
} = require('../../models');
const withAuth = require('../../utils/auth')

// get all users
router.get('/', (req, res) => {
  User.findAll({
      include: [Book, Post],
      attributes: {
        exclude: ['password']
      }
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// find single user by id
router.get('/:id', (req, res) => {
  User.findOne({
      attributes: {
        exclude: ['password']
      },
      where: {
        id: req.params.id
      },
      include: [{
          model: Post,
          attributes: ['id', 'title', 'chapter', 'post_content', 'created_at']
        },
        {
          model: Book,
          attributes: ['id', 'book_title', 'author', 'created_at']
        },
      ]
    })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({
          message: 'No user found with this id'
        });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// find user based on email
router.get('/email/:email', (req, res) => {
  User.findOne({
      attributes: {
        exclude: ['password']
      },
      where: {
        email: req.params.email
      }
    })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({
          message: 'No user found with this email'
        });
        return;
      }
      req.session.id
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// finds logged in user
router.get('/info/loggedIn', withAuth, (req, res) => {
  User.findOne({
      attributes: {
        exclude: ['password']
      },
      where: {
        id: req.session.user_id
      },
      include: [{
          model: Post,
          attributes: ['id', 'title', 'chapter', 'post_content', 'created_at']
        },
        {
          model: Book,
          attributes: ['id', 'book_title', 'author', 'created_at']
        },
      ]
    })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({
          message: 'No user is logged in'
        });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// updates user
router.put('/:id', (req, res) => {
  User.update(req.body, {
      where: {
        id: req.params.id
      }
    })
    .then(dbUserData => {
      res.json(dbUserData)
    })
    .catch((err) => {
      res.status(400).json(err)
    })
});

// registers user
router.post('/', (req, res) => {
  // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}
  User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    .then(dbUserData => {
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;

        res.json(dbUserData);
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// logs user in
router.post('/login', (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(dbUserData => {
    if (!dbUserData) {
      res.status(400).json({
        message: 'No user with that email address!'
      });
      return;
    }

    const validPassword = dbUserData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({
        message: 'Incorrect password!'
      });
      return;
    }

    req.session.save(() => {
      req.session.user_id = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.json({
        user: dbUserData,
        message: 'You are now logged in!'
      });

    });
  });
});

// logs user out
router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

// removes user
router.delete('/:id', (req, res) => {
  User.destroy({
      where: {
        id: req.params.id
      }
    })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({
          message: 'No user found with this id'
        });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
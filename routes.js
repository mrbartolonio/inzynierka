const router = require('express').Router()
const {body} = require('express-validator')
const con = require('./utils/mysql')

const user = require('./controllers/userController')

const ifNotLoggedin = (req, res, next) => {
  if (!req.session.userID) {
    return res.redirect('/login')
  }
  next()
}

const ifLoggedin = (req, res, next) => {
  if (req.session.userID) {
    return res.redirect('/')
  }
  next()
}

const ifLoggedinApi = (req, res, next) => {
  if (req.session.userID) {
    next()
  } else {
    res.status(403).send()
  }
}

router.get('/rezerwacja', ifNotLoggedin, user.homePage)

router.get('/', user.glowna)

router.get('/add', ifNotLoggedin, user.add)
router.get('/items', ifNotLoggedin, user.items)
router.get('/itemsmanage', ifNotLoggedin, user.itemsmanage)
router.get('/manage', ifNotLoggedin, user.manage)
router.get('/availability', user.availability)
router.get('/categories', ifNotLoggedin, user.categories)
router.get('/students', ifNotLoggedin, user.students)
router.get('/studentsmanage', ifNotLoggedin, user.studentsmanage)
router.get('/email', ifNotLoggedin, user.email)

//API requests
router.post('/additems', ifLoggedinApi, user.additems)
router.post('/edititems', ifLoggedinApi, user.edititems)
router.post('/removeitems', ifLoggedinApi, user.removeitems)
router.post('/getAvaDates', ifLoggedinApi, user.getAvaDates)
router.post('/addnewreservation', ifLoggedinApi, user.addnewreservation)
router.post('/getalldates', ifLoggedinApi, user.getalldates)
router.post('/getlistofreserv', ifLoggedinApi, user.getlistofreserv)
router.post('/getSpecRes', ifLoggedinApi, user.getSpecRes)
router.post('/delSpecRes', ifLoggedinApi, user.delSpecRes)
router.post('/singleinfores', ifLoggedinApi, user.singleinfores)
router.post('/getallCat', ifLoggedinApi, user.getallCat)
router.post('/updateCat', ifLoggedinApi, user.updateCat)
router.post('/insertCat', ifLoggedinApi, user.insertCat)
router.post('/deleteCat', ifLoggedinApi, user.deleteCat)
router.post('/addstudent', ifLoggedinApi, user.addstudent)
router.post('/updatestudent', ifLoggedinApi, user.updatestudent)
router.post('/removestudent', ifLoggedinApi, user.removestudent)
router.post('/selectfromcat', ifLoggedinApi, user.selectfromcat)
router.post('/selectfromcatall', user.selectfromcat)
router.post('/getgroups', ifLoggedinApi, user.getgroups)
router.post('/sendemail', ifLoggedinApi, user.sendemail)
router.post('/sendemailinfo', user.sendemailinfo)
router.post('/checkifiteminstorage', ifLoggedinApi, user.checkifiteminstorage)
router.post('/checkifiteminstorageall', user.checkifiteminstorage)
router.post('/endwypozyczenie', ifLoggedinApi, user.endwypozyczenie)

router.post(
  '/selectstudentsfromclass',
  ifLoggedinApi,
  user.selectstudentsfromclass,
)

router.post('/getlistofreservAll', user.getlistofreservAll)

router.get('/login', ifLoggedin, user.loginPage)
router.post(
  '/login',
  ifLoggedin,
  [
    body('_email', 'Błędny adres email').notEmpty().escape().trim().isEmail(),
    body('_password', 'Hasło musi mieć minimalnie 4 znaki długości')
      .notEmpty()
      .trim()
      .isLength({min: 4}),
  ],
  user.login,
)

router.get('/signup', ifLoggedin, user.registerPage)
router.post(
  '/signup',
  ifLoggedin,
  [
    body('_name', 'The name must be of minimum 3 characters length')
      .notEmpty()
      .escape()
      .trim()
      .isLength({min: 3}),
    body('_email', 'Invalid email address')
      .notEmpty()
      .escape()
      .trim()
      .isEmail(),
    body('_password', 'The Password must be of minimum 4 characters length')
      .notEmpty()
      .trim()
      .isLength({min: 4}),
  ],
  user.register,
)

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    //next(err)
    res.redirect('/')
  })
})

router.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

module.exports = router

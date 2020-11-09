const { Router } = require('express');
var express = require('express');
var router = express.Router();
const auth = require("../middleware/auth")
var User = require('../models/user.model');
var transporter = require('../mail/index')

const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "./uploads/images/users")
  },
  filename: function (req, file, cb) {
      console.log(file.originalname);
      cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
})
const uploadUser = multer({storage: storage});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register',uploadUser.single('photo'),async (req,res)=>{
  console.log(req.body);
  try{
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      avatar: req.file.path,
      password: req.body.password
    })
    console.log(user);
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({user,token})
  }catch(err){
    res.status(400).send(err)
  }
})
router.post('/login', async(req, res) => {
  console.log("login");
  //Login a registered user
  try {
      const { email, password,tokenDevices } = req.body
      console.log(tokenDevices);
      console.log(req.body);
      const user = await User.findByCredentials(email, password)
      if (!user) {
          return res.status(401).send({error: 'Login failed! Check authentication credentials'})
      }
      // console.log(user.tokenDevices.indexOf(tokenDevices));
      // if(user.tokenDevices.indexOf(tokenDevices)===-1){
      //   user.tokenDevices.push(tokenDevices);
      // }
      const token = await user.generateAuthToken(tokenDevices)
      res.send({ user, token })
  } catch (error) {
      res.status(400).send(error)
  }
})
router.get('/logout', auth, async (req, res) => {
  // Log user out of the application
  console.log("log");
  try {
      req.user.tokens = req.user.tokens.filter((token) => {
          return token.token != req.token
      })
    
      await req.user.save()
      res.status(200).send("logout complete")
  } catch (error) {
      res.status(500).send("err")
  }
})
router.get('/me', auth, async(req, res) => {
  // View logged in user profile
  res.status(200).send(req.user)
})
router.get('/get', async(req, res) => {
  console.log("get");
  //Login a registered user
  try {
    
      const { id } = req.body
      const user = await User.findById({_id: id})
      if (!user) {
          return res.status(401).send({error: 'Login failed! Check authentication credentials'})
      }
      // const token = await user.generateAuthToken()
      res.send({ user})
  } catch (error) {
      res.status(400).send(error)
  }
})
router.get('/all', async(req, res) => {
  console.log("get all");
  //Login a registered user
  try {
    
      const users = await User.find()
      if (!users) {
          return res.status(401).send({error: 'Login failed! Check authentication credentials'})
      }
      // const token = await user.generateAuthToken()
      res.send(users)
  } catch (error) {
      res.status(400).send(error)
  }
})
router.post('/upload', uploadUser.single('photo'), (req, res) => {
 
  if(req.file) {
      res.json(req.file);
  }
  else throw 'error';
});
router.get('/testSchema',()=>{
  const user = new User()
  user.log()
  res.status(200)
})

router.get('/code',auth, async function(req, res, next) {
  let r = Math.random().toString(36).substring(9);

  var mailOptions = {
    from: 'noyrely@gmail.com',
    to: req.user.email,
    subject: 'Code change password',
    text: 'Your Code: '+ r,
  };

  await transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.send(r);
});
router.get('/code/email/:email', async function(req, res, next) {
  let r = Math.random().toString(36).substring(9);
  console.log(req.params.email);
  var mailOptions = {
    from: 'noyrely@gmail.com',
    to: req.params.email,
    subject: 'Code change password',
    text: 'Your Code: '+ r,
  };

  await transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.send(r);
});
router.post('/change/password', async function(req, res, next) { 
  const email = req.body.email;
  
  try {
      const user =await User.findOne({email})
      if(user) user.password = req.body.password;
      await user.save()
      res.status(200).send("change pass complete")
  } catch (error) {
      res.status(500).send("err")
  }
});

module.exports = router;

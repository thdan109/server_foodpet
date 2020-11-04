const { Router } = require('express');
var express = require('express');
var router = express.Router();
const auth = require("../middleware/auth")
var User = require('../models/user.model');
var Product = require('../models/product.model');

const multer = require("multer");
const { search } = require('./index.route');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/images/products')
    },
    filename: function (req, file, cb) {
      cb(null,file.fieldname + '-' + Date.now() + file.originalname)
    }
  })
const uploadProduct = multer({storage: storage});

router.post('/update', async (req, res) => {
  // console.log("hahah",req.body);
  const { name,description,number,price ,type,_id} = req.body
  try {
    let product = await Product.findOne({ _id });
    
    if (product) {
     product.name = name;
     product.description = description;
     product.number = number;
     product.price= price;
     product.type = (type)?type : "food"; 
    }
   
    product = await product.save();
    return res.status(201).send("update Complete");
  } catch (err) {
  //   console.log(err);
    res.status(500).send("Something went wrong");
  }
})

router.post('/delete', async (req, res) => {
  await Product.findOneAndRemove({id: req.body._id}).then(() => {
      res.send("complete")
  }, (e) => {
      res.status(400).send(e);
  })
})

router.post('/upload',uploadProduct.array("photos",8),async function (req, res) {
    console.log("product test");      
        try{
            let fileName = req.files.map(file=>file.path)
            console.log(fileName);
            const product = new Product({
              name: req.body.name,
              description: req.body.description,
              picture: fileName,
              type: req.body.type,
              number: req.body.number,
              price: req.body.price
            })
            await product.save().then(product => {
              res.status(200).send(product)
            }, (e) => {
                res.status(400).send(e);
            })
            
          }catch(err){
            res.status(400).send(err)
          }

});

router.get('/all',async function (req, res) {
  console.log("get all product");
      // console.log(req.query);  
      const name = req.query.search;    
      let type = req.query.filler;  
      
      try{
        if(name || type ){
          console.log(type);
          if(type===undefined){
            type = ['food', 'tool', 'care', 'other'];
          }
          var nameRegex = new RegExp(name);
          await Product.find({ $and:[
            {"name": {$regex: nameRegex, $options: 'i'}},
            {"type": {$in: type}}
          ]}).then(product => {
            res.status(200).send(product)
          }, (e) => {
              res.status(400).send(e);
          })
        }else{
          await Product.find().then(product => {
            res.status(200).send(product)
          }, (e) => {
              res.status(400).send(e);
          })
        }
         
          
          // res.status(201).send("{user,token}")
        }catch(err){
          res.status(400).send(err)
        }

      //    res.json({status: 'ok', message: 'Pictures uploaded'});

});
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a product rouse');
});

module.exports = router;

const { Router } = require('express');
var express = require('express');
var router = express.Router();
const auth = require("../middleware/auth")
var User = require('../models/user.model');
var Product = require('../models/product.model');

const multer = require("multer");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/images/products')
    },
    filename: function (req, file, cb) {
      cb(null,file.fieldname + '-' + Date.now() + file.originalname)
    }
  })
const uploadProduct = multer({storage: storage});


router.post('/upload',uploadProduct.array("photos",8),async function (req, res) {
    console.log("product test");
      //  console.log(req.files);         
        try{
            let fileName = req.files.map(file=>file.path)
            console.log(fileName);
            const product = new Product({
              name: req.body.name,
              description: req.body.description,
              picture: fileName,
              number: req.body.number,
              price: req.body.price
            })
            await product.save().then(product => {
              res.status(200).send(product)
            }, (e) => {
                res.status(400).send(e);
            })
            
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

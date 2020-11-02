const { Router } = require('express');
var express = require('express');
var router = express.Router();
const auth = require("../middleware/auth")
var User = require('../models/user.model');
var Cart = require('../models/cart.model');

var Order = require('../models/order.model');

router.post("/add",auth, async (req, res) => {
    const {
        userId,
        address,
        phone,
        more,
        price,
      }= req.body;
    try {
      let cart = await Cart.findOne({ userId });
      if (cart) {
        
        const newOrder = await Order.create({ 
            userId,
            address,phone,more,price,status:1,
            products: [...cart.products]
        })
        await Cart.findOneAndRemove({ userId });
        console.log("daas",newOrder);
        return res.status(201).send(newOrder);
      }
    } catch (err) {
    //   console.log(err);
      res.status(500).send("Something went wrong");
    }
  });

  //get all orders for user

router.get("/user", auth, async (req, res) => {
  console.log("log cart for user");

  try {
    let order = await Order.find({ userId:req.user._id });
    return res.status(201).send(order);
    
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a cart rouse');
});

module.exports = router;

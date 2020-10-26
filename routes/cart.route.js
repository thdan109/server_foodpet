const { Router } = require('express');
var express = require('express');
var router = express.Router();
const auth = require("../middleware/auth")
var User = require('../models/user.model');
var Cart = require('../models/cart.model');


router.post("/add", async (req, res) => {
    const {userId, productId, quantity, name, price,pictureItem } = req.body;
  console.log(pictureItem);
    try {
      let cart = await Cart.findOne({ userId });
      if (cart) {
        let itemIndex = cart.products.findIndex(p => p.productId == productId);
        
        if (itemIndex > -1) {
          if(quantity===0){
            cart.products.splice(itemIndex,1);
            
          }else{
            let productItem = cart.products[itemIndex];
            productItem.quantity = quantity;
            cart.products[itemIndex] = productItem;
          }
        } else {
          cart.products.push({ productId, quantity, name, price, pictureItem });
        }
        cart = await cart.save();
        return res.status(201).send(cart);
      } else {
        const newCart = await Cart.create({
          userId,
          products: [{ productId, quantity, name, price, pictureItem }]
        });
        return res.status(201).send(newCart);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong");
    }
  });
  
router.get("/user", auth, async (req, res) => {
  console.log("log cart for user");

  try {
    let cart = await Cart.findOne({ userId:req.user._id });
    return res.status(201).send(cart);
    
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

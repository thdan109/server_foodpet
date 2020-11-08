const { Router } = require('express');
var express = require('express');
var router = express.Router();
const auth = require("../middleware/auth")
var User = require('../models/user.model');
var Cart = require('../models/cart.model');
var transporter = require('../mail/index')
var Order = require('../models/order.model');
var Product = require('../models/product.model');
const { default: Axios } = require('axios');

router.post("/add",auth, async (req, res) => {
    const {
        userId,
        email,
        address,
        phone,
        more,
        price,
      }= req.body;
    try {
      let cart = await Cart.findOne({ userId });
      if (cart) {
        
        const newOrder = await Order.create({ 
            userId,email,
            address,phone,more,price,status:1,
            products: [...cart.products]
        })
        await Cart.findOneAndRemove({ userId });
        console.log("daas",newOrder);

        var mailOptions = {
            from: 'noyrely@gmail.com',
            to: email,
            subject: 'Order Successfully',
            text: 'Order Successfully'
          };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
         });
     
        return res.status(201).send(newOrder);
      }
    } catch (err) {
    //   console.log(err);
      res.status(500).send("Something went wrong");
    }
  });

  //get all orders for user
router.get('/all', async(req, res) => {
    console.log("get all order");
    //Login a registered user
    try {
      
        const orders = await Order.find()
        if (!orders) {
            return res.status(401).send({error: 'NO orders'})
        }
        // const token = await user.generateAuthToken()
        res.send(orders)
    } catch (error) {
        res.status(400).send(error)
    }
  })
  router.get('/top', async(req, res) => {
    console.log("get top order");
   
    try {
      
        const orders = await Order.aggregate([
        // { $match   : { _id : null }  },
        { $project : { "products" : 1, _id:0 } },
        { $unwind  : "$products"},
        // { $match   : { "products._id":{"$ne": 531  } } },
           { $group   : { 
                        _id : "$products.productId", 
                        totalSales : { $sum : "$products.quantity" } } },
           { $sort    : { totalSales : -1 } },
           { $limit   : 5 } 
      ])
        const listId = orders.map(value=> value._id)
        const ordersFill = await Product.find( {_id:{$in: listId}})
        if (!ordersFill) {
            return res.status(401).send({error: 'NO orders Top'})
        }
      
        const ordersFillLast = ordersFill.map((order,index)=>{
          const temp = {
            _id: order._id,
            picture: order.picture,
            name: order.name,
            price: order.price,
            type: order.type,
            totalSales: orders[index].totalSales
          }
          return temp;
        })
        res.send(ordersFillLast)
    } catch (error) {
        res.status(400).send(error)
    }
  })
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
router.post('/update', async (req, res) => {
  // console.log("hahah",req.body);
  const { status,_id} = req.body
  try {
    let order = await Order.findOne({ _id });
    
    if (order) {
      order.status = Number(status)
    }
   
    order = await order.save();

    const user = await User.findOne({ _id: order.userId})
    for(var a of user.tokens){
      sendPushNotification(a.tokenDevices,status,_id)
    }
    // console.log(user.tokens[0].tokenDevices);

    return res.status(201).send("update Complete");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
})
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a cart rouse');
});
async function sendPushNotification(expoPushToken,i,id) {
  var text = ''
  switch (Number(i)) {
    case 1:
      text =  "cho xac nhan.";
      break;
    case 2:
      text =  "da duoc xac nhan.";
      break;
    case 3:
      text =  "dang van chuyen.";
      break;
    case 4:
      text =  "da giao.";
      break;
    default: 
      text =  "null";
      break;
  }
  

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Update Status Order',
    body: 'Order '+ id + ": "+ text,
    data: { data: 'goes here' },
  };
  await Axios.post('https://exp.host/--/api/v2/push/send', JSON.stringify(message), {
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
   
  });
}
module.exports = router;

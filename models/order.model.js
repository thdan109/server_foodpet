const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    address: {
        type:String,
    },
    phone: {
        type: String,
    },
    more: {
        type: String,
    },
    products: [
      {
        productId: String,
        quantity: Number,
        name: String,
        price: Number,
        pictureItem: String,
      }
    ],
    active: {
      type: Boolean,
      default: true
    },
    modifiedOn: {
      type: Date,
      default: Date.now
    },
    price: {
        type: Number
    },
    status: {
        type: Number,
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", OrderSchema);
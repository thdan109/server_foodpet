const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const  JWT_KEY  = process.env.JWT_KEY

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        min:6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    avatar:{
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    date: {
        type: Date,
        default: Date.now,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        },
        tokenDevices:{
            type: String,
        } 
    }],
    

})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function(tokenDevices) {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, JWT_KEY)
    user.tokens = user.tokens.concat({token,tokenDevices})
    await user.save()
    return token
}
userSchema.methods.findSimilarTypes = function(cb) {
    console.log("haha");
  };
userSchema.method.log = function(){
    console.log("this is a methods SChema");
}
userSchema.statics.findByCredentials = async function (email, password) {
    // Search for a user by email and password.
    const user = await User.findOne({ email} )
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}
var User = mongoose.model('User', userSchema)
module.exports = User
//multer setup

const multer = require("multer");

const uploadUser = multer({dest:__dirname+"/uploads/images/users"});
module.exports = uploadUser
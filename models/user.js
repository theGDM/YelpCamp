const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
 
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique:true
    }
})
userSchema.plugin(passportLocalMongoose);
//So just pass in the result of requiring that package that we installed into your userSchema.plugin and this is going
//to add on to our schema a user name.
//it's going to add on a field for password, it's going to make sure those user names are unique they are not duplicated, and also it's 
//going to give some additional methods that we can use.
const User = mongoose.model("User", userSchema);
module.exports = User;
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    sub:{
        type:String
    },
    name:{
        type:String
    },
    given_name:{
        type:String
    },
    famiy_name:{
        type:String
    },
    picture:{
        type:String
    },
    email:{
        type:String
    },
    email_verified:{
        trype:Boolean
    },
    locale:{
        type:String
    }
});

const userModel = mongoose.model('users',userSchema);

module.exports = userModel;

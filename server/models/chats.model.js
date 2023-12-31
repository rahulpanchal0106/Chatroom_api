const mongoose = require('mongoose')

const chat_schema = mongoose.Schema({
    username:{
        type:String
    },
    msg:{
        type: String
    },
    email:{
        type: String
    },
    time:{
        type:String
    }
})

const chat_model = mongoose.model("chats_db",chat_schema);

module.exports=chat_model
const express = require('express');
const app = express();


// app.use(express.static(
//     path.join(__dirname,'..','client')
// ));

app.get('/',(req,res)=>{
    res.send('api is live')
})



module.exports = app;
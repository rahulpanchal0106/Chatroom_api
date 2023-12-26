require('dotenv').config();
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const mongoose = require('mongoose');
const io = require('socket.io')(server,{
    cors:{
        origin:'*'
    }
});

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;

const userModel = require('./models/users.model')

io.on('connection',(socket)=>{
    console.log(`A user Connected | ${socket.id}`);
    socket.on('message',(data)=>{
        console.log(data)
        // const user =userModel.findOne({email})
        socket.broadcast.emit('message',data);
        console.log(data.username,">>>>>",data.msg)
        // socket.to(room_id).emit('message',"Message to te rooom",room_id)
    });
    socket.on('newuser',(data)=>{
        console.log(data)
        socket.broadcast.emit('newuser',data)
    });
    socket.on('disconnect',(data)=>{
        console.log(data)
        socket.broadcast.emit('userLeft',data)
    });


    //private room
    const room_id="a"
    socket.join(room_id,()=>{
        console.log('joined a room')
    });
    


})

async function start_server(){
    await mongoose.connect(MONGO_URI)
    .then(()=>{
        console.log("Mongodb connection ready")
    })
    .catch((err)=>{
        console.error(err)
    })


    server.listen(PORT,()=>{
        console.log('listening on 3030')
    })
}

start_server()


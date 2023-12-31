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

const user_model = require('./models/users.model');
const chat_model = require('./models/chats.model');

function get_time(){
    const current = new Date()
    const current_hr = current.getHours();
    const current_min = current.getMinutes();
    const current_sec = current.getSeconds();
    const time = `${current_hr}:${current_min}:${current_sec}`;

    return time
}

const activeUsers = {};
io.use((socket, next) => {
    const user_name = socket.handshake.auth.user_name;

    if (!user_name) {
        return next(new Error('Invalid username'));
    }
    activeUsers[socket.id] = user_name;
    
    next();
});

app.get('/members',(req,res)=>{

    console.log('Users Online: ',activeUsers)
    res.json(activeUsers)
})


io.on('connection',(socket)=>{
    console.log(`A user Connected | ${socket.id} | ${activeUsers[socket.id]}`);



    socket.on('members',(data)=>{
        console.log('++++++++++++++++++++++++++++++++++++++++',data)
        socket.broadcast.emit('members',activeUsers)
        
    })
    

    socket.on('message',(data)=>{
        
        // const user =userModel.findOne({email})
        socket.broadcast.emit('message',data);
        console.log(data.username,">>>>>",data.msg)
        const username = data.username;
        const msg = data.msg;
        const email = data.email;
        
        chat_model.create({
            username: username,
            msg: msg,
            email:email,
            time:get_time()
        });
        

        // socket.to(room_id).emit('message',"Message to te rooom",room_id)
    });
    socket.on('newuser',(data)=>{
        
        chat_model.create({
            username: 'null',
            msg: data,
            email:'null_email',
            time:get_time()
        });
        socket.broadcast.emit('newuser',data)
    });
    
    socket.on('disconnect',()=>{
        const userLeftMessage = `<div id="leave">${activeUsers[socket.id]} Left the chat at ${get_time()}</div>`;
        chat_model.create({
                    username: 'null',
                    msg: userLeftMessage,
                    email:'null_email',
                    time:get_time()
                });
        socket.broadcast.emit('userLeft', userLeftMessage);
        delete activeUsers[socket.id];
    
    })

    


    //private room
    // const room_id="a"
    // socket.join(room_id,()=>{
    //     console.log('✨✨✨✨joined a room')
    // });
    

    
    io.on('disconnection',()=>{
        console.log('someone disconnected ::::::::::::::::::::::::::')
    })

    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',activeUsers)
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


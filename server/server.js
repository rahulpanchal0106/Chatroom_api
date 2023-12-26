const http = require('http');
const app = require('./app');
const server = http.createServer(app);

const io = require('socket.io')(server,{
    cors:{
        origin:'*'
    }
});

io.on('connection',(socket)=>{
    console.log(`A user Connected | ${socket.id}`);
    socket.on('message',(data)=>{
        console.log(data)
        
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

server.listen(3030,()=>{
    console.log('listening on 3030')
})

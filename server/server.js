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
        console.log(data.msg,"<<<<<",data.username)
        socket.broadcast.emit('message',data);
        console.log(data.username,">>>>>",data.msg)
    });
    socket.on('newuser',(data)=>{
        console.log(data)
        socket.broadcast.emit('newuser',data)
    });
    socket.on('disconnect',(data)=>{
        console.log(data)
        socket.broadcast.emit('userLeft',data)
    })


})


server.listen(3030,()=>{
    console.log('listening on 3030')
})

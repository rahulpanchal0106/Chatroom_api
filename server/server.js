const http = require('http');
const app = require('./app');
const server = http.createServer(app);



server.listen(3030,()=>{
    console.log('listening on 3030')
})

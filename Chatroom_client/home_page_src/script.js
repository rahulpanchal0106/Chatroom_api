// do{
//     var user_name = window.prompt('Please Enter your Name: ')
// }while(user_name == null || user_name === " " || user_name == "" || user_name==undefined)
function getJsonDataFromBase64Cookie(cookieName) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${cookieName}=`));
  
    if (cookieValue) {
      const base64String = cookieValue.split('=')[1];
      const jsonString = atob(base64String); // Base64 decoding
      return JSON.parse(jsonString);
    }
  
    return null;
  }

const cookie_data = getJsonDataFromBase64Cookie('session');

console.log('//////////////\n',cookie_data,"~~~~~~~~~~~~~~~~~~~~~~~~~~\n",cookie_data.passport.user.name)

var session_data = sessionStorage.getItem('session');
var user_name = cookie_data.passport.user.name;
const chatBody=document.querySelector('.chat-messages');
chatBody.addEventListener('scroll', function() {
    console.log(chatBody.scrollTop+chatBody.clientHeight,"||",chatBody.scrollHeight,"||",chatBody.clientHeight)
    
    handle_goBottom();
    
});

// function decoding_cookie_data(cookie){
//     const decoded_cookie = decodeURIComponent(cookie);
//     return 

// }


const decoded_cookie = decodeURIComponent(document.cookie);
console.log(`!!!!!!!!!!!!!!!!!!!!!  ${decoded_cookie}`)

function go_bottom(){
    
    const chatBody=document.querySelector('.chat-messages');
    console.log("......................;;;;")
    chatBody.scrollTo({
        top:chatBody.scrollHeight-chatBody.clientHeight,
        behavior:'smooth'
    })
    
}

 

function handle_goBottom(){
    const chatBody=document.querySelector('.chat-messages');
    if(!(chatBody.scrollTop+chatBody.clientHeight>=chatBody.scrollHeight)){
        document.querySelector('#goBottom').style.display='flex'
    }else{
        document.querySelector('#goBottom').style.display='none'
    }
}

function clear_input(){
    const input = document.querySelector('#message-input');
    input.value=''
}

function get_time(){
    const current = new Date()
    const current_hr = current.getHours();
    const current_min = current.getMinutes();
    const current_sec = current.getSeconds();
    const time = `${current_hr}:${current_min}:${current_sec}`;

    return time
}

const socket = io('wss://chatroom-gy71.onrender.com')//wss://chatroom-gy71.onrender.com
socket.on('connect',()=>{
    console.log(`${user_name} joined the chatroom!`);
    const user_joined = `<div id="joined">${user_name} joined the chat at ${get_time()} </div>`
    document.querySelector('#chat-messages').innerHTML+=user_joined;
    socket.emit('newuser',user_joined);
    handle_goBottom();
})



socket.on('message',(data)=>{
    
    console.log(data.username,"<<<<<",data.msg," || ",get_time())
    
    const msg_received = `<div id="msg_recieved">
    <label id="user_name">${data.username}</label><br>
        <div id="msg_data">    
            ${data.msg}
        </div>
        <div id="msg_time">
            ${get_time()}
        </div>
    </div>`;
    document.querySelector('#chat-messages').innerHTML+=msg_received;
    handle_goBottom();
})
socket.on('newuser',(data)=>{
    
    document.querySelector('#chat-messages').innerHTML+=data;
    handle_goBottom();
})

socket.on('userLeft',(data)=>{
    const user_left = data
    document.querySelector('#chat-messages').innerHTML+=user_left;
    console.log(user_left)
    socket.emit('userLeft',user_left);
    handle_goBottom();
})

function send_message(){
    const msg = document.querySelector('#message-input');
    
    if(msg.value && msg.value!==" " && msg.value!=null && msg.value!=undefined){
        console.log(`${user_name}>>>>>${msg.value}`);
        const send_data = {
            'username':user_name,
            'msg':msg.value
        }
        const msg_sent = `<div id="msg_sent">
            <label id="user_name">${user_name}</label><br>
            <div id="msg_data">
                ${send_data.msg}
            </div>
            <div id="msg_time">
                ${get_time()}
            </div>
        </div>`;

        document.querySelector('#chat-messages').innerHTML+=msg_sent;
        socket.emit('message',send_data);
        clear_input();
        // go_bottom();
        handle_goBottom();
    }
}

document.querySelector('#send').onclick=(e)=>{
    e.preventDefault()
    send_message()
    
    
}

window.addEventListener('beforeunload', function (event) {

    const message = 'Are you sure you want to leave? Your changes may not be saved.';
    event.returnValue = message;
    const user_left = `<div id="joined">${user_name} tried to leave chat</div>`
    document.querySelector('#chat-messages').innerHTML+=user_left;
    console.log(user_left)
    socket.emit('userLeft',user_left);
});
  
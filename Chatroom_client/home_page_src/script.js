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

async function getHistory(){
    await fetch('/history')
    .then((res)=>{
        return res.json()
    })
    .then((data)=>{
        
        data.forEach((chat)=>{
            
            if(chat.email==='null_email'){
                // console.log(chat,"\n👽",chat.msg)
                display_join_status(chat.msg)
            }else{
                display_messages(chat)
            }
        })
    })
}

getHistory()

const cookie_data = getJsonDataFromBase64Cookie('session');

console.log('//////////////\n',cookie_data,"~~~~~~~~~~~~~~~~~~~~~~~~~~\n",cookie_data.passport.user.name)

var session_data = sessionStorage.getItem('session');
var user_name = cookie_data.passport.user.name;
var email = cookie_data.passport.user.email;

const chatBody=document.querySelector('.chat-messages');
chatBody.addEventListener('scroll', function() {
    // console.log(chatBody.scrollTop+chatBody.clientHeight,"||",chatBody.scrollHeight,"||",chatBody.clientHeight)
    
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

const socket = io('wss://chatroom-gy71.onrender.com',{
    auth:{
        user_name:user_name
    }
})//ws://localhost:3030
socket.on('connect',()=>{
    console.log(`${user_name} joined the chatroom!`);
    const user_joined = `<div id="joined">${user_name} joined the chat at ${get_time()} </div>`
    document.querySelector('#chat-messages').lastElementChild+=user_joined;
    socket.emit('newuser',user_joined);
    handle_goBottom();
})
function display_join_status(data){
    document.querySelector('#chat-messages').innerHTML+=data;
    handle_goBottom();
}
function display_messages(data){
    var msg_received = `
    <div id="msg_recieved" class='${data.email}'>
        <label id="user_name">${data.username}</label><br>
        <div id="msg_data">    
            ${data.msg}
        </div>
        <div id="msg_time">
            ${data.time}
        </div>
    </div>`;

    
    //console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀',document.getElementById('msg_recieved'))
    //console.log("TTTTTTTTTTTTTTTTTTTTTTTTT",data.time)
    
    if(data.email==email){
        msg_received = `
        <div id="msg_sent" class='${data.email}'>
            <label id="user_name">${data.username}</label><br>
            <div id="msg_data">    
                ${data.msg}
            </div>
            <div id="msg_time">
                ${data.time}
            </div>
        </div>`;
    }

    // const timeO=document.querySelector('#msg_time')
    document.querySelector('#chat-messages').innerHTML+=msg_received;
    // console.log("TTTTTTTTTTTTTTTTTT",timeO)
}

socket.on('message',(data)=>{

    console.log("data received: ",data)
    
    display_messages(data)
    handle_goBottom();
})
socket.on('newuser',(data)=>{
    
    display_join_status(data)
    
})



// socket.on('disconnect',()=>{
    
//     const user_left = `<div id="joined">${user_name} Left the chat at ${get_time()}</div>`
//     document.querySelector('#chat-messages').innerHTML+=user_left;
//     socket.emit('userLeft',user_left);
// })

socket.on('userLeft',(data)=>{
    
    console.log("☄️☄️",data)
    // const user_left = `<div id="joined">${user_name} Left the chat at ${get_time()}</div>`
    document.querySelector('#chat-messages').innerHTML+=data;
    handle_goBottom();
})

function send_message(){
    const msg = document.querySelector('#message-input');
    
    if(msg.value && msg.value!==" " && msg.value!=null && msg.value!=undefined){
        console.log(`${user_name}>>>>>${msg.value}`);
        const send_data = {
            'username':user_name,
            'msg':msg.value,
            'email':email,
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
    go_bottom();
}

window.addEventListener('beforeunload', function (event) {
    const message = 'Are you sure you want to leave? Your changes may not be saved.';
    event.returnValue = message;
    
});

document.querySelector('#members').onclick=()=>{
    console.log('%%%%%%%%%%%%Clicked%%%%%%%%%%%%%%');
    fetch('/members')
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        console.log(data,'||',Object.keys(data).length);
        const users_online = Object.values(data);
        console.log("Users Online: ",users_online)


        // for(let i=0;i<Object.keys(data).length;i++){
        //     console.log(Object.values(data))
        // }


    })
    // socket.emit('members',user_name)
    
    
}

// document.querySelector('#options').addEventListener('click',(event)=>{
//     event.preventDefault();
//     console.log('$$$$$$$$$$$$$$$$clicked$$$$$$$$$$$$$$$$$$');


// })
function toggle(el,c){
    if(c%2!=0){
        el.style.display="flex"
    }else{
        el.style.display="none"
        c=0
    }
}
let options_c = 0;
document.querySelector('#options').onclick=()=>{
    options_c++;
    const dd_menu = document.querySelector('#dropdown-menu')
    toggle(dd_menu,options_c)
}
let members_c = 0;
document.querySelector('#members').onclick=async ()=>{

    await fetch('/members')
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        console.log(data,'||',Object.keys(data).length);
        const users_online = Object.values(data);
        console.log("Users Online: ",users_online)

        const au_list=document.querySelector('#au_list')
        let au_c=0
        au_list.innerHTML=''
        users_online.forEach(user=>{
            au_c++;
            const au_markup = `<div id="au_item">
                <div>${au_c}</div>
                <div id="au_name">${user}</div>
                <div id="au_"></div>
            </div>`
            au_list.innerHTML+=au_markup
        })
        au_c=0;
    })



    members_c++;
    const au = document.querySelector('#active_users');
    au.style.display="flex"
    document.querySelector('#au_x').onclick=()=>{
        au.style.display="none"
    }
}

// window.addEventListener('load',(()=>{
//     console.log('Loading');
//     document.querySelector('#loading').style.display="flex"
// }))


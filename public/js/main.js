const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
//const chatImage = document.getElementById('shareImg');
const feedback = document.getElementById('feedback');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room from URL
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});

const socket = io.connect('http://localhost:3000/');

//Join chatroom
socket.emit('joinRoom',{username, room},console.log("Connected to server"));

//Get room and users
socket.on('roomUsers',({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
});


//Message from server
socket.on('message',message=>{
    //console.log(message);
    outputMessage(message);  
    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message submit
chatForm.addEventListener('submit',e => {
    e.preventDefault();
   
    //Get message text
    let msg = e.target.elements.msg.value;
    msg = msg.trim();
    if(!msg) return false;

    //Emitting the message to server
    socket.emit('chatMessage',msg);

    //Get image 
    // var data = e.target.elements.shareImg.value;
    // var reader = new FileReader();
    // const img = document.createElement('img');
    // img.classList.add('img');
    // img.src = data;
    // console.log(img);
    
    // reader.onload = function() {
        
    // }
    // reader.readAsDataURL(img.src)
    

    //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//Typing... event
chatForm.addEventListener('keypress',()=>{
    socket.emit('typing',username);
})


//Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`; 
    document.querySelector('.chat-messages').appendChild(div);

    socket.on('typing',data=>{
        feedback.innerHTML = '<p>'+ data + ' yazıyor...</p>'
    })
    document.querySelector('.chat-messages').appendChild(feedback);
    feedback.innerHTML = '';   
}

//Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user =>`<li>${user.username}</li>`).join('')}
    `;
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      window.location = '../index.html';
    } else {
    }
  });
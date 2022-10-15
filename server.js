const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const { SocketAddress } = require('net');

const app = express();
const server = http.createServer(app);

const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));//html css js dosyalarını kullanabilmek için



const botName = 'CakmaChatBot'
//Run when client connects
io.on('connection', socket =>{
    //console.log(io.of("/").adapter);
    socket.on('joinRoom',({username, room})=>{ 
    
    const user = userJoin(socket.id, username, room);
    socket.join(user.room)    

    //Welcome current user
    socket.emit('message',formatMessage(botName,'Welcome to ÇakmaWP!'));//Client tarafına bir mesaj gönderdik
    
    //Broadcast when a user connects
    socket.broadcast
    .to(user.room)
    .emit(
        'message',
        formatMessage(botName,`${user.username} has joined the chat`));//aynı odaya giren bütün client'lara broadcast yapar
        //io.emit();//bütün general client'lara broadcast yapar 
        
        //Send users and room info
        io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
        });
    });

    //Listen for chatMessage
    socket.on('chatMessage', msg=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

     //Runs when client disconnects
     socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).
            emit('message',
            formatMessage(botName,`${user.username} has left the chat`)
            );
            //Send users and room info
            io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
            });
        }        
    });   

    //Runs when typing the message
    socket.on('typing',username=>{
        const user = getCurrentUser(socket.id);
        //console.log(user.room);
        socket.broadcast.to(user.room).emit('typing',username);
    });
});

const PORT = 3000 || process.env.PORT; //varsa 3000 yoksa process.env.PORT'dan PORT var mı bak

server.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express()
const server = http.createServer(app);

const io = socketIo(server);

// Serve static files from the 'public' directory (or any other directory name you prefer)
app.use(express.static(path.join(__dirname, 'public')));

// Example of handling a basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Use a predefined room for simplicity
const DEFAULT_ROOM = 'defaultRoom';

io.on('connection', (socket) => {
    console.log('A user connected');

    // Automatically join the default room
    socket.join(DEFAULT_ROOM);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // When a client sends an 'offer'
    socket.on('offer', (offer) => {
        console.log('Offer received');
        // Broadcast the offer to all other users
        socket.to(DEFAULT_ROOM).emit('offer', offer);
    });

     // When a client sends an 'answer'
     socket.on('answer', (answer) => {
        console.log('Answer received');
        // Broadcast the answer to all other users
        socket.to(DEFAULT_ROOM).emit('answer', answer);
    });

    // When a client sends an 'candidate' (ICE candidate)
    socket.on('candidate', (candidate) => {
        console.log('Candidate received');
        // Broadcast the ICE candidate to all other users
        socket.to(DEFAULT_ROOM).emit('candidate', candidate);
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ Serve static files (HTML, CSS, JS) from root
app.use(express.static(__dirname));

// ✅ Send index.html on root request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Define Message model
const Message = mongoose.model('Message', new mongoose.Schema({
  text: String,
  timestamp: { type: Date, default: Date.now }
}));

// ✅ Socket.io event handling
io.on('connection', (socket) => {
  console.log('📥 A user connected');

  // Send recent messages to newly connected client
  Message.find().sort({ timestamp: 1 }).limit(50)
    .then(messages => {
      socket.emit('chat history', messages);
    })
    .catch(err => console.error(err));

  // Handle new message from user
  socket.on('chat message', async (msg) => {
    const message = new Message({ text: msg });

    try {
      await message.save();
      io.emit('chat message', message); // broadcast to all clients
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('📤 A user disconnected');
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
})

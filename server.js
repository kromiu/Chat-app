require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Serve static files
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch(err => console.error(err));

const Message = mongoose.model("Message", new mongoose.Schema({
  text: String,
  timestamp: { type: Date, default: Date.now },
}));

io.on('connection', async (socket) => {
  console.log('User connected');

  const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
  socket.emit('chat history', messages);

  socket.on('chat message', async (msg) => {
    const message = new Message({ text: msg });
    await message.save();
    io.emit('chat message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

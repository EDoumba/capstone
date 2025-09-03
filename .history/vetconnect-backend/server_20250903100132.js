const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors:{ origin: process.env.FRONTEND_URL||"http://localhost:4200", methods:["GET","POST"] } });

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:4200', // Angular dev server, app.use(cors());
  credentials: true

}));
app.use(morgan('combined'));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended:true }));

// Add this right after your middleware setup
console.log('Middleware setup complete');

// Socket.io
require('./socket/chat')(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/vets', require('./routes/vets'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req,res)=> res.json({message:'VetConnect API is running!'}));

// 404 handler
app.use((req,res)=> res.status(404).json({ message:'Route not found' }));

// Error handling
app.use((error,req,res,next)=>{
  console.error(error.stack);
  res.status(500).json({ message:'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;



sequelize.authenticate()
.then(()=>{
  console.log('Database connected successfully.');
  return sequelize.sync({ alter:true });
})

.then(()=>{
  server.listen(PORT, '0.0.0.0',()=> console.log(`Server running on port ${PORT}`));
})
.catch(err=>{
  console.error('Unable to connect to the database:',err);
});

// Test if server is actually listening
    const net = require('net');
    const tester = net.createServer();
    tester.once('error', (err) => {
      console.error('Port test error:', err);
    });
    tester.once('listening', () => {
      console.log('Port is actually available');
      tester.close();
    });
    tester.listen(PORT);

// Immediate test

    const test = require('http').get(`http://localhost:${PORT}/api/health`, (res) => {
      console.log('Self-test passed! Server is accessible');
    }).on('error', (err) => {
      console.error('Self-test failed! Server not accessible:', err.message);
    });

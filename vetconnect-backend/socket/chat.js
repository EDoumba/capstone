module.exports = (io) => {
  const chatNamespace = io.of('/chat');
  
  chatNamespace.on('connection', (socket) => {
    console.log('User connected to chat:', socket.id);
    
    // Join user's personal room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });
    
    // Join conversation room
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation-${conversationId}`);
      console.log(`User joined conversation ${conversationId}`);
    });
    
    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { Message } = require('../models');
        const message = await Message.create({
          sender_id: data.senderId,
          receiver_id: data.receiverId,
          message: data.message
        });
        
        // Emit to receiver
        socket.to(`user-${data.receiverId}`).emit('receive-message', message);
        
        // Also send back to sender for UI update
        socket.emit('message-sent', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(`user-${data.receiverId}`).emit('typing-start', { 
        senderId: data.senderId,
        conversationId: data.conversationId 
      });
    });
    
    socket.on('typing-stop', (data) => {
      socket.to(`user-${data.receiverId}`).emit('typing-stop', { 
        senderId: data.senderId,
        conversationId: data.conversationId 
      });
    });
    
    // Handle message read status
    socket.on('mark-as-read', async (data) => {
      try {
        const { Message } = require('../models');
        await Message.update(
          { is_read: true },
          { 
            where: { 
              sender_id: data.senderId, 
              receiver_id: data.receiverId,
              is_read: false
            } 
          }
        );
        
        // Notify sender that messages were read
        socket.to(`user-${data.senderId}`).emit('messages-read', {
          readerId: data.receiverId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected from chat:', socket.id);
    });
  });
};
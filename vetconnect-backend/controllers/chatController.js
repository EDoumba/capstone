const { Message, User } = require('../models');
const { Op } = require('sequelize');

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const { other_user_id } = req.params;
    const current_user_id = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if other user exists
    const otherUser = await User.findByPk(other_user_id, {
      attributes: ['id', 'first_name', 'last_name', 'profile_picture', 'user_type']
    });

    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get messages
    const messages = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          {
            sender_id: current_user_id,
            receiver_id: other_user_id
          },
          {
            sender_id: other_user_id,
            receiver_id: current_user_id
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Mark messages as read
    await Message.update(
      { is_read: true },
      {
        where: {
          sender_id: other_user_id,
          receiver_id: current_user_id,
          is_read: false
        }
      }
    );

    res.json({
      messages: messages.rows.reverse(), // Return in chronological order
      otherUser,
      totalPages: Math.ceil(messages.count / limit),
      currentPage: parseInt(page),
      totalMessages: messages.count
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error while fetching conversation' });
  }
};

// Get list of conversations for current user
const getConversations = async (req, res) => {
  try {
    const current_user_id = req.user.id;

    // Get unique users that current user has conversed with
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: current_user_id },
          { receiver_id: current_user_id }
        ]
      },
      attributes: [
        [sequelize.literal(`CASE WHEN sender_id = ${current_user_id} THEN receiver_id ELSE sender_id END`), 'other_user_id'],
        [sequelize.fn('MAX', sequelize.col('Message.created_at')), 'last_message_at']
      ],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture', 'user_type']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture', 'user_type']
        }
      ],
      group: ['other_user_id'],
      order: [[sequelize.literal('last_message_at'), 'DESC']]
    });

    // Format response
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.get('other_user_id');
        const otherUser = otherUserId === conv.sender_id ? conv.sender : conv.receiver;
        
        // Get unread count
        const unreadCount = await Message.count({
          where: {
            sender_id: otherUserId,
            receiver_id: current_user_id,
            is_read: false
          }
        });

        // Get last message
        const lastMessage = await Message.findOne({
          where: {
            [Op.or]: [
              {
                sender_id: current_user_id,
                receiver_id: otherUserId
              },
              {
                sender_id: otherUserId,
                receiver_id: current_user_id
              }
            ]
          },
          order: [['created_at', 'DESC']]
        });

        return {
          otherUser: {
            id: otherUser.id,
            first_name: otherUser.first_name,
            last_name: otherUser.last_name,
            profile_picture: otherUser.profile_picture,
            user_type: otherUser.user_type
          },
          lastMessage: lastMessage ? {
            message: lastMessage.message,
            created_at: lastMessage.created_at,
            is_read: lastMessage.is_read,
            is_sent: lastMessage.sender_id === current_user_id
          } : null,
          unreadCount
        };
      })
    );

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error while fetching conversations' });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.id;

    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id, {
      attributes: ['id', 'first_name', 'last_name']
    });

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create message
    const newMessage = await Message.create({
      sender_id,
      receiver_id,
      message
    });

    // Get message with sender details
    const sentMessage = await Message.findByPk(newMessage.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'first_name', 'last_name', 'profile_picture']
      }]
    });

    res.status(201).json({
      message: 'Message sent successfully',
      sentMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { sender_id } = req.params;
    const receiver_id = req.user.id;

    await Message.update(
      { is_read: true },
      {
        where: {
          sender_id,
          receiver_id,
          is_read: false
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error while marking messages as read' });
  }
};

module.exports = {
  getConversation,
  getConversations,
  sendMessage,
  markAsRead
};
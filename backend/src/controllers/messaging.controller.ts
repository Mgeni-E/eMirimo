import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { User } from '../models/User';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name profile_image role')
    .populate('last_message')
    .sort({ last_message_at: -1 });

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).user.uid;
    
    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const messages = await Message.find({
      conversation_id: conversationId
    })
    .populate('sender_id', 'name profile_image')
    .sort({ created_at: 1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversation_id, content, message_type = 'text', metadata } = req.body;
    const senderId = (req as any).user.id;
    
    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversation_id,
      participants: senderId
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Get receiver ID
    const receiverId = conversation.participants.find(
      (id: any) => id.toString() !== senderId
    );

    const message = new Message({
      conversation_id,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      message_type,
      metadata
    });

    await message.save();

    // Update conversation
    await Conversation.findByIdAndUpdate(conversation_id, {
      last_message: message._id,
      last_message_at: message.created_at,
      $inc: { [`unread_count.${receiverId}`]: 1 }
    });

    // Populate sender info
    await message.populate('sender_id', 'name profile_image');

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { participant_id, metadata } = req.body;
    const userId = (req as any).user.uid;
    
    if (userId === participant_id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create conversation with yourself'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participant_id] }
    });

    if (conversation) {
      return res.json({
        success: true,
        conversation
      });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [userId, participant_id],
      metadata
    });

    await conversation.save();
    await conversation.populate('participants', 'name profile_image role');

    res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).user.uid;
    
    // Mark messages as read
    await Message.updateMany(
      {
        conversation_id: conversationId,
        receiver_id: userId,
        is_read: false
      },
      {
        is_read: true,
        read_at: new Date()
      }
    );

    // Reset unread count
    await Conversation.findByIdAndUpdate(conversationId, {
      $unset: { [`unread_count.${userId}`]: 1 }
    });

    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read'
    });
  }
};

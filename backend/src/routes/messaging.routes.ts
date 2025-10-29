import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  markAsRead
} from '../controllers/messaging.controller';

const router = Router();

// All messaging routes require authentication
router.use(requireAuth);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/conversations', createConversation);
router.put('/conversations/:conversationId/read', markAsRead);

export default router;

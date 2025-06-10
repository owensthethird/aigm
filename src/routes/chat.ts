// src/routes/chat.ts
import express, { Request, Response } from 'express';
import { ChatService } from '../services/chat-service';

// Define request and response types
interface SendMessageRequest {
  message: string;
  context: 'ic' | 'ooc' | 'admin';
  sessionId: string;
  preferredProvider?: string;
}

interface ChatHistoryQuery {
  limit?: number;
  offset?: number;
  context?: 'ic' | 'ooc' | 'admin';
}

// Create router
const router = express.Router();

// Initialize chat service
let chatService: ChatService;

export const initChatRoutes = (service: ChatService): express.Router => {
  chatService = service;
  return router;
};

/**
 * POST /api/chat/send
 * Send a message to the AI and get a response
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { message, context, sessionId, preferredProvider } = req.body as SendMessageRequest;
    
    // Validate request
    if (!message || !context || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['ic', 'ooc', 'admin'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context' });
    }
    
    // Send message to AI
    const response = await chatService.sendMessage({
      content: message,
      context_type: context,
      session_id: sessionId,
      sender_type: 'player',
      preferredProvider
    });
    
    return res.json(response);
  } catch (error) {
    console.error('Error sending message:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Get chat history for a session
 */
router.get('/history/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { limit, offset, context } = req.query as unknown as ChatHistoryQuery;
    
    const history = await chatService.getHistory(sessionId, {
      limit: limit ? parseInt(limit.toString()) : 50,
      offset: offset ? parseInt(offset.toString()) : 0,
      contextType: context
    });
    
    return res.json(history);
  } catch (error) {
    console.error('Error getting chat history:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

/**
 * POST /api/chat/providers/health
 * Check health of all AI providers
 */
router.post('/providers/health', async (req: Request, res: Response) => {
  try {
    const healthStatus = await chatService.checkProvidersHealth();
    return res.json(healthStatus);
  } catch (error) {
    console.error('Error checking provider health:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ error: 'Failed to check provider health' });
  }
});

export default router;

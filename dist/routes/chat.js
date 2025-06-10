"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initChatRoutes = void 0;
// src/routes/chat.ts
const express_1 = __importDefault(require("express"));
// Create router
const router = express_1.default.Router();
// Initialize chat service
let chatService;
const initChatRoutes = (service) => {
    chatService = service;
    return router;
};
exports.initChatRoutes = initChatRoutes;
/**
 * POST /api/chat/send
 * Send a message to the AI and get a response
 */
router.post('/send', async (req, res) => {
    try {
        const { message, context, sessionId, preferredProvider } = req.body;
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
    }
    catch (error) {
        console.error('Error sending message:', error instanceof Error ? error.message : String(error));
        return res.status(500).json({ error: 'Failed to process message' });
    }
});
/**
 * GET /api/chat/history/:sessionId
 * Get chat history for a session
 */
router.get('/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { limit, offset, context } = req.query;
        const history = await chatService.getHistory(sessionId, {
            limit: limit ? parseInt(limit.toString()) : 50,
            offset: offset ? parseInt(offset.toString()) : 0,
            contextType: context
        });
        return res.json(history);
    }
    catch (error) {
        console.error('Error getting chat history:', error instanceof Error ? error.message : String(error));
        return res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
});
/**
 * POST /api/chat/providers/health
 * Check health of all AI providers
 */
router.post('/providers/health', async (req, res) => {
    try {
        const healthStatus = await chatService.checkProvidersHealth();
        return res.json(healthStatus);
    }
    catch (error) {
        console.error('Error checking provider health:', error instanceof Error ? error.message : String(error));
        return res.status(500).json({ error: 'Failed to check provider health' });
    }
});
exports.default = router;

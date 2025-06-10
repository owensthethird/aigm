/**
 * Simple Provider API Routes
 * 
 * Express routes for the simplified provider system
 */

import express from 'express';
import { ProviderRegistry } from './provider-registry';
import { AIProviderConfig } from './provider-config';
import { ChatMessage } from './provider-types';

/**
 * Get available provider types handler
 */
function getProviderTypes(req: any, res: any) {
  try {
    const types = ProviderRegistry.getAvailableProviderTypes();
    res.json({ types });
  } catch (error) {
    console.error('Error getting provider types:', error);
    res.status(500).json({ error: 'Failed to get provider types' });
  }
}

/**
 * Test provider connection handler
 */
async function testProviderConnection(req: any, res: any) {
  try {
    const config = req.body as AIProviderConfig;
    
    if (!config || !config.type || !config.model) {
      return res.status(400).json({ error: 'Invalid provider configuration' });
    }
    
    const client = ProviderRegistry.getClient(config);
    const isConnected = await client.testConnection();
    
    res.json({ 
      success: isConnected,
      message: isConnected ? 'Connection successful' : 'Connection failed'
    });
  } catch (error) {
    console.error('Error testing provider connection:', error);
    res.status(500).json({ 
      error: 'Failed to test provider connection',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Send chat completion request handler
 */
async function sendChatCompletion(req: any, res: any) {
  try {
    const { config, messages } = req.body;
    
    if (!config || !config.type || !config.model) {
      return res.status(400).json({ error: 'Invalid provider configuration' });
    }
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages' });
    }
    
    const client = ProviderRegistry.getClient(config);
    const response = await client.chat(messages);
    
    res.json(response);
  } catch (error) {
    console.error('Error in chat completion:', error);
    res.status(500).json({ 
      error: 'Chat completion failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Send streaming chat completion request handler
 */
async function sendStreamingChatCompletion(req: any, res: any) {
  try {
    const { config, messages } = req.body;
    
    if (!config || !config.type || !config.model) {
      return res.status(400).json({ error: 'Invalid provider configuration' });
    }
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages' });
    }
    
    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const client = ProviderRegistry.getClient(config);
    const stream = client.chatStream(messages);
    
    // Handle client disconnect
    req.on('close', () => {
      client.shutdown();
    });
    
    // Stream responses
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    // End the stream
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error in streaming chat completion:', error);
    
    // Send error as SSE event
    res.write(`data: ${JSON.stringify({ 
      error: 'Chat stream failed',
      message: error instanceof Error ? error.message : String(error)
    })}\n\n`);
    
    res.end();
  }
}

// Create a router
const router = express.Router();

// Define routes
router.get('/providers/types', getProviderTypes);
router.post('/providers/test', testProviderConnection);
router.post('/chat', sendChatCompletion);
router.post('/chat/stream', sendStreamingChatCompletion);

// Export the router
export default router;

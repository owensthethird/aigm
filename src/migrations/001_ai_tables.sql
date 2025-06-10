-- AI Provider and Chat Message tables

-- Add AI provider configuration table
CREATE TABLE IF NOT EXISTS ai_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  model VARCHAR(100),
  config JSONB,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add chat history table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  context_type VARCHAR(20) NOT NULL, -- 'ic', 'ooc', 'admin'
  sender_type VARCHAR(20) NOT NULL,  -- 'player', 'ai'
  content TEXT NOT NULL,
  provider_used VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster chat history queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_context_type ON chat_messages(context_type);

-- Insert default Ollama provider if none exists
INSERT INTO ai_providers (name, type, endpoint, model, config, enabled, priority)
SELECT 'Local Ollama', 'ollama', 'http://localhost:11434', 'llama3', 
  '{"timeout": 30000, "maxRetries": 3, "healthCheck": true}'::jsonb, true, 1
WHERE NOT EXISTS (SELECT 1 FROM ai_providers WHERE type = 'ollama');

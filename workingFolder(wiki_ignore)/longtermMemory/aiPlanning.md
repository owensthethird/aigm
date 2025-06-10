# AI Integration Roadmap

## Phase 1: Local AI Infrastructure Setup (Week 1-2)

### 1.1 Backend Agent - AI Provider Management
```typescript
// ai-providers/
├── base-provider.ts          // Abstract base class
├── ollama-provider.ts        // Ollama integration
├── lmstudio-provider.ts      // LM Studio integration  
├── openapi-provider.ts       // Generic OpenAPI integration
├── provider-factory.ts       // Provider selection logic
└── provider-manager.ts       // Health checks, failover
```

**Implementation Priority:**
1. **Ollama Provider** (most stable for local)
2. **LM Studio Provider** (user-friendly local option)
3. **OpenAPI Provider** (custom model endpoints)

### 1.2 Configuration Management
```typescript
// config/ai-config.ts
interface AIProviderConfig {
  type: 'ollama' | 'lmstudio' | 'openapi' | 'openai';
  endpoint: string;
  model: string;
  enabled: boolean;
  priority: number; // For failover ordering
  healthCheck: boolean;
}
```

### 1.3 Database Schema Updates
```sql
-- Add AI provider configuration table
CREATE TABLE ai_providers (
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
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  context_type VARCHAR(20) NOT NULL, -- 'ic', 'ooc', 'admin'
  sender_type VARCHAR(20) NOT NULL,  -- 'player', 'ai'
  content TEXT NOT NULL,
  provider_used VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Phase 2: Direct Chat Implementation (Week 2-3)

### 2.1 Backend Chat API
```typescript
// routes/chat.ts
POST /api/chat/send
{
  "message": "Hello AI",
  "context": "ic" | "ooc" | "admin",
  "sessionId": "uuid",
  "preferredProvider": "ollama" // optional
}

GET /api/chat/history/:sessionId
// Returns paginated chat history

POST /api/chat/providers/health
// Check all provider health status
```

### 2.2 Frontend Chat Components
```typescript
// Integrate with your color system
<ChatInterface>
  <ContextSelector /> {/* IC/OOC/Admin toggle */}
  <MessageList />     {/* Styled with our color scheme */}
  <ChatInput />       {/* Send to local AI */}
  <ProviderStatus />  {/* Show which AI is active */}
</ChatInterface>
```

### 2.3 Real-time Communication
**Decision Point:** Choose one:
- **WebSockets** (recommended for real-time feel)
- **Server-Sent Events** (simpler, one-way)
- **Polling** (fallback option)

## Phase 3: n8n Integration Layer (Week 3-4)

### 3.1 n8n Custom Node Development
```javascript
// custom-nodes/ai-chat-trigger.js
// Custom n8n node that receives chat messages from AI
class AIChatTrigger {
  execute() {
    // Receives messages from local AI
    // Processes context (IC/OOC/Admin)
    // Triggers appropriate workflows
  }
}
```

### 3.2 AI-to-n8n Communication Bridge
```typescript
// services/ai-n8n-bridge.ts
class AIN8NBridge {
  async sendToWorkflow(message: string, context: ChatContext) {
    // AI sends message to specific n8n workflow
    // Based on context and content analysis
  }
  
  async receiveFromWorkflow(workflowResponse: any) {
    // n8n workflow returns structured response
    // Bridge formats for AI consumption
  }
}
```

### 3.3 Workflow Templates
```json
// n8n workflows for AI integration
{
  "gameStateQuery": "workflow-id-1",      // AI asks about game state
  "characterAction": "workflow-id-2",     // AI processes character actions  
  "worldGeneration": "workflow-id-3",     // AI generates world content
  "ruleValidation": "workflow-id-4"       // AI validates game rules
}
```

## Phase 4: Agentic AI Implementation (Week 4-6)

### 4.1 AI Function Calling Setup
```typescript
// ai-functions/
├── game-functions.ts         // Game state queries
├── character-functions.ts    // Character management
├── world-functions.ts        // World interaction
└── n8n-functions.ts          // n8n workflow triggers

// Example function definition
const gameFunctions = [
  {
    name: "get_character_stats",
    description: "Get current character statistics",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string" },
        statsType: { type: "string", enum: ["combat", "social", "all"] }
      }
    }
  },
  {
    name: "trigger_n8n_workflow",
    description: "Execute n8n workflow with parameters",
    parameters: {
      type: "object", 
      properties: {
        workflowId: { type: "string" },
        inputData: { type: "object" }
      }
    }
  }
];
```

### 4.2 Function Execution Engine
```typescript
// services/function-executor.ts
class AIFunctionExecutor {
  async execute(functionName: string, parameters: any, context: ChatContext) {
    switch(functionName) {
      case 'get_character_stats':
        return await this.gameService.getCharacterStats(parameters);
      case 'trigger_n8n_workflow':
        return await this.n8nService.executeWorkflow(parameters.workflowId, parameters.inputData);
      case 'update_game_state':
        return await this.gameService.updateState(parameters);
    }
  }
}
```

### 4.3 Agentic Conversation Flow
```typescript
// Conversation loop with function calling
class AgenticChatHandler {
  async processMessage(userMessage: string, context: ChatContext) {
    let conversation = [
      { role: "system", content: this.getSystemPrompt(context) },
      { role: "user", content: userMessage }
    ];

    while (true) {
      const response = await this.aiProvider.chat(conversation, {
        functions: this.getAvailableFunctions(context),
        function_call: "auto"
      });

      if (response.function_call) {
        // AI wants to call a function
        const result = await this.functionExecutor.execute(
          response.function_call.name,
          JSON.parse(response.function_call.arguments),
          context
        );
        
        conversation.push({
          role: "function",
          name: response.function_call.name,
          content: JSON.stringify(result)
        });
        
        // Continue conversation with function result
        continue;
      } else {
        // AI provided final response
        return response.content;
      }
    }
  }
}
```

## Phase 5: Advanced Integration (Week 6-8)

### 5.1 Multi-Agent Orchestration
```typescript
// Different AI agents for different purposes
const agents = {
  gamemaster: {
    model: "llama3.1:8b",
    systemPrompt: "You are the game master...",
    functions: ["world_generation", "npc_dialogue", "story_progression"]
  },
  rulesEngine: {
    model: "codellama:7b", 
    systemPrompt: "You validate game rules...",
    functions: ["rule_validation", "dice_resolution", "combat_calculation"]
  },
  characterAssistant: {
    model: "llama3.1:8b",
    systemPrompt: "You help with character management...", 
    functions: ["character_creation", "stat_calculation", "skill_checks"]
  }
};
```

### 5.2 Context-Aware Function Access
```typescript
// Different functions available based on chat context
const contextFunctions = {
  admin: ["system_management", "user_management", "all_workflows"],
  ooc: ["rule_queries", "character_discussion", "meta_workflows"], 
  ic: ["character_actions", "world_interaction", "narrative_workflows"]
};
```

### 5.3 Workflow Chaining
```typescript
// AI can chain multiple n8n workflows
class WorkflowChain {
  async executeChain(workflows: string[], data: any) {
    let result = data;
    for (const workflowId of workflows) {
      result = await this.n8nService.executeWorkflow(workflowId, result);
    }
    return result;
  }
}
```

## Implementation Priority Order

### **MVP (Minimum Viable Product) - 3 weeks:**
1. ✅ Ollama provider integration
2. ✅ Basic chat UI with context switching
3. ✅ Direct AI conversation (no n8n yet)
4. ✅ Message persistence

### **Agentic MVP - 2 weeks:**
5. ✅ Function calling setup
6. ✅ Basic n8n workflow triggers from AI
7. ✅ Simple game state queries

### **Full Integration - 3 weeks:**
8. ✅ Multi-agent setup
9. ✅ Complex workflow chaining
10. ✅ Context-aware function access
11. ✅ Advanced error handling and fallbacks

## Technical Considerations

### **Provider Failover Strategy:**
1. Primary: Local AI (Ollama/LM Studio)
2. Secondary: OpenAI (if API key available)
3. Fallback: Static responses or error handling

### **Performance Optimization:**
- **Connection pooling** for local AI providers
- **Response caching** for repeated queries
- **Async workflow execution** for non-blocking operations
- **Rate limiting** to prevent API abuse

### **Security Considerations:**
- **Function access control** based on user context
- **Input validation** for all AI function calls
- **Audit logging** for all AI-triggered actions
- **Sandboxed execution** for AI-generated code

This roadmap gives you a chat interface talking to local AI within 2-3 weeks, with full agentic capabilities within 6-8 weeks. Would you like me to dive deeper into any specific phase?
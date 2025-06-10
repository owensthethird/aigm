"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nClient = void 0;
// src/n8n-client.ts
const axios_1 = __importDefault(require("axios"));
class N8nClient {
    constructor(config) {
        console.log(`Connecting to n8n API at ${config.baseUrl}`);
        this.client = axios_1.default.create({
            baseURL: `${config.baseUrl}/api/v1`,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Set up lightweight request logging
        this.client.interceptors.request.use(request => {
            var _a;
            const endpoint = request.url || '';
            const method = ((_a = request.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'GET';
            console.log(`🔄 ${method} ${endpoint}`);
            return request;
        });
        // Set up concise response/error logging
        this.client.interceptors.response.use(response => {
            console.log(`✅ Status: ${response.status}`);
            return response;
        }, error => {
            var _a;
            if (axios_1.default.isAxiosError(error) && error.response) {
                console.error(`❌ Error: ${error.response.status} - ${((_a = error.response.data) === null || _a === void 0 ? void 0 : _a.message) || error.message}`);
            }
            else if (error instanceof Error) {
                console.error(`❌ Error: ${error.message}`);
            }
            else {
                console.error('❌ Unknown error occurred');
            }
            return Promise.reject(error);
        });
        // Always use X-N8N-API-KEY header - this is the preferred and working auth method
        if (config.apiKey) {
            console.log('🔑 Using API key authentication');
            this.client.defaults.headers.common['X-N8N-API-KEY'] = config.apiKey.trim();
        }
        else {
            console.error('⚠️ No API key provided - authentication will fail!');
        }
    }
    // Workflow Management
    async getWorkflows() {
        const response = await this.client.get('/workflows');
        return response.data.data;
    }
    async getWorkflow(id) {
        const response = await this.client.get(`/workflows/${id}`);
        return response.data;
    }
    async createWorkflow(workflow) {
        const response = await this.client.post('/workflows', workflow);
        return response.data;
    }
    async updateWorkflow(id, workflow) {
        const response = await this.client.patch(`/workflows/${id}`, workflow);
        return response.data;
    }
    async deleteWorkflow(id) {
        await this.client.delete(`/workflows/${id}`);
    }
    async activateWorkflow(id) {
        await this.client.post(`/workflows/${id}/activate`);
    }
    async deactivateWorkflow(id) {
        await this.client.post(`/workflows/${id}/deactivate`);
    }
    // Execution Management
    async getExecutions(workflowId, limit = 100) {
        const params = { limit };
        if (workflowId)
            params.workflowId = workflowId;
        const response = await this.client.get('/executions', { params });
        return response.data.data;
    }
    async getExecution(id, includeData = false) {
        const params = includeData ? { includeData: 'true' } : {};
        const response = await this.client.get(`/executions/${id}`, { params });
        return response.data;
    }
    async deleteExecution(id) {
        await this.client.delete(`/executions/${id}`);
    }
    async retryExecution(id) {
        const response = await this.client.post(`/executions/${id}/retry`);
        return response.data;
    }
    // Webhook Management
    async executeWebhook(webhookPath, data, method = 'POST') {
        const response = await this.client.request({
            method,
            url: `/webhook/${webhookPath}`,
            data,
        });
        return response.data;
    }
    // Health Check
    async getHealth() {
        var _a;
        try {
            const healthEndpoint = `${(_a = this.client.defaults.baseURL) === null || _a === void 0 ? void 0 : _a.replace('/api/v1', '')}/healthz`;
            console.log(`Checking health endpoint: ${healthEndpoint}`);
            const response = await axios_1.default.get(healthEndpoint);
            return response.data;
        }
        catch (error) {
            console.error('Health check failed:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
}
exports.N8nClient = N8nClient;

// Custom promptfoo provider for SotaAgents SSE chatbot API
// Supports single-turn and multi-turn conversations via thread_id
const http = require('https');

// In-memory thread_id store keyed by conversationId for multi-turn tests
const threadStore = new Map();

class SotaAgentsProvider {
  constructor(options) {
    this.config = options.config || {};
    this.chatbotId = this.config.chatbotId || process.env.SOTAAGENTS_CHATBOT_ID;
    this.bearerToken = this.config.bearerToken || process.env.SOTAAGENTS_BEARER_TOKEN;
    this.orgId = this.config.orgId || process.env.SOTAAGENTS_ORG_ID;
    this.baseUrl = this.config.baseUrl || 'org-shared-api.sotaagents.ai';
  }

  id() {
    return `sotaagents:${this.chatbotId}`;
  }

  async callApi(prompt, context) {
    // Resolve thread_id for multi-turn: look up by conversationId from test metadata
    const conversationId = context?.vars?.conversationId || context?.test?.metadata?.conversationId;
    const threadId = conversationId ? threadStore.get(conversationId) : undefined;

    const payload = {
      question: prompt,
      timezone: 7,
      citation_enabled: false,
    };

    // Attach thread_id for conversation continuity
    if (threadId) {
      payload.thread_id = threadId;
    }

    const body = JSON.stringify(payload);

    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: this.baseUrl,
          path: `/api/v1/public/${this.chatbotId}/messages/sse`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            Authorization: `Bearer ${this.bearerToken}`,
            'x-org-id': this.orgId,
            Origin: 'https://sotaagents.ai',
          },
        },
        (res) => {
          let rawData = '';

          res.on('data', (chunk) => {
            rawData += chunk.toString();
          });

          res.on('end', () => {
            try {
              const { output, threadId: newThreadId } = this.parseSSEResponse(rawData);

              // Store thread_id for subsequent turns in this conversation
              if (conversationId && newThreadId) {
                threadStore.set(conversationId, newThreadId);
              }

              resolve({
                output,
                metadata: { threadId: newThreadId },
                sessionId: newThreadId,
              });
            } catch (err) {
              resolve({ error: `Failed to parse response: ${err.message}` });
            }
          });
        },
      );

      req.on('error', (err) => {
        resolve({ error: `Request failed: ${err.message}` });
      });

      req.setTimeout(30000, () => {
        req.destroy();
        resolve({ error: 'Request timed out after 30s' });
      });

      req.write(body);
      req.end();
    });
  }

  // Parse SSE response: extract full_response text and thread_id
  parseSSEResponse(raw) {
    const lines = raw.split('\n').filter((line) => line.trim());
    let fullResponse = '';
    let threadId = '';

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);

        // Capture thread_id from any chunk
        if (parsed.metadata?.thread_id) {
          threadId = parsed.metadata.thread_id;
        }

        // The last chunk with is_complete=true contains the full_response
        if (parsed.metadata?.is_complete && parsed.metadata?.full_response) {
          fullResponse = parsed.metadata.full_response;
        }
        // Also accumulate streamed text as fallback
        if (parsed.stream && parsed.metadata?.chunk_type === 'message') {
          if (!fullResponse) {
            fullResponse += parsed.stream;
          }
        }
      } catch {
        // Skip non-JSON lines (SSE comments, empty lines, etc.)
      }
    }

    if (!fullResponse) {
      throw new Error('No response content found in SSE stream');
    }

    return { output: fullResponse, threadId };
  }
}

module.exports = SotaAgentsProvider;

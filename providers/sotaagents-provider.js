// Custom promptfoo provider for SotaAgents SSE chatbot API
const http = require('https');

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

  async callApi(prompt) {
    const body = JSON.stringify({
      question: prompt,
      timezone: 7,
      citation_enabled: false,
    });

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
              const output = this.parseSSEResponse(rawData);
              resolve({ output });
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

  // Parse SSE response: each line is a JSON object, find the final one with full_response
  parseSSEResponse(raw) {
    const lines = raw.split('\n').filter((line) => line.trim());
    let fullResponse = '';

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
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

    return fullResponse;
  }
}

module.exports = SotaAgentsProvider;

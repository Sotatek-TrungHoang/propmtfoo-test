# Custom Provider Development

## Provider Interface

Every custom provider must implement `id()` and `callApi()`:

```javascript
class MyProvider {
  constructor(options) {
    this.config = options.config || {};
  }

  id() {
    return 'my-provider';
  }

  async callApi(prompt, context, options) {
    // Make API call, return response
    return { output: 'response text' };
  }
}

module.exports = MyProvider;
```

## Response Object

```javascript
return {
  output: 'response text',       // Required: string or object
  error: 'error message',        // Optional: set on failure
  tokenUsage: {                  // Optional: token tracking
    total: 150,
    prompt: 50,
    completion: 100,
  },
  cost: 0.002,                   // Optional: API cost
  cached: false,                 // Optional: cache indicator
  metadata: {},                  // Optional: extra data
};
```

## Module Formats

- **CommonJS** (`.js`, `.cjs`): `module.exports = MyProvider`
- **ESM** (`.mjs`): `export default MyProvider`
- **TypeScript** (`.ts`): `export default class implements ApiProvider`

## Config Injection

Pass config from `promptfooconfig.yaml`:

```yaml
providers:
  - id: 'file://providers/my-provider.js'
    label: 'My Custom API'
    config:
      apiKey: '{{env.MY_API_KEY}}'
      baseUrl: 'https://api.example.com'
      timeout: 30000
```

Access in provider: `this.config.apiKey`, `this.config.baseUrl`.

## SSE Streaming Provider

For Server-Sent Events APIs:

```javascript
async callApi(prompt) {
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk.toString(); });
      res.on('end', () => {
        const output = this.parseSSEResponse(rawData);
        resolve({ output });
      });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    req.setTimeout(30000, () => {
      req.destroy();
      resolve({ error: 'Timeout' });
    });
    req.write(JSON.stringify({ question: prompt }));
    req.end();
  });
}
```

## HTTP/Webhook Provider (No Code)

```yaml
providers:
  - id: 'https://api.example.com/chat'
    config:
      method: POST
      headers:
        Authorization: 'Bearer {{env.API_KEY}}'
      body:
        message: '{{prompt}}'
      responseParser: 'json.choices[0].message.content'
```

## Context Parameter

`callApi(prompt, context, options)` — context contains:

- `context.vars` — test case variables
- `context.prompt` — raw prompt object
- `context.originalProvider` — provider config

Useful for conditional behavior per test case.

## Error Handling

- Always resolve (never reject) — return `{ error: 'message' }` on failure
- Set timeouts to prevent hanging evals
- Log errors for debugging but keep provider output clean
- Use try-catch around JSON parsing and network calls

## Caching

Use built-in cache for expensive API calls:

```javascript
const { fetchWithCache } = require('promptfoo').cache;
const result = await fetchWithCache(url, options, timeout);
```

## Testing Providers

```bash
# Quick test with 1 case
npx promptfoo eval --filter-first-n 1

# Debug provider output
npx promptfoo eval --verbose

# Skip cache during development
npx promptfoo eval --no-cache --filter-first-n 1
```

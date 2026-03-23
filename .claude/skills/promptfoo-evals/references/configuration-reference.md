# Configuration Reference

## promptfooconfig.yaml Structure

```yaml
description: 'Eval suite description'

# Environment variables from .env file
dotenv: .env

# LLM providers to test
providers:
  - id: 'openai:chat:gpt-5'
  - id: 'anthropic:messages:claude-sonnet-4.6'
  - id: 'file://providers/custom-provider.js'
    label: 'My Custom API'
    config:
      apiKey: '{{env.API_KEY}}'

# Prompt templates (use {{variable}} syntax)
prompts:
  - '{{message}}'
  - file://prompts/system-prompt.txt

# Default settings applied to all tests
defaultTest:
  options:
    timeout: 30000
    provider:                    # Grading provider
      id: 'openai:chat:gpt-5'
      config:
        apiHost: 'custom-host.com'
        apiKey: '{{env.GRADING_KEY}}'

# Test imports (glob patterns supported)
tests:
  - file://tests/*.yaml
  - file://tests/specific-test.yaml

# Eval behavior
evaluateOptions:
  maxConcurrency: 5            # Parallel test execution
  repeat: 1                    # Repeat each test N times
  delay: 0                     # Delay between tests (ms)
  showProgressBar: true

# Output
outputPath: results.json       # Save results to file
```

## Provider Configuration

### Built-in Providers

```yaml
# OpenAI
- id: 'openai:chat:gpt-5'
  config:
    temperature: 0.7
    max_tokens: 1000

# Anthropic
- id: 'anthropic:messages:claude-sonnet-4.6'
  config:
    temperature: 0
    max_tokens: 2048

# OpenAI-compatible (custom endpoint)
- id: 'openai:chat:model-name'
  config:
    apiHost: 'custom-api.com'
    apiKey: '{{env.CUSTOM_KEY}}'

# Local (Ollama)
- id: 'ollama:llama3'
```

### Custom Providers

```yaml
- id: 'file://providers/my-provider.js'
  label: 'Display Name'
  config:
    key: value
```

## Environment Variables

```yaml
dotenv: .env                   # Load from .env file
# Access in config: {{env.VAR_NAME}}
```

## Test Imports

```yaml
tests:
  - file://tests/*.yaml        # Glob pattern
  - file://tests/special.json  # JSON format
  - file://tests/gen.js        # JS generator
```

## Extensions (Hooks)

```yaml
extensions:
  - file://hooks/setup.js      # beforeAll, afterAll, etc.
```

Hook interface:

```javascript
module.exports = {
  beforeAll: async ({ tests }) => { /* setup */ },
  afterAll: async ({ results }) => { /* teardown */ },
  beforeEach: async ({ test }) => { /* per-test setup */ },
  afterEach: async ({ test, result }) => { /* per-test cleanup */ },
};
```

## Output Formats

```yaml
outputPath: results.json       # JSON
outputPath: results.csv        # CSV
outputPath: results.yaml       # YAML
outputPath: results.html       # HTML report
```

## Multiple Config Files

```bash
npx promptfoo eval -c config1.yaml -c config2.yaml
npx promptfoo eval -c "configs/*.yaml"
```

## Transforms

```yaml
# Provider-level transform
providers:
  - id: 'openai:chat:gpt-5'
    transform: 'output.trim().toLowerCase()'

# Test-level transform
tests:
  - vars: { message: 'hello' }
    options:
      transform: 'JSON.parse(output).text'

# Variable transform
tests:
  - vars: { message: 'hello' }
    options:
      transformVars: |
        { ...vars, message: vars.message.toUpperCase() }
```

## Sharing Results

```bash
npx promptfoo share              # Generate shareable URL
npx promptfoo eval --share       # Auto-share after eval
```

# Pharmacity AI Chatbot Evaluation

Promptfoo-based (https://www.promptfoo.dev/) evaluation suite for the SotaAgents Pharmacity AI chatbot — a Vietnamese pharmacy assistant that sells OTC medicines, supplements, cosmetics, and medical devices via [Pharmacity.vn](https://pharmacity.vn).

## Quick Start

```bash
# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env.example .env

# Run full evaluation (265 tests)
npx promptfoo eval

# View results in browser
npx promptfoo view
```

## Environment Variables

Create a `.env` file with:

| Variable | Description |
|----------|-------------|
| `SOTAAGENTS_BEARER_TOKEN` | JWT token for SotaAgents API |
| `SOTAAGENTS_ORG_ID` | SotaAgents organization ID |
| `SOTAAGENTS_CHATBOT_ID` | SotaAgents chatbot ID |
| `OPENAI_API_COMPATIBLE_KEY` | API key for grading LLM (aisieure.com) |
| `OPENAI_COMPACIBLE_PROVIDER` | Grading LLM endpoint (https://aisieure.com/v1) |

## Project Structure

```
promptfooconfig.yaml          # Main config (providers, grading, test imports)
providers/
  sotaagents-provider.js      # Custom SSE streaming provider for SotaAgents API
tests/
  01-greeting-identity.yaml       # 18 tests - Greetings, identity, bot availability
  02-core-capabilities.yaml       # 19 tests - Services, delivery, ordering, loyalty
  03-boundary-handling.yaml       # 20 tests - Off-topic, competitors, adjacent topics
  04-prompt-injection.yaml        # 25 tests - Jailbreaks, XSS, SQL injection, social engineering
  05-language-handling.yaml       # 20 tests - Multilingual, dialects, code-switching
  06-edge-cases.yaml              # 24 tests - Empty input, special chars, malformed data
  07-products-otc-medicines.yaml  # 15 tests - Pain relief, cold/flu, digestive, allergy
  08-products-supplements.yaml    # 13 tests - Vitamins, probiotics, omega-3, prenatal
  09-products-cosmetics-personal-care.yaml  # 12 tests - Skincare, hygiene, baby care
  10-products-medical-devices.yaml          # 10 tests - BP monitors, thermometers, nebulizers
  11-products-prescription-boundary.yaml    # 12 tests - Antibiotics, insulin, controlled drugs
  12-products-comparison-details.yaml       # 15 tests - Price comparison, usage instructions
  13-safety-compliance.yaml       # 25 tests - Self-harm, emergencies, illegal substances
  14-conversation-quality.yaml    # 20 tests - Gratitude, criticism, follow-ups, anxiety
  15-vietnamese-cultural.yaml     # 15 tests - Traditional medicine, folk remedies, Tet prep
```

**Total: 265 test cases**

## Running Subsets

```bash
# Run specific category by description pattern
npx promptfoo eval --filter-pattern "Safety"
npx promptfoo eval --filter-pattern "Prescription"

# Run first N tests only
npx promptfoo eval --filter-first-n 10

# Re-run only failed tests from a previous eval
npx promptfoo eval --filter-failing <eval-id>

# Run without cache
npx promptfoo eval --no-cache
```

## Chatbot Product Categories

| Category | Description | Bot Behavior |
|----------|-------------|--------------|
| **A** | Supplements, cosmetics, devices | Full advice + product recommendations |
| **B** | OTC medicines | Guided advice, may ask clarifying questions |
| **C** | Prescription drugs | Refuses sale, recommends doctor consultation |

## Assertion Types Used

| Type | Purpose |
|------|---------|
| `llm-rubric` | AI-graded evaluation against criteria (most tests) |
| `contains-any` | Checks for expected keywords (pricing, product names) |
| `not-contains-any` | Ensures no sensitive data leaks (prompt injection tests) |

## Grading

Tests are graded by `claude-sonnet-4.6` via an OpenAI-compatible endpoint at `aisieure.com`. Each test makes 2 API calls: one to SotaAgents (chatbot response) and one to the grading LLM (evaluation).

## Architecture

```
User Input (Vietnamese)
       │
       ▼
┌──────────────────┐     SSE Streaming      ┌─────────────────────┐
│  promptfoo eval  │ ──────────────────────► │  SotaAgents API     │
│                  │ ◄────────────────────── │  (Pharmacity Bot)   │
└──────────────────┘     Bot Response        └─────────────────────┘
       │
       ▼
┌──────────────────┐     OpenAI-compatible   ┌─────────────────────┐
│  Grading Engine  │ ──────────────────────► │  aisieure.com       │
│  (llm-rubric)    │ ◄────────────────────── │  (claude-sonnet)    │
└──────────────────┘     Pass/Fail           └─────────────────────┘
```

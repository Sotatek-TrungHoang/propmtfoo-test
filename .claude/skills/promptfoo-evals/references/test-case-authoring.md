# Test Case Authoring

## File Structure

Test files live in `tests/` as YAML. Naming: `NN-category-name.yaml` (zero-padded prefix for ordering).

```yaml
# tests/01-greeting-identity.yaml
- description: 'Greeting - Vietnamese'
  vars:
    message: 'Xin chào'
  assert:
    - type: contains-any
      value: ['chào', 'giúp', 'hỗ trợ']
    - type: llm-rubric
      value: 'Response is a polite Vietnamese greeting and offers help.'
```

## Anatomy of a Test Case

| Field | Required | Description |
|-------|----------|-------------|
| `description` | Yes | Human-readable test name |
| `vars` | Yes | Input variables matching prompt template |
| `assert` | No | Array of assertions to validate output |
| `options` | No | Per-test overrides (timeout, provider, transform) |
| `threshold` | No | Minimum assertion pass rate (0-1) |

## Assertion Types

### Deterministic (no LLM needed)

```yaml
# Exact match
- type: equals
  value: 'expected output'

# Substring
- type: contains
  value: 'expected substring'
- type: icontains          # case-insensitive
  value: 'substring'

# Any/all from list
- type: contains-any
  value: ['option1', 'option2']
- type: contains-all
  value: ['must1', 'must2']

# Negation (prepend not-)
- type: not-contains
  value: 'forbidden text'
- type: not-contains-any
  value: ['secret', 'password', 'API key']

# Regex
- type: regex
  value: '\\d{3}-\\d{4}'

# Starts with
- type: starts-with
  value: 'Hello'

# JSON validation
- type: is-json
- type: contains-json
- type: is-json
  value:                   # JSON schema validation
    type: object
    required: ['name']

# Performance
- type: latency
  threshold: 5000          # ms
- type: cost
  threshold: 0.01          # dollars

# Text similarity
- type: levenshtein
  threshold: 5
- type: rouge-n
  value: 'reference text'
  threshold: 0.7
```

### Model-Graded (uses grading LLM)

```yaml
# Free-form rubric — most flexible
- type: llm-rubric
  value: 'Response is helpful, accurate, and in Vietnamese.'

# Factuality check
- type: factuality
  value: 'The capital of France is Paris.'

# Semantic similarity via embeddings
- type: similar
  value: 'expected meaning'
  threshold: 0.8

# Answer relevance
- type: answer-relevance

# Context faithfulness (RAG)
- type: context-faithfulness
- type: context-recall
- type: context-relevance

# Refusal detection
- type: is-refusal
```

### Custom Code

```yaml
# Inline JavaScript
- type: javascript
  value: 'output.includes("Pharmacity") && output.length > 20'

# External file
- type: javascript
  value: file://asserts/custom-check.js

# Python
- type: python
  value: file://asserts/validate.py
```

## Weighted Scoring

```yaml
assert:
  - type: contains-any
    value: ['Pharmacity']
    weight: 2               # more important
  - type: llm-rubric
    value: 'Polite response'
    weight: 1
```

## Named Metrics

```yaml
assert:
  - type: llm-rubric
    value: 'Helpful response'
    metric: helpfulness
  - type: llm-rubric
    value: 'Accurate information'
    metric: accuracy
```

## Organization Patterns

Group tests by category with comment headers:

```yaml
# --- Basic Greetings ---
- description: 'Greeting - Vietnamese'
  ...

# --- Identity Questions ---
- description: 'Identity - who are you'
  ...
```

Keep each file focused on one category. 10-25 tests per file is ideal.

## Tips

- Use descriptive `description` fields — they appear in reports
- Combine deterministic + model-graded assertions for robust validation
- `contains-any` for quick keyword checks, `llm-rubric` for nuanced evaluation
- Use `not-contains-any` for safety/security tests (no leaked data)
- Set `threshold` on test level for partial-pass scenarios
- Test bilingual outputs with `icontains` (case-insensitive)

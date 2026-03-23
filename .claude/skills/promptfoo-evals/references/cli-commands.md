# CLI Commands

## Core Commands

### eval — Run Evaluations

```bash
npx promptfoo eval                          # Run all tests
npx promptfoo eval -c custom-config.yaml    # Custom config file
npx promptfoo eval --verbose                # Detailed output
npx promptfoo eval --no-cache               # Skip cache
npx promptfoo eval --no-table               # Skip table output
npx promptfoo eval --share                  # Auto-share results
npx promptfoo eval --watch                  # Re-run on file changes
npx promptfoo eval --resume                 # Resume incomplete eval
npx promptfoo eval --output results.json    # Save to file
npx promptfoo eval --max-concurrency 5      # Parallel execution
npx promptfoo eval --repeat 3              # Repeat each test 3x
npx promptfoo eval --delay 1000            # Delay between tests (ms)
npx promptfoo eval --env-file .env.test    # Custom env file
```

### Filtering

```bash
# By description pattern
npx promptfoo eval --filter-pattern "Safety"
npx promptfoo eval --filter-pattern "Greeting"

# First N tests only
npx promptfoo eval --filter-first-n 10

# Random sample
npx promptfoo eval --filter-sample 20

# By provider
npx promptfoo eval --filter-providers "openai:*"

# By prompt
npx promptfoo eval --filter-prompts "system*"

# Re-run only failures
npx promptfoo eval --filter-failing <eval-id>
```

### view — Results Browser

```bash
npx promptfoo view                    # Open web UI on localhost
npx promptfoo view --port 8080        # Custom port
```

### init — Project Setup

```bash
npx promptfoo init                    # Interactive setup
npx promptfoo init my-project         # Named directory
```

### validate — Config Check

```bash
npx promptfoo validate                # Validate promptfooconfig.yaml
npx promptfoo validate -c custom.yaml
```

## Result Management

```bash
npx promptfoo list                    # List all evaluations
npx promptfoo show <eval-id>          # Show specific eval
npx promptfoo share <eval-id>         # Share eval URL
npx promptfoo export <eval-id>        # Export to JSON
npx promptfoo import results.json     # Import eval
npx promptfoo delete <eval-id>        # Delete eval
```

## Cache Management

```bash
npx promptfoo cache clear             # Clear all cached responses
```

## Generation

```bash
npx promptfoo generate dataset        # Generate synthetic test data
npx promptfoo generate assertions     # Auto-generate assertions
```

## Red Team Commands

```bash
npx promptfoo redteam init            # Initialize red team config
npx promptfoo redteam generate        # Generate adversarial cases
npx promptfoo redteam eval            # Run red team evaluation
npx promptfoo redteam report          # View vulnerability report
npx promptfoo redteam discover        # Discover attack surface
npx promptfoo redteam plugins         # List available plugins
```

## Debugging

```bash
npx promptfoo debug                   # System info and troubleshooting
npx promptfoo logs                    # View application logs
npx promptfoo logs --level error      # Filter by log level
```

## Common Workflows

```bash
# Smoke test (quick validation)
npx promptfoo eval --filter-first-n 3 --no-cache

# Full eval with results
npx promptfoo eval && npx promptfoo view

# Category-specific run
npx promptfoo eval --filter-pattern "Injection"

# Dev iteration (watch mode)
npx promptfoo eval --watch --filter-first-n 5

# CI/CD (fail on threshold)
npx promptfoo eval --output results.json
```

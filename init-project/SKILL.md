---
name: init-project
description: Auto-generate a CLAUDE.md for a new project by analyzing its structure, tooling, and conventions
user-invocable: true
---

# Init Project — CLAUDE.md Generator

Analyze the current project and generate a tailored CLAUDE.md file with project instructions for Claude Code.

## Steps

### 1. Detect project type

Check for these files to determine the technology stack:

| File                          | Stack                             |
| ----------------------------- | --------------------------------- |
| `package.json`                | Node.js / JavaScript / TypeScript |
| `Cargo.toml`                  | Rust                              |
| `go.mod`                      | Go                                |
| `pyproject.toml` / `setup.py` | Python                            |
| `Gemfile`                     | Ruby                              |
| `pom.xml` / `build.gradle`    | Java / Kotlin                     |

### 2. Analyze project structure

```bash
# Show directory tree (2 levels deep, ignore node_modules etc.)
find . -maxdepth 2 -type d \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -not -path '*/.next/*' \
  | head -40
```

### 3. Extract tooling configuration

Read and analyze:

- **Linter config**: `.eslintrc*`, `ruff.toml`, `.rubocop.yml`, `clippy.toml`
- **Formatter config**: `.prettierrc*`, `rustfmt.toml`, `black` config
- **TypeScript config**: `tsconfig.json` (strictness settings)
- **Test config**: `vitest.config.*`, `jest.config.*`, `pytest.ini`, `Cargo.toml [test]`
- **CI config**: `.github/workflows/*.yml`, `.gitlab-ci.yml`
- **Build scripts**: `package.json` scripts, `Makefile`, `Taskfile`

### 4. Discover available commands

For Node.js:

```bash
# List all npm scripts
node -e "const p=require('./package.json'); Object.keys(p.scripts||{}).forEach(s=>console.log(s))"
```

### 5. Check for existing conventions

Look for:

- Existing `CONTRIBUTING.md` or `DEVELOPMENT.md`
- Code style patterns in existing source files
- Import ordering conventions
- Naming patterns (camelCase, snake_case, PascalCase)
- Error handling patterns

### 6. Generate CLAUDE.md

Write a `CLAUDE.md` file with these sections:

```markdown
# [Project Name] — Claude Code Project Instructions

## Project Overview

[1-2 sentence description based on package.json/README]

## Architecture

[Directory structure with purpose of each top-level dir]

## Code Style Rules

[Extracted from linter/formatter config]

## Available Commands

[From package.json scripts or Makefile]

## CI Pipeline

[From GitHub Actions/GitLab CI config]

## Testing

[Test framework, how to run, conventions]

## Key Conventions

[Naming, imports, error handling patterns]
```

### 7. Verify

Show the generated CLAUDE.md to the user for review before writing.

## Notes

- CLAUDE.md is automatically loaded by Claude Code on every session
- Keep it under 200 lines — it's always in context
- Focus on rules and conventions, not documentation
- Update it when project conventions change

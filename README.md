<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/ai-pipe--command-%23FF6B6B?style=for-the-badge&labelColor=1a1a1a">
  <img alt="ai — universal AI pipe command" src="https://img.shields.io/badge/ai-pipe--command-%23FF6B6B?style=for-the-badge&labelColor=ffffff">
</picture>

# `ai` — AI pipe command

> **AI should be a Unix tool, not a chat window.**


```bash
npm install -g pipe-ai
export OPENAI_API_KEY="sk-..."
ai "write a python web server"
```

---

## Why?

Every terminal user needs AI. But every AI tool wants you to open a chat window, log in, paste your code, click buttons.

**That's not how Unix works.**

In Unix, you pipe:

```bash
cat error.log | grep "Error"
curl api.example.com | jq '.data'
git diff | ai "write a commit message"
```

`ai` turns LLMs into a **Unix pipe command** — like `grep` for intelligence, like `jq` for language.

---

## 10-second demo

```bash
# Fix bugs without leaving the terminal
cat buggy.py | ai "find and fix the bug"

# Write documentation from code
cat src/*.js | ai "generate API docs in markdown"

# Translate anything on the fly
curl https://news.ycombinator.com | ai "summarize top 5 stories in Chinese"

# Explain errors instantly
node server.js 2>&1 | ai "explain this error and suggest a fix"
```

No config. No login. No GUI. Just pipes, models, and results.

---

## Install

### One command

```bash
npm install -g pipe-ai
```

### Or download

| Platform | Download |
|----------|----------|
| macOS    | `brew install pipe-ai` |
| Linux    | `curl -fsSL https://pipe-ai.sh/install | bash` |
| Windows  | `scoop install pipe-ai` |

---

## Setup

Set any API key and you're ready:

```bash
# Option A: OpenAI
export OPENAI_API_KEY="sk-..."

# Option B: Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# Option C: DeepSeek (cheapest!)
export DEEPSEEK_API_KEY="sk-..."

# Option D: Local (free!)
# Install Ollama, then:
export OLLAMA_HOST="http://localhost:11434"

# Option E: Run the wizard
ai init
```

---

## Usage

### Ask anything

```bash
ai "explain TCP/IP in one sentence"
```

### Pipe content through AI

```bash
cat notes.txt | ai "summarize this"
curl api.github.com/repos/opencode-ai/opencode | ai "explain this JSON response"
git log --oneline | ai "generate release notes"
ps aux | ai "which process is using the most memory and should I kill it?"
```

### Choose a model

```bash
ai -p anthropic "design a React component"
ai -m gpt-4o "write a Rust function"
ai -p deepseek "optimize this SQL query"
```

### System instructions

```bash
ai -s "you are a senior Rust developer" "review this code" < src/main.rs
```

### Vision (image input)

```bash
ai -v "describe this UI screenshot and suggest improvements" < screenshot.png
```

---

## Supported providers

| Provider | Env variable | Default model |
|----------|-------------|---------------|
| OpenAI | `OPENAI_API_KEY` | `gpt-4o` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` |
| DeepSeek | `DEEPSEEK_API_KEY` | `deepseek-chat` |
| Google Gemini | `GOOGLE_API_KEY` | `gemini-2.0-flash` |
| OpenRouter | `OPENROUTER_API_KEY` | `openai/gpt-4o` |
| Ollama (local) | `OLLAMA_HOST` | `llama3` |

---

## Real-world workflows

```bash
# Code review
git diff main | ai -s "you are a senior engineer. find security issues and bugs" > review.md

# Error debugging
npm test 2>&1 | ai "explain why these tests fail and how to fix them"

# Data transformation
cat data.csv | ai "convert this to JSON with proper schema" > data.json

# Documentation
find src -name "*.js" -exec cat {} + | ai "generate README documentation" > README.md

# Commit messages
git diff --cached | ai "write a conventional commit message" | pbcopy

# Learning
man rsync | ai "explain rsync like I'm 12 years old"

# Quick translation
cat README.md | ai "translate this to Japanese, preserve markdown formatting" > README.ja.md
```

---

## Philosophy

Unix has `grep` for text, `jq` for JSON, `sed` for transformations.

**AI is a new primitive.** It deserves to be a pipe command — composable, scriptable, chainable with everything else.

```
cat error.log | grep "Error" | ai "find the root cause" | tee fix.txt
```

This isn't a product. It's a **missing Unix command** that should have existed since the terminal was invented.

---

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

Ideas for contributions:
- Add more providers (Mistral, Cohere, Groq, etc.)
- Streaming output support
- Syntax highlighting for code output
- Token counting and cost estimation
- Homebrew formula
- Windows installer

---

## License

MIT — do whatever you want.

---

<p align="center">
  <b>AI is a pipe command.</b><br>
  <code>cat problem | ai "solve it"</code>
</p>
# Launch Plan: `ai` — AI pipe command

---

## Hacker News Post

**Title:** AI should be a Unix tool, not a chat window

**Body:**

```text
I built `ai` — a CLI tool that turns any AI model into a Unix pipe command.

cat error.log | ai "explain and fix this error"
git diff | ai "write a commit message"
curl https://news.ycombinator.com | ai "summarize top stories"
ps aux | ai "which process is hogging memory?"

It works with OpenAI, Claude, DeepSeek, Gemini, Ollama (local), and OpenRouter.
Streaming output. No config needed — just set an API key and pipe.

npm install -g unix-ai
export OPENAI_API_KEY="sk-..."
ai "hello world"

The philosophy: AI should be composable like grep, jq, sed.
It's 2026 and every terminal user needs AI in their pipe.

https://github.com/ricky-theseus/unix-ai
```

**Best time to post:** Tuesday-Thursday, 9-11am ET / 2-4pm UTC

---

## Product Hunt Post

**Tagline:** AI as a Unix pipe command. Like `grep` for intelligence.

**Description:**

`ai` turns any AI model into a Unix pipe command. Instead of opening a chat window and pasting your code, you just pipe:

```
cat error.log | ai "explain and fix this error"
git diff | ai "write a commit message"
```

Works with OpenAI, Anthropic Claude, DeepSeek, Google Gemini, Ollama (local), and OpenRouter. Streaming output, zero config, bring your own API key.

Philosophy: AI is a new Unix primitive. It should compose with everything else, just like grep, jq, and sed.

**First comment:**

```text
npm install -g unix-ai
export OPENAI_API_KEY="sk-..."
ai "hello world"

Then try:
cat somefile | ai "do something with this"
```

**Images:** README screenshot + terminal GIF

---

## Social Media (X/Twitter)

```text
AI should be a Unix tool, not a chat window.

cat error.log | ai "fix this"
git diff | ai "write a commit message"

I built `ai` — the pipe command for AI. Works with any model, streaming output, zero config.

npm i -g unix-ai
github.com/ricky-theseus/unix-ai
```

---

## Reddit (r/programming, r/devtools)

**Title:** I built `ai` — make your terminal pipes intelligent: `cat error.log | ai "fix this"`

**Body:** Similar to HN post. Focus on the "why" — chat windows break the Unix workflow.

---

## Checklist

- [ ] GitHub repo renamed to `unix-ai`
- [ ] Demo GIF recorded and added to README
- [ ] npm publish with latest version
- [ ] Test `curl ... | node bin/ai.js "process this"` end-to-end
- [ ] HN post ready
- [ ] PH post ready with images
- [ ] X/Twitter thread ready
- [ ] Reddit post ready
# Contributing

`ai` is a Unix pipe command for AI. Contributions that add providers, improve streaming, or fix edge cases are welcome.

## Development

```bash
git clone https://github.com/ricky-theseus/unix-ai
cd unix-ai
```

The command is just `node bin/ai.js`. No build step.

## Testing

```bash
export OPENAI_API_KEY="sk-..."
node bin/ai.js "hello world"
echo "hello" | node bin/ai.js "translate to French"
```

## Adding a provider

1. Add env variable name to `ENV_MAP` in `src/config.js`
2. Add provider info to `PROVIDER_INFO`
3. Add a streaming function to `src/providers.js` (see existing ones for reference)
4. Register it in `STREAM_PROVIDERS`

## Code style

- No build tools. Pure Node.js ESM.
- No external dependencies.
- Single-file per concern.
- Streaming first: every provider should support `for await (const chunk of stream(...))`.

## Release

```bash
npm version patch
git push --follow-tags
npm publish
```

## README

If you change the README, make sure the demo commands at the top still work. That's the first thing people see.
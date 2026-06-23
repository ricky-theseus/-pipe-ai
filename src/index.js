#!/usr/bin/env node
import { readFileSync } from 'fs';
import { getDefaultProvider, getDefaultModel, getActiveProviders, getProviderInfo, initWizard } from './config.js';
import { callProvider } from './providers.js';

function printUsage() {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║  ai — AI pipe command for your terminal  ║
  ╚══════════════════════════════════════════╝

  USAGE
    $ ai <prompt>                     Ask a question
    $ cat file | ai <prompt>          Pipe content through AI
    $ ai -m <model> <prompt>          Use a specific model
    $ ai -p <provider> <prompt>       Use a specific provider
    $ ai -s "<system>" <prompt>       Set system prompt
    $ ai --list                       Show available providers
    $ ai init                         Run setup wizard
    $ ai --help                       Show this help

  EXAMPLES
    $ ai "write a python web server"
    $ cat error.log | ai "explain and fix this error"
    $ git diff | ai "write a commit message"
    $ cat photo.jpg | ai --vision "describe this image"
    $ ai -p anthropic "design a database schema"
    $ ai -s "you are a senior code reviewer" < code.py

  ENVIRONMENT VARIABLES
    OPENAI_API_KEY        OpenAI / GPT models
    ANTHROPIC_API_KEY     Anthropic / Claude models
    DEEPSEEK_API_KEY      DeepSeek models
    GOOGLE_API_KEY        Google Gemini models
    OPENROUTER_API_KEY    OpenRouter (multi-provider)

  PRO TIP: Pipe everything through AI:
    curl api.example.com | ai "summarize as JSON"
`);
}

export async function run(args) {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  if (args.includes('init')) {
    await initWizard();
    return;
  }

  if (args.includes('--list') || args.includes('-l')) {
    const active = getActiveProviders();
    console.log('\n  Active providers:\n');
    for (const p of active) {
      const info = getProviderInfo(p);
      console.log(`  ✓ ${info.name} — ${info.defaultModel}`);
    }
    if (active.length === 0) {
      console.log('  No providers configured. Set an API key or run: ai init\n');
    }
    console.log('');
    return;
  }

  if (args.includes('--vision') || args.includes('-v')) {
    const imgIndex = args.indexOf('--vision') !== -1 ? args.indexOf('--vision') : args.indexOf('-v');
    args.splice(imgIndex, 1);
  }

  let provider = getDefaultProvider();
  let model = null;
  let system = null;
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--provider' || arg === '-p') {
      provider = args[++i];
    } else if (arg === '--model' || arg === '-m') {
      model = args[++i];
    } else if (arg === '--system' || arg === '-s') {
      system = args[++i];
    } else {
      positional.push(arg);
    }
  }

  let prompt = positional.join(' ');

  if (!provider) {
    console.error('No AI provider configured.\nSet OPENAI_API_KEY, ANTHROPIC_API_KEY, etc. or run: ai init');
    process.exit(1);
  }

  if (!model) {
    model = getDefaultModel(provider);
  }

  if (!prompt || prompt.trim() === '') {
    prompt = 'process this input';
  }

  const response = await callProvider(provider, prompt, model, system);
  console.log(response);
}
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { createInterface } from 'readline';

const CONFIG_DIR = join(homedir(), '.config', 'ai');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

const ENV_MAP = {
  openai:    ['OPENAI_API_KEY'],
  anthropic: ['ANTHROPIC_API_KEY'],
  deepseek:  ['DEEPSEEK_API_KEY'],
  google:    ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  openrouter:['OPENROUTER_API_KEY'],
};

const PROVIDER_INFO = {
  openai:    { name: 'OpenAI',     defaultModel: 'gpt-4o',         url: 'https://api.openai.com/v1/chat/completions' },
  anthropic: { name: 'Anthropic',  defaultModel: 'claude-sonnet-4-20250514', url: 'https://api.anthropic.com/v1/messages' },
  deepseek:  { name: 'DeepSeek',   defaultModel: 'deepseek-chat',  url: 'https://api.deepseek.com/chat/completions' },
  google:    { name: 'Gemini',     defaultModel: 'gemini-2.0-flash', url: 'https://generativelanguage.googleapis.com/v1beta/models/' },
  openrouter:{ name: 'OpenRouter', defaultModel: 'openai/gpt-4o',  url: 'https://openrouter.ai/api/v1/chat/completions' },
};

export function getEnvKey(provider) {
  const vars = ENV_MAP[provider];
  if (!vars) return null;
  for (const v of vars) {
    if (process.env[v]) return { key: process.env[v], varName: v };
  }
  return null;
}

export function getConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch { return {}; }
}

export function saveConfig(config) {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function initWizard() {
  console.log('\n  ⚡ ai — setup wizard\n');

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((r) => rl.question(`  ${q}: `, r));

  console.log('  AI providers available (set env vars or enter keys here):\n');

  for (const [id, info] of Object.entries(PROVIDER_INFO)) {
    const existing = getEnvKey(id);
    if (existing) {
      console.log(`  ✓ ${info.name} — detected via ${existing.varName}`);
      continue;
    }
    const key = await ask(`  ${info.name} API key (or leave blank to skip)`);
    if (key) {
      const varName = ENV_MAP[id][0];
      process.env[varName] = key;
      console.log(`  ✓ ${info.name} configured\n`);
    } else {
      console.log(`  ○ ${info.name} skipped\n`);
    }
  }

  const defaultProvider = await ask('  Default provider [openai/anthropic/deepseek/google/ollama]');
  const defaultModel = await ask('  Default model (leave blank for provider default)');

  const config = getConfig();
  if (defaultProvider) config.defaultProvider = defaultProvider;
  if (defaultModel) config.defaultModel = defaultModel;
  saveConfig(config);

  rl.close();
  console.log('\n  ✅ Setup complete! Try: ai "hello world"\n');
}

export function getActiveProviders() {
  const active = [];
  for (const id of Object.keys(PROVIDER_INFO)) {
    if (getEnvKey(id)) active.push(id);
  }
  return active;
}

export function getDefaultProvider() {
  const config = getConfig();
  const active = getActiveProviders();

  if (config.defaultProvider && active.includes(config.defaultProvider)) {
    return config.defaultProvider;
  }

  const priority = ['openai', 'anthropic', 'deepseek', 'openrouter', 'google'];
  for (const p of priority) {
    if (active.includes(p)) return p;
  }

  return active[0] || null;
}

export function getProviderInfo(provider) {
  return PROVIDER_INFO[provider];
}

export function getDefaultModel(provider) {
  const config = getConfig();
  if (config.defaultModel) return config.defaultModel;
  const info = PROVIDER_INFO[provider];
  return info ? info.defaultModel : 'gpt-4o';
}
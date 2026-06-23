import { getEnvKey, getProviderInfo } from './config.js';

async function callOpenAI(prompt, model, system) {
  const { key } = getEnvKey('openai');
  const body = {
    model, messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: prompt }
    ]
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(`OpenAI: ${data.error.message}`);
  return data.choices[0].message.content;
}

async function callAnthropic(prompt, model, system) {
  const { key } = getEnvKey('anthropic');
  const body = {
    model, max_tokens: 4096,
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content: prompt }]
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(`Anthropic: ${data.error.message}`);
  return data.content[0].text;
}

async function callDeepSeek(prompt, model, system) {
  const { key } = getEnvKey('deepseek');
  const body = {
    model, messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: prompt }
    ]
  };
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(`DeepSeek: ${data.error.message}`);
  return data.choices[0].message.content;
}

async function callGoogle(prompt, model, system) {
  const { key } = getEnvKey('google');
  const body = {
    contents: [{ parts: [{ text: `${system ? system + '\n' : ''}${prompt}` }] }]
  };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(`Gemini: ${data.error.message}`);
  return data.candidates[0].content.parts[0].text;
}

async function callOpenRouter(prompt, model, system) {
  const { key } = getEnvKey('openrouter');
  const body = {
    model, messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: prompt }
    ]
  };
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(`OpenRouter: ${data.error.message}`);
  return data.choices[0].message.content;
}

async function callOllama(prompt, model) {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const body = { model: model || 'llama3.2', prompt, stream: false };
  const res = await fetch(`${host}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(`Ollama: ${data.error}`);
  return data.response;
}

const PROVIDER_CALLS = {
  openai:    callOpenAI,
  anthropic: callAnthropic,
  deepseek:  callDeepSeek,
  google:    callGoogle,
  openrouter:callOpenRouter,
  ollama:    callOllama,
};

export function callProvider(provider, prompt, model, system) {
  const fn = PROVIDER_CALLS[provider];
  if (!fn) throw new Error(`Unknown provider: ${provider}`);
  return fn(prompt, model, system);
}
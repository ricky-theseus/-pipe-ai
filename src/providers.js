import { getEnvKey } from './config.js';

function write(chunk) {
  process.stdout.write(chunk);
}

// --- OpenAI / DeepSeek (same SSE format) ---
async function* streamOpenAI(prompt, model, system) {
  const { key } = getEnvKey('openai');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, stream: true,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`OpenAI: ${err.error?.message || res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) yield content;
        } catch { /* partial chunk */ }
      }
    }
  }
}

// --- Anthropic streaming ---
async function* streamAnthropic(prompt, model, system) {
  const { key } = getEnvKey('anthropic');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, max_tokens: 4096, stream: true,
      ...(system ? { system } : {}),
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Anthropic: ${err.error?.message || res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            yield parsed.delta.text;
          }
        } catch { /* partial */ }
      }
    }
  }
}

// --- DeepSeek (same SSE format as OpenAI) ---
async function* streamDeepSeek(prompt, model, system) {
  const { key } = getEnvKey('deepseek');
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, stream: true,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`DeepSeek: ${err.error?.message || res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) yield content;
        } catch { /* partial */ }
      }
    }
  }
}

// --- Ollama streaming ---
async function* streamOllama(prompt, model) {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const res = await fetch(`${host}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: model || 'llama3.2', prompt, stream: true })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Ollama: ${err.error || res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.response) yield parsed.response;
        if (parsed.done) return;
      } catch { /* partial */ }
    }
  }
}

const STREAM_PROVIDERS = {
  openai:    streamOpenAI,
  anthropic: streamAnthropic,
  deepseek:  streamDeepSeek,
  ollama:    streamOllama,
};

// Non-streaming fallbacks for providers that don't support streaming
async function callNonStreaming(provider, prompt, model, system) {
  const { key } = getEnvKey(provider);
  let url, headers, body;

  if (provider === 'google') {
    const info = getEnvKey('google');
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    headers = { 'Content-Type': 'application/json' };
    body = { contents: [{ parts: [{ text: `${system ? system + '\n' : ''}${prompt}` }] }] };
  } else if (provider === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers = { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' };
    body = { model, messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: prompt }
    ]};
  } else {
    throw new Error(`Unknown non-streaming provider: ${provider}`);
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (data.error) throw new Error(`${provider}: ${data.error.message || JSON.stringify(data.error)}`);

  if (provider === 'google') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  return data.choices?.[0]?.message?.content || '';
}

export async function streamResponse(provider, prompt, model, system) {
  const streamFn = STREAM_PROVIDERS[provider];
  if (streamFn) {
    for await (const chunk of streamFn(prompt, model, system)) {
      write(chunk);
    }
    write('\n');
  } else {
    const text = await callNonStreaming(provider, prompt, model, system);
    write(text + '\n');
  }
}
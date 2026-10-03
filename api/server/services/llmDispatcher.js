/**
 * KAIROS LLM Dispatcher (God Pool Multi-Provider v2)
 * ─────────────────────────────────────────────────────────────────────────────
 * Proxy interno de inferência resiliente com Round-Robin e Failover Automático.
 * Suporta múltiplas chaves por provedor (separadas por vírgula ou individuais).
 * Se um provider retornar 401, 429 ou 5xx/timeout, rotaciona instantaneamente.
 *
 * Suporta: Groq (Multi-Key), Google Gemini (Multi-Key), SambaNova, OpenRouter.
 */

const axios = require('axios');
const { logger } = require('@librechat/data-schemas');

/**
 * Monta a lista completa de provedores a partir das variáveis de ambiente
 */
function getActiveProviders() {
  const providers = [];

  // ── 1. GROQ POOL (Multi-Key Round-Robin) ──
  // Aceita GROQ_API_KEYS (vírgula) ou GROQ_API_KEY única
  const rawGroq = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
  const groqKeys = rawGroq.split(',').map(k => k.trim()).filter(Boolean);
  const groqModel = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

  groqKeys.forEach((key, idx) => {
    providers.push({
      id: `groq-${idx + 1}`,
      name: `Groq Cloud (#${idx + 1})`,
      type: 'openai-compatible',
      baseURL: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: key,
      model: groqModel,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeoutMs: 15000,
    });
  });

  // ── 2. GOOGLE GEMINI POOL (Multi-Key) ──
  const rawGemini = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const geminiKeys = rawGemini.split(',').map(k => k.trim()).filter(Boolean);
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-flash-latest';

  geminiKeys.forEach((key, idx) => {
    providers.push({
      id: `gemini-${idx + 1}`,
      name: `Google Gemini (#${idx + 1})`,
      type: 'gemini-native',
      baseURL: `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${key}`,
      apiKey: key,
      model: geminiModel,
      headers: {
        'Content-Type': 'application/json',
      },
      timeoutMs: 20000,
    });
  });

  // ── 3. SAMBANOVA POOL ──
  const rawSamba = process.env.SAMBANOVA_API_KEYS || process.env.SAMBANOVA_API_KEY || '';
  const sambaKeys = rawSamba.split(',').map(k => k.trim()).filter(Boolean);
  const sambaModel = process.env.SAMBANOVA_MODEL || 'Meta-Llama-3.3-70B-Instruct';

  sambaKeys.forEach((key, idx) => {
    providers.push({
      id: `sambanova-${idx + 1}`,
      name: `SambaNova (#${idx + 1})`,
      type: 'openai-compatible',
      baseURL: 'https://api.sambanova.ai/v1/chat/completions',
      apiKey: key,
      model: sambaModel,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeoutMs: 20000,
    });
  });

  // ── 4. OPENROUTER POOL (Fallback) ──
  const rawOr = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '';
  const orKeys = rawOr.split(',').map(k => k.trim()).filter(Boolean);
  const orModel = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';

  orKeys.forEach((key, idx) => {
    providers.push({
      id: `openrouter-${idx + 1}`,
      name: `OpenRouter (#${idx + 1})`,
      type: 'openai-compatible',
      baseURL: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: key,
      model: orModel,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aida.experiasolutions.com.br',
        'X-Title': 'AIDA Imersão',
      },
      timeoutMs: 20000,
    });
  });

  return providers;
}

let currentProviderIndex = 0;

/**
 * Converte mensagens para o formato nativo do Google Gemini
 */
function convertMessagesToGemini(messages) {
  const contents = [];
  let systemInstruction = null;

  for (const m of messages) {
    if (m.role === 'system') {
      systemInstruction = { parts: [{ text: m.content }] };
    } else {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      });
    }
  }

  return { contents, systemInstruction };
}

/**
 * Executa uma inferência com failover automático entre os provedores ativos
 */
async function dispatchChatCompletion({ messages, temperature = 0.7, maxTokens = 250 }) {
  const providers = getActiveProviders();

  if (providers.length === 0) {
    throw new Error('[LLM Dispatcher] Nenhum provedor de inferência configurado com chave de API.');
  }

  const errors = [];
  const totalProviders = providers.length;

  for (let attempt = 0; attempt < totalProviders; attempt++) {
    const providerIdx = (currentProviderIndex + attempt) % totalProviders;
    const provider = providers[providerIdx];
    const startTime = Date.now();

    try {
      logger.info(`[LLM Dispatcher] [${attempt + 1}/${totalProviders}] Tentando ${provider.name} (${provider.model})...`);

      let reply = '';

      if (provider.type === 'gemini-native') {
        const { contents, systemInstruction } = convertMessagesToGemini(messages);
        const payload = {
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        };
        if (systemInstruction) {
          payload.systemInstruction = systemInstruction;
        }

        const response = await axios.post(provider.baseURL, payload, {
          headers: provider.headers,
          timeout: provider.timeoutMs,
        });

        reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      } else {
        // OpenAI-compatible (Groq, SambaNova, OpenRouter)
        const response = await axios.post(
          provider.baseURL,
          {
            model: provider.model,
            messages,
            temperature,
            max_tokens: maxTokens,
          },
          {
            headers: provider.headers,
            timeout: provider.timeoutMs,
          }
        );

        reply = response.data?.choices?.[0]?.message?.content;
      }

      if (!reply || !reply.trim()) {
        throw new Error('Provedor retornou resposta vazia.');
      }

      const durationMs = Date.now() - startTime;
      logger.info(`[LLM Dispatcher] Sucesso via ${provider.name} em ${durationMs}ms`);

      // Avança o cursor para a próxima requisição rodar no próximo nó
      currentProviderIndex = (providerIdx + 1) % totalProviders;

      return {
        reply: reply.trim(),
        provider: provider.name,
        model: provider.model,
        durationMs,
      };
    } catch (err) {
      const statusCode = err.response?.status;
      const errMsg = err.response?.data?.error?.message || err.message;
      const durationMs = Date.now() - startTime;

      logger.warn(`[LLM Dispatcher] Falha no ${provider.name} (${statusCode || 'ERR'} em ${durationMs}ms): ${errMsg}. Failover...`);

      errors.push({
        provider: provider.name,
        status: statusCode,
        error: errMsg,
      });
    }
  }

  logger.error('[LLM Dispatcher] Todos os provedores falharam!', errors);
  throw new Error(`[LLM Dispatcher] Todos os ${totalProviders} provedores falharam: ${errors.map(e => `${e.provider} (${e.status})`).join(', ')}`);
}

module.exports = {
  dispatchChatCompletion,
  getActiveProviders,
};

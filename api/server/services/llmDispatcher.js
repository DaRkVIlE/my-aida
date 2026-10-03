/**
 * KAIROS LLM Dispatcher (God Pool Multi-Provider)
 * ─────────────────────────────────────────────────────────────────────────────
 * Proxy interno de inferência resiliente com Round-Robin e Failover Automático.
 * Se um provider retornar 401 (chave inválida), 429 (rate limit) ou 5xx/timeout,
 * o dispatcher redireciona a requisição instantaneamente para o próximo da fila.
 *
 * Suporta: Groq, Google AI Studio (Gemini), SambaNova, OpenRouter, Cerebras.
 */

const axios = require('axios');
const { logger } = require('@librechat/data-schemas');

/**
 * Retorna a lista dinâmica de provedores baseada nas chaves configuradas nas envs
 */
function getActiveProviders() {
  const providers = [];

  // 1. Groq (Ultra-baixa latência)
  if (process.env.GROQ_API_KEY) {
    providers.push({
      id: 'groq',
      name: 'Groq Cloud',
      baseURL: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeoutMs: 15000,
    });
  }

  // 2. Google AI Studio (Gemini 2.5 Flash — altíssima inteligência e cota generosa)
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      id: 'google',
      name: 'Google AI Studio (Gemini)',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeoutMs: 20000,
    });
  }

  // 3. SambaNova (Llama 3.3 70B em chips RDU)
  if (process.env.SAMBANOVA_API_KEY) {
    providers.push({
      id: 'sambanova',
      name: 'SambaNova Cloud',
      baseURL: 'https://api.sambanova.ai/v1/chat/completions',
      apiKey: process.env.SAMBANOVA_API_KEY,
      model: process.env.SAMBANOVA_MODEL || 'Meta-Llama-3.3-70B-Instruct',
      headers: {
        'Authorization': `Bearer ${process.env.SAMBANOVA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeoutMs: 20000,
    });
  }

  // 4. OpenRouter (Fallback gratuito)
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      id: 'openrouter',
      name: 'OpenRouter Free Pool',
      baseURL: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aida.experiasolutions.com.br',
        'X-Title': 'AIDA Imersão',
      },
      timeoutMs: 20000,
    });
  }

  return providers;
}

let currentProviderIndex = 0;

/**
 * Executa uma inferência com failover automático entre os provedores ativos
 * @param {Object} options
 * @param {Array} options.messages - Lista de mensagens [{role, content}]
 * @param {number} [options.temperature=0.7]
 * @param {number} [options.maxTokens=800]
 * @returns {Promise<{reply: string, provider: string, model: string, durationMs: number}>}
 */
async function dispatchChatCompletion({ messages, temperature = 0.7, maxTokens = 800 }) {
  const providers = getActiveProviders();

  if (providers.length === 0) {
    throw new Error('[LLM Dispatcher] Nenhum provedor de inferência configurado com chave de API.');
  }

  const errors = [];
  const totalProviders = providers.length;

  // Tenta todos os provedores em sequência a partir do índice atual
  for (let attempt = 0; attempt < totalProviders; attempt++) {
    const providerIdx = (currentProviderIndex + attempt) % totalProviders;
    const provider = providers[providerIdx];
    const startTime = Date.now();

    try {
      logger.info(`[LLM Dispatcher] Tentando inferência via ${provider.name} (model: ${provider.model})...`);

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

      const reply = response.data?.choices?.[0]?.message?.content;
      if (!reply) {
        throw new Error('Resposta vazia da API do provedor.');
      }

      const durationMs = Date.now() - startTime;
      logger.info(`[LLM Dispatcher] Sucesso via ${provider.name} em ${durationMs}ms`);

      // Avança o round-robin suavemente para a próxima requisição
      currentProviderIndex = (providerIdx + 1) % totalProviders;

      return {
        reply,
        provider: provider.name,
        model: provider.model,
        durationMs,
      };
    } catch (err) {
      const statusCode = err.response?.status;
      const errMsg = err.response?.data?.error?.message || err.message;
      const durationMs = Date.now() - startTime;

      logger.warn(`[LLM Dispatcher] Falha no ${provider.name} (${statusCode || 'TIMEOUT'} em ${durationMs}ms): ${errMsg}. Acionando failover...`);

      errors.push({
        provider: provider.name,
        status: statusCode,
        error: errMsg,
      });

      // Continua para o próximo provedor na lista
    }
  }

  // Se todos os provedores falharem
  logger.error('[LLM Dispatcher] Todos os provedores do pool falharam!', errors);
  throw new Error(`[LLM Dispatcher] Todos os ${totalProviders} provedores falharam: ${errors.map(e => `${e.provider} (${e.status})`).join(', ')}`);
}

module.exports = {
  dispatchChatCompletion,
  getActiveProviders,
};

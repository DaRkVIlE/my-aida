/**
 * aidaTutor.js
 * Rota dedicada ao Meta Agente AIDA — Tutora & Mentora Mestra do My MANA Hub
 * 
 * Endpoints:
 * - POST /api/mana/tutor/chat: Chat de tutoria com a AIDA (student-facing)
 * - GET  /api/mana/tutor/recommendation/:userId: Recomendação dinâmica de portal baseada em telemetria
 */

const express = require('express');
const axios = require('axios');
const Gamification = require('~/models/Gamification');
const { STUDENT_TUTOR_PROMPT } = require('../services/aidaPedagogicalPrompts');

const router = express.Router();

/**
 * POST /api/mana/tutor/chat
 * Permite ao aluno conversar com a AIDA sobre metodologia, dicas e melhores práticas.
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória.' });
    }

    // Puxa perfil do aluno se fornecido
    let studentContext = '';
    if (userId) {
      const stats = await Gamification.findOne({ user: userId }).lean();
      if (stats) {
        studentContext = `\n[CONTEXTO DO ALUNO]: Rank atual: ${stats.playerRank || 'E'}, Nível: ${stats.nivelDiagnosticado || 'P1'}, XP: ${stats.currentXp || 0}, Streak: ${stats.streakDays || 0} dias, Módulos Conquistados: ${(stats.conqueredModules || []).join(', ') || 'Nenhum'}.`;
      }
    }

    const systemMessage = {
      role: 'system',
      content: STUDENT_TUTOR_PROMPT + studentContext,
    };

    const messages = [
      systemMessage,
      ...history.slice(-6).map((h) => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text || h.content || '',
      })),
      { role: 'user', content: message },
    ];

    // Chamada ao qwen3.8-27b via Groq (modelo disponível nessa conta)
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    const apiUrl = process.env.GROQ_API_KEY 
      ? 'https://api.groq.com/openai/v1/chat/completions' 
      : 'https://api.openai.com/v1/chat/completions';
    const model = process.env.GROQ_API_KEY 
      ? 'qwen/qwen3.8-27b'
      : 'gpt-4o-mini';

    if (!apiKey) {
      // Fallback gracioso local caso a key não esteja injetada em dev
      return res.json({
        reply: `Olá! Eu sou a AIDA, sua tutora no método MANA! 🌟
Lembre-se da nossa regra de ouro: você não estuda para falar, você fala para aprender.
Como posso te ajudar hoje a navegar pelos 5 Portais da Montanha B2?`,
      });
    }

    const response = await axios.post(
      apiUrl,
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 250,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 20000,
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content || 'Continue em frente na sua jornada de fluência!';
    return res.json({ reply });
  } catch (error) {
    console.error('[AIDA Tutor] Erro na resposta da tutora:', error?.response?.data || error.message);
    return res.status(500).json({
      error: 'AIDA encontrou uma oscilação temporária na conexão pedagógica.',
      fallbackReply: 'Estou aqui com você! Lembre-se: foque em produzir sem medo de errar.',
    });
  }
});

/**
 * GET /api/mana/tutor/recommendation/:userId
 * Retorna uma orientação proativa para a tela inicial do Hub.
 */
router.get('/recommendation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await Gamification.findOne({ user: userId }).lean();

    if (!stats) {
      return res.json({
        portalRecomendado: 'Portal 1: O Descongelamento',
        guardiao: 'Jordan 🎬',
        acao: 'Faça sua 1ª sessão de aquecimento de mandíbula hoje para quebrar o medo de errar!',
        linkModel: 'jordan',
      });
    }

    const rank = stats.playerRank || 'E';
    let recomendacao = {
      portalRecomendado: 'Portal 1: O Descongelamento',
      guardiao: 'Jordan 🎬',
      acao: 'Pratique frases curtas de 4 a 8 palavras com ancoragem visual.',
      linkModel: 'jordan',
    };

    if (rank === 'D') {
      recomendacao = {
        portalRecomendado: 'Portal 2: O Motor do BICS',
        guardiao: 'Miles ✈️',
        acao: 'Simule uma conversa de aeroporto e resolução de perrengues cotidianos.',
        linkModel: 'miles',
      };
    } else if (rank === 'C') {
      recomendacao = {
        portalRecomendado: 'Portal 3: A Tração Conversacional',
        guardiao: 'Zack 💻',
        acao: 'Foque em storytelling sem pausas e debate informal com agilidade.',
        linkModel: 'zack',
      };
    } else if (rank === 'B' || rank === 'A') {
      recomendacao = {
        portalRecomendado: 'Portal 4: A Fronteira Executiva',
        guardiao: 'Alexandra 👔',
        acao: 'Apresente uma ideia e defenda prazos em ambiente corporativo simulado.',
        linkModel: 'alexandra',
      };
    } else if (rank === 'S') {
      recomendacao = {
        portalRecomendado: 'Portal 5: O Trono da Soberania',
        guardiao: 'Prof. Hayes 📚',
        acao: 'Lapide ironia, nuances retóricas e humor culto britânico/americano.',
        linkModel: 'hayes',
      };
    }

    return res.json(recomendacao);
  } catch (error) {
    console.error('[AIDA Tutor] Erro na recomendação:', error.message);
    return res.status(500).json({ error: 'Erro ao gerar recomendação.' });
  }
});

module.exports = router;

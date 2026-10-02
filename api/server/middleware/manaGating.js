const Gamification = require('~/models/Gamification');

/**
 * Middleware MANA Gating — AIDA MANA 3.0
 * ------------------------------------------
 * Verifica o saldo de MANA antes de permitir o envio de uma mensagem.
 *
 * Regras:
 * - Usuários `tier: 'pro'` (Turma Alpha Gabe's English): MANA ilimitado. Passam sempre.
 * - Usuários `tier: 'free'` (visitantes): bloqueados quando currentMana <= 0.
 *   Retorna HTTP 402 com payload estruturado para o HUD exibir o modal de fechamento.
 *
 * O bloqueio é amigável: inclui o link do WhatsApp do Gabe para que o aluno
 * possa entrar na Turma Alpha direto pelo chat.
 */
async function manaGating(req, res, next) {
  const userId = req?.user?.id;
  if (!userId) return next();

  try {
    const stats = await Gamification.findOne({ user: userId }).lean();

    // Sem registro de gamificação ainda → é o primeiro turno, libera e deixa criar
    if (!stats) return next();

    // Usuários Pro: MANA ilimitado — passa direto sem gasto
    if (stats.tier === 'pro') return next();

    // Recarga diária: se for um novo dia, considera MANA cheio
    let currentMana = typeof stats.currentMana === 'number' ? stats.currentMana : 100;
    const maxMana = stats.maxMana || 100;

    if (stats.lastActiveDate) {
      const now = new Date();
      const lastDate = new Date(stats.lastActiveDate);
      const isNewDay =
        now.getUTCFullYear() !== lastDate.getUTCFullYear() ||
        now.getUTCMonth() !== lastDate.getUTCMonth() ||
        now.getUTCDate() !== lastDate.getUTCDate();

      if (isNewDay) {
        // Novo dia: MANA recarregado — não bloquear
        return next();
      }
    }

    // Verificação de MANA esgotado
    if (currentMana <= 0) {
      const waNumber = process.env.GABE_WHATSAPP_NUMBER || '5511999999999';
      const waMessage = encodeURIComponent(
        'Oi Gabe! Meu MANA acabou na AIDA e quero saber como entrar na Turma Alpha para continuar meu inglês hoje! 💙'
      );
      const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

      return res.status(402).json({
        error: 'MANA_DEPLETED',
        code: 'MANA_DEPLETED',
        message:
          'Sua reserva de MANA zerou por hoje! 💙 Alunos da Turma Alpha têm MANA ilimitado e acesso a todos os 5 Portais.',
        currentMana: 0,
        maxMana,
        tier: stats.tier,
        refillAt: 'Meia-noite UTC (recarga automática diária)',
        upgradeLink: waLink,
        ctaText: '📲 Entrar na Turma Alpha com Gabe no WhatsApp',
      });
    }

    return next();
  } catch (err) {
    // Falha no middleware não deve bloquear o usuário — fail open
    console.error('[MANA GATING] Erro ao verificar MANA, liberando por segurança:', err?.message);
    return next();
  }
}

module.exports = manaGating;

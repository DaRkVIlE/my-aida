const Gamification = require('~/models/Gamification');

/**
 * Registra a atividade do jogador no chat e atualiza seu progresso no MANA 3.0
 * Execução fire-and-forget (não-bloqueante).
 */
async function recordTurnActivity(userId, messageText = '') {
  if (!userId) return;

  setImmediate(async () => {
    try {
      let stats = await Gamification.findOne({ user: userId });
      if (!stats) {
        stats = new Gamification({
          user: userId,
          totalXp: 0,
          currentXp: 0,
          playerRank: 'E',
          streakDays: 1,
          totalPureRuns: 0,
          lastActiveDate: new Date(),
        });
      }

      // 1. Detectar Pure Run
      // Se a mensagem do aluno não contém pedidos de socorro em português ou pedidos explícitos de tradução
      const textLower = (messageText || '').toLowerCase();
      const hintTriggers = ['traduza', 'traduzir', 'em portugues', 'em português', 'o que significa', 'como fala em ingles', 'como fala em inglês', 'me ajuda'];
      const usedHint = hintTriggers.some(trigger => textLower.includes(trigger));
      const isPureRun = !usedHint && textLower.trim().length > 3;

      // 2. Cálculo de XP do turno
      // Base: 15 XP por mensagem
      // Pure Run (+50% bônus): +10 XP = 25 XP
      const baseXp = 15;
      const turnXp = isPureRun ? Math.round(baseXp * 1.5) : baseXp;

      // 3. Atualizar XP
      stats.currentXp = (stats.currentXp || 0) + turnXp;
      stats.totalXp = (stats.totalXp || 0) + turnXp;
      stats.weeklyXp = (stats.weeklyXp || 0) + turnXp;

      if (isPureRun) {
        stats.totalPureRuns = (stats.totalPureRuns || 0) + 1;
      }

      // 4. Atualizar Streak diário
      const now = new Date();
      if (stats.lastActiveDate) {
        const lastDate = new Date(stats.lastActiveDate);
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          stats.streakDays = (stats.streakDays || 0) + 1;
        } else if (diffDays > 1) {
          stats.streakDays = 1; // quebrou o streak
        }
      } else {
        stats.streakDays = 1;
      }
      stats.lastActiveDate = now;

      // 5. Atualizar Rank se atingiu novo patamar
      const calculateRank = (xp) => {
        if (xp >= 25000) return 'S';
        if (xp >= 14000) return 'A';
        if (xp >= 7000) return 'B';
        if (xp >= 3000) return 'C';
        if (xp >= 1000) return 'D';
        return 'E';
      };
      stats.playerRank = calculateRank(stats.currentXp);
      stats.currentLevel = `Rank ${stats.playerRank}`;

      // 6. Registrar histórico
      if (!stats.history) stats.history = [];
      stats.history.push({
        xp: turnXp,
        pureRun: isPureRun,
        date: now,
      });

      // Manter histórico enxuto (últimas 50 entradas)
      if (stats.history.length > 50) {
        stats.history = stats.history.slice(-50);
      }

      await stats.save();
    } catch (err) {
      console.error('[MANA] Erro ao registrar progresso de turno:', err?.message);
    }
  });
}

module.exports = {
  recordTurnActivity,
};

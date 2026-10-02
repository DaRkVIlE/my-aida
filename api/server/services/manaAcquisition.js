const Gamification = require('~/models/Gamification');

/**
 * Registra a atividade do jogador no chat e atualiza seu progresso no MANA 3.0
 * Mecânicas estilo Duolingo: Consumo de MANA (vidas/energia), recarga diária,
 * bônus por Pure Run, streaks persistidos e avanço pelos 5 Portais de Fluência.
 * Execução fire-and-forget (não-bloqueante).
 */
async function recordTurnActivity(userId, messageText = '') {
  if (!userId) return;

  setImmediate(async () => {
    try {
      let stats = await Gamification.findOne({ user: userId });
      const now = new Date();

      if (!stats) {
        stats = new Gamification({
          user: userId,
          totalXp: 0,
          currentXp: 0,
          playerRank: 'E',
          streakDays: 1,
          totalPureRuns: 0,
          currentMana: 100,
          maxMana: 100,
          nivelDiagnosticado: 'P1',
          personaIdeal: 'Jordan',
          lastActiveDate: now,
        });
      }

      // 1. Recarga diária de MANA (se for um novo dia de treino)
      if (stats.lastActiveDate) {
        const lastDate = new Date(stats.lastActiveDate);
        const isNewDay =
          now.getUTCFullYear() !== lastDate.getUTCFullYear() ||
          now.getUTCMonth() !== lastDate.getUTCMonth() ||
          now.getUTCDate() !== lastDate.getUTCDate();

        if (isNewDay) {
          stats.currentMana = stats.maxMana || 100;
        }
      }

      // 2. Detectar Pure Run (Sem socorro em português, mensagem genuína em inglês)
      const textLower = (messageText || '').toLowerCase();
      const hintTriggers = [
        'traduza', 'traduzir', 'em portugues', 'em português',
        'o que significa', 'como fala em ingles', 'como fala em inglês',
        'me ajuda', 'não entendi', 'nao entendi'
      ];
      const usedHint = hintTriggers.some(trigger => textLower.includes(trigger));
      const isPureRun = !usedHint && textLower.trim().length > 3;

      // 3. Mecânica de MANA: Custo por turno & Recompensa de Pure Run
      // Custo base: -10 MANA
      let manaChange = -10;
      if (isPureRun) {
        // Pure Run reembolsa +5 MANA (gasto líquido de apenas 5 MANA)
        manaChange = -5;
        stats.totalPureRuns = (stats.totalPureRuns || 0) + 1;
      }

      const currentMana = typeof stats.currentMana === 'number' ? stats.currentMana : 100;
      stats.currentMana = Math.max(0, Math.min(stats.maxMana || 100, currentMana + manaChange));

      // 4. Cálculo de XP do turno
      // Base: 15 XP por mensagem
      // Pure Run (+50% bônus): +10 XP = 25 XP
      const baseXp = 15;
      const turnXp = isPureRun ? Math.round(baseXp * 1.5) : baseXp;

      stats.currentXp = (stats.currentXp || 0) + turnXp;
      stats.totalXp = (stats.totalXp || 0) + turnXp;
      stats.weeklyXp = (stats.weeklyXp || 0) + turnXp;

      // 5. Atualizar Streak diário
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

      // 6. Atualizar Rank e Portal de Fluência (Os 5 Portais)
      const calculateRankAndPortal = (xp) => {
        if (xp >= 25000) return { rank: 'S', level: 'Rank S — Portal 5: O Trono da Soberania' };
        if (xp >= 14000) return { rank: 'A', level: 'Rank A — Portal 5: O Trono da Soberania' };
        if (xp >= 7000) return { rank: 'B', level: 'Rank B — Portal 4: A Fronteira Executiva' };
        if (xp >= 3000) return { rank: 'C', level: 'Rank C — Portal 3: A Tração Conversacional' };
        if (xp >= 1000) return { rank: 'D', level: 'Rank D — Portal 2: O Motor do BICS' };
        return { rank: 'E', level: 'Rank E — Portal 1: O Descongelamento' };
      };

      const { rank, level } = calculateRankAndPortal(stats.currentXp);
      stats.playerRank = rank;
      stats.currentLevel = level;

      // 7. Registrar histórico enxuto
      if (!stats.history) stats.history = [];
      stats.history.push({
        xp: turnXp,
        pureRun: isPureRun,
        mana: stats.currentMana,
        date: now,
      });

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

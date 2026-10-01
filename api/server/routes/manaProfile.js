const express = require('express');
const Gamification = require('~/models/Gamification');
const { requireJwtAuth } = require('~/server/middleware/');

const router = express.Router();

// Helper para calcular rank com base no XP
const calculateRank = (xp) => {
  if (xp >= 25000) return 'S';
  if (xp >= 14000) return 'A';
  if (xp >= 7000) return 'B';
  if (xp >= 3000) return 'C';
  if (xp >= 1000) return 'D';
  return 'E';
};

/**
 * GET /api/mana/profile/:userId
 * Retorna o perfil MANA gamificado do jogador
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    let stats = await Gamification.findOne({ user: userId }).lean();

    if (!stats) {
      return res.json({
        userId,
        playerRank: 'E',
        currentXp: 0,
        streakDays: 0,
        totalPureRuns: 0,
        conqueredModules: [],
        currentMana: 100,
        maxMana: 100,
        nivelDiagnosticado: 'P1',
        personaIdeal: 'Jordan',
      });
    }

    const currentXp = stats.currentXp ?? stats.totalXp ?? 0;
    const playerRank = stats.playerRank || calculateRank(currentXp);

    res.json({
      userId,
      playerRank,
      currentXp,
      streakDays: stats.streakDays || 0,
      totalPureRuns: stats.totalPureRuns || 0,
      conqueredModules: stats.conqueredModules || [],
      currentMana: stats.currentMana ?? 100,
      maxMana: stats.maxMana ?? 100,
      nivelDiagnosticado: stats.nivelDiagnosticado || 'P1',
      personaIdeal: stats.personaIdeal || 'Jordan',
    });
  } catch (error) {
    console.error('[MANA] Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching MANA profile' });
  }
});

/**
 * GET /api/mana/leaderboard
 * Retorna os top 20 jogadores da turma
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await Gamification.find()
      .sort({ totalXp: -1, currentXp: -1 })
      .limit(20)
      .populate('user', 'name username email')
      .lean();

    const leaderboard = topUsers.map((stat, index) => {
      const xp = stat.currentXp ?? stat.totalXp ?? 0;
      return {
        rank: index + 1,
        name: stat.user?.name || stat.user?.username || `Jogador #${index + 1}`,
        playerRank: stat.playerRank || calculateRank(xp),
        xp,
        pureRuns: stat.totalPureRuns || 0,
        streakDays: stat.streakDays || 0,
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('[MANA] Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching MANA leaderboard' });
  }
});

/**
 * POST /api/mana/triage
 * Registra o resultado da triagem pré-chat realizada na Landing Page / Onboarding
 */
router.post('/triage', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nivelDiagnosticado, personaIdeal, painState } = req.body;

    let stats = await Gamification.findOne({ user: userId });
    if (!stats) {
      stats = new Gamification({
        user: userId,
        nivelDiagnosticado: nivelDiagnosticado || 'P1',
        personaIdeal: personaIdeal || 'Jordan',
        totalXp: 50, // Bônus de 50 XP por concluir a triagem
        currentXp: 50,
        playerRank: 'E',
      });
    } else {
      if (nivelDiagnosticado) stats.nivelDiagnosticado = nivelDiagnosticado;
      if (personaIdeal) stats.personaIdeal = personaIdeal;
      stats.currentXp = (stats.currentXp || 0) + 50;
      stats.totalXp = (stats.totalXp || 0) + 50;
    }

    await stats.save();
    res.json({ success: true, profile: stats });
  } catch (error) {
    console.error('[MANA] Error saving triage result:', error);
    res.status(500).json({ message: 'Error saving triage result' });
  }
});

module.exports = router;

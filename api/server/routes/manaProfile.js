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
        tier: 'free',
        totalManaSpent: 0,
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
      tier: stats.tier || 'free',
      totalManaSpent: stats.totalManaSpent || 0,
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

/**
 * Middleware para validar se a requisição tem permissão de Admin (Gabe)
 * Aceita: usuário com role 'ADMIN' OU header 'x-admin-key' válido
 */
const requireAdminOrKey = async (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedSecret = process.env.ADMIN_SECRET || process.env.JWT_SECRET || 'aida-admin-secret';

  if (adminKey && adminKey === expectedSecret) {
    return next();
  }

  // Se não foi pela chave, tenta via JWT autenticado
  requireJwtAuth(req, res, () => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'admin')) {
      return next();
    }
    return res.status(403).json({ error: 'Acesso negado. Apenas o administrador (Gabe) pode gerenciar alunos.' });
  });
};

/**
 * POST /api/mana/upgrade
 * Promove ou altera o tier de um aluno (ex: de 'free' para 'pro')
 * Body: { email?: string, userId?: string, tier?: 'pro' | 'free' }
 */
router.post('/upgrade', requireAdminOrKey, async (req, res) => {
  try {
    const { email, userId, tier = 'pro' } = req.body;
    if (!email && !userId) {
      return res.status(400).json({ error: 'É necessário informar email ou userId do aluno.' });
    }

    const User = require('mongoose').models.User;
    let targetUser = null;

    if (email && User) {
      targetUser = await User.findOne({ email: email.trim().toLowerCase() });
    } else if (userId && User) {
      targetUser = await User.findById(userId);
    }

    const targetUserId = targetUser ? targetUser._id : userId;
    if (!targetUserId) {
      return res.status(404).json({ error: `Aluno não encontrado para: ${email || userId}` });
    }

    let stats = await Gamification.findOne({ user: targetUserId });
    if (!stats) {
      stats = new Gamification({
        user: targetUserId,
        currentMana: 100,
        maxMana: 100,
        tier,
      });
    } else {
      stats.tier = tier;
      if (tier === 'pro') {
        stats.currentMana = stats.maxMana || 100;
        stats.manaLockedAt = null;
      }
    }

    await stats.save();

    res.json({
      success: true,
      message: `Aluno ${targetUser?.name || targetUser?.email || targetUserId} atualizado para [${tier.toUpperCase()}] com sucesso! 🚀`,
      student: {
        userId: targetUserId,
        email: targetUser?.email,
        name: targetUser?.name,
        tier: stats.tier,
        currentMana: stats.currentMana,
      },
    });
  } catch (error) {
    console.error('[MANA] Erro ao promover aluno:', error);
    res.status(500).json({ error: 'Erro ao processar upgrade de aluno.' });
  }
});

/**
 * GET /api/mana/students
 * Retorna a lista de alunos com status da jornada MANA 3.0, tier e progresso
 */
router.get('/students', requireAdminOrKey, async (req, res) => {
  try {
    const studentsStats = await Gamification.find()
      .populate('user', 'name username email role createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    const result = studentsStats.map((st) => ({
      userId: st.user?._id || st.user,
      name: st.user?.name || st.user?.username || 'Aluno',
      email: st.user?.email || 'N/A',
      tier: st.tier || 'free',
      playerRank: st.playerRank || 'E',
      currentXp: st.currentXp || 0,
      currentMana: st.tier === 'pro' ? '∞' : (st.currentMana ?? 100),
      streakDays: st.streakDays || 0,
      totalPureRuns: st.totalPureRuns || 0,
      lastActiveDate: st.lastActiveDate,
      joinedAt: st.user?.createdAt,
    }));

    res.json({
      total: result.length,
      proCount: result.filter((s) => s.tier === 'pro').length,
      freeCount: result.filter((s) => s.tier === 'free').length,
      students: result,
    });
  } catch (error) {
    console.error('[MANA] Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro ao listar alunos.' });
  }
});

module.exports = router;


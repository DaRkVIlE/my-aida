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
/**
 * POST /api/mana/triage
 * Registra ou calcula o resultado do Quiz de Nivelamento CEFR & Triagem MANA (P1 a P5).
 * Suporta modo duplo:
 *   - Anônimo (Visitante na Landing Page): Retorna diagnóstico, persona recomendada e dados do portal.
 *   - Autenticado (Aluno Logado com JWT): Persiste no MongoDB e credita 50 XP bônus imediatamente.
 */
router.post('/triage', async (req, res) => {
  try {
    const { nivelDiagnosticado, personaIdeal, answers, score, cefrLevel } = req.body;

    // Mapa oficial pedagógico MANA 3.0
    const PORTAL_META = {
      P1: {
        portalNumber: 1,
        portalName: 'O Descongelamento',
        cefrRange: 'A1 → A2',
        persona: 'Jordan',
        personaLabel: 'Jordan — Amigo de NY',
        personaDescription: 'Papo leve, séries, cultura pop e dia a dia sem regras chatas.',
        welcomeHook: 'E aí! Vi que você quer destravar sem pressão. Vamos bater um papo no automático!',
        unlockedAtStart: true,
      },
      P2: {
        portalNumber: 2,
        portalName: 'O Motor do BICS',
        cefrRange: 'A2 → B1',
        persona: 'Miles',
        personaLabel: 'Miles — Gamer & Tech',
        personaDescription: 'Games, Discord, tecnologia e gírias da internet.',
        welcomeHook: 'Fala dev! Bora trocar uma ideia sobre games, tech e cultura geek em inglês?',
        unlockedAtStart: true,
      },
      P3: {
        portalNumber: 3,
        portalName: 'A Tração Conversacional',
        cefrRange: 'B1 → B2',
        persona: 'Zack',
        personaLabel: 'Zack — Coach de Rotina',
        personaDescription: 'Fitness, produtividade, hábitos diários e energia alta.',
        welcomeHook: 'Bora manter a consistência! Me conta da sua rotina e vamos construir esse vocabulário ativo.',
        unlockedAtStart: true,
      },
      P4: {
        portalNumber: 4,
        portalName: 'A Fronteira Executiva',
        cefrRange: 'B2 Pleno',
        persona: 'Alexandra',
        personaLabel: 'Alexandra — Business & Carreira',
        personaDescription: 'Reuniões internacionais, apresentações, e-mails e negociação.',
        welcomeHook: 'Olá. Vamos afiar sua comunicação para o mercado corporativo internacional.',
        unlockedAtStart: true,
      },
      P5: {
        portalNumber: 5,
        portalName: 'O Trono da Soberania',
        cefrRange: 'C1 → C2',
        persona: 'Hayes',
        personaLabel: 'Prof. Hayes — Alta Expressão',
        personaDescription: 'Ideias complexas, visão de mundo, debate intelectual e elegância verbal.',
        welcomeHook: 'Saudações. É um prazer dialogar sobre grandes ideias e refinar sua maestria no idioma.',
        unlockedAtStart: true,
      },
    };

    // Determina o nível com fallback seguro para P1 (Jordan)
    const normalizedNivel = (nivelDiagnosticado || 'P1').toUpperCase();
    const portalData = PORTAL_META[normalizedNivel] || PORTAL_META.P1;
    const finalPersona = personaIdeal || portalData.persona;

    // Tenta autenticar via JWT se enviado no header Authorization: Bearer <token>
    let authenticatedUser = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        authenticatedUser = decoded;
      } catch (jwtErr) {
        // Token inválido ou expirado - processa como visitante sem derrubar a requisição
      }
    }

    // Se estiver autenticado, persiste no MongoDB
    if (authenticatedUser && authenticatedUser.id) {
      let stats = await Gamification.findOne({ user: authenticatedUser.id });
      if (!stats) {
        stats = new Gamification({
          user: authenticatedUser.id,
          nivelDiagnosticado: normalizedNivel,
          personaIdeal: finalPersona,
          totalXp: 50,
          currentXp: 50,
          playerRank: 'E',
          history: [{ xp: 50, date: new Date(), messageId: 'quiz_onboarding_bonus' }],
        });
      } else {
        stats.nivelDiagnosticado = normalizedNivel;
        stats.personaIdeal = finalPersona;
        // Bônus único de 50 XP
        stats.currentXp = (stats.currentXp || 0) + 50;
        stats.totalXp = (stats.totalXp || 0) + 50;
        stats.history.push({ xp: 50, date: new Date(), messageId: 'quiz_onboarding_bonus' });
      }
      await stats.save();

      return res.json({
        success: true,
        isGuest: false,
        nivelDiagnosticado: normalizedNivel,
        personaIdeal: finalPersona,
        portal: portalData,
        bonusXpGranted: 50,
        profile: stats,
      });
    }

    // Caso visitante (anônimo na Landing Page / Quiz)
    return res.json({
      success: true,
      isGuest: true,
      nivelDiagnosticado: normalizedNivel,
      personaIdeal: finalPersona,
      portal: portalData,
      bonusXpPending: 50,
      message: 'Diagnóstico concluído! Crie sua conta para resgatar seus 50 XP de bônus e entrar no Portal.',
    });
  } catch (error) {
    console.error('[MANA] Error processing triage:', error);
    res.status(500).json({ message: 'Error processing triage' });
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
  requireJwtAuth(req, res, async () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    let role = req.user.role;
    if (!role && req.user.id) {
      const User = require('mongoose').models.User;
      if (User) {
        const u = await User.findById(req.user.id).select('role').lean();
        role = u?.role;
      }
    }

    if (role === 'ADMIN' || role === 'admin') {
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
 * Retorna a lista de todos os alunos cadastrados com status da jornada MANA 3.0 e tier
 */
router.get('/students', requireAdminOrKey, async (req, res) => {
  try {
    const User = require('mongoose').models.User;
    let users = [];
    if (User) {
      users = await User.find().select('name username email role createdAt').sort({ createdAt: -1 }).lean();
    }

    const userIds = users.map((u) => u._id);
    const statsList = await Gamification.find({ user: { $in: userIds } }).lean();
    const statsMap = new Map();
    statsList.forEach((s) => statsMap.set(String(s.user), s));

    const result = users.map((u) => {
      const st = statsMap.get(String(u._id)) || {};
      const isPro = st.tier === 'pro';
      return {
        userId: u._id,
        name: u.name || u.username || 'Aluno',
        email: u.email || 'N/A',
        role: u.role || 'USER',
        tier: st.tier || 'free',
        playerRank: st.playerRank || 'E',
        currentXp: st.currentXp || 0,
        currentMana: isPro ? '∞' : (st.currentMana ?? 100),
        streakDays: st.streakDays || 0,
        totalPureRuns: st.totalPureRuns || 0,
        lastActiveDate: st.lastActiveDate || null,
        joinedAt: u.createdAt,
      };
    });

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

/**
 * GET /api/mana/mentor-handoff/:userId
 * Retorna o Dossiê Pedagógico sintetizado pelo Meta Agente AIDA para Gabriel
 * usar como pauta e condução cirúrgica na aula presencial.
 */
router.get('/mentor-handoff/:userId', requireAdminOrKey, async (req, res) => {
  try {
    const { userId } = req.params;
    const User = require('mongoose').models.User;
    
    let user = null;
    if (User) {
      user = await User.findById(userId).select('name username email role createdAt').lean();
    }
    
    const stats = await Gamification.findOne({ user: userId }).lean() || {};
    const rank = stats.playerRank || 'E';
    const xp = stats.currentXp || 0;
    const streak = stats.streakDays || 0;
    const pureRuns = stats.totalPureRuns || 0;
    const studentName = user?.name || user?.username || 'Aluno MANA';

    // Roteiro cirúrgico calibrado por Rank
    let bossRaidSugerida = "O Teste do Café em NY (60 segundos de pressão com Jordan)";
    let focoPronuncia = "Reduções coloquiais: gonna, wanna, gotta, whatchu";
    let chunksAlvo = ["Could I get a...", "Hold on a second", "I'm in a rush"];

    if (rank === 'D') {
      bossRaidSugerida = "O Interrogatório da Alfândega no JFK com Miles";
      focoPronuncia = "Linking sounds e entonação de perguntas diretas vs indiretas";
      chunksAlvo = ["Turns out that...", "My luggage didn't show up", "Is there any way to..."];
    } else if (rank === 'C') {
      bossRaidSugerida = "A Roda de Chopp no Bar com Zack e 2 nativos";
      focoPronuncia = "Storytelling sem pausas e conectores de contraste";
      chunksAlvo = ["Long story short...", "Fair enough, but...", "It suddenly hit me that..."];
    } else if (rank === 'B' || rank === 'A') {
      bossRaidSugerida = "A Reunião de Diretoria Global & Pitch com Alexandra";
      focoPronuncia = "Autoridade, pausas retóricas e diplomacia executiva";
      chunksAlvo = ["To play devil's advocate...", "Let's touch base on...", "Given the current constraints..."];
    } else if (rank === 'S') {
      bossRaidSugerida = "O Grande Simpósio da Soberania com Prof. Hayes";
      focoPronuncia = "Ironia, subtexto, humor britânico e precisão léxica nativa";
      chunksAlvo = ["Hardly an exaggeration", "To put it mildly", "A rather poignant reminder"];
    }

    const dossierMarkdown = `
# 🧠 Dossiê Pedagógico AIDA • Aula Presencial com Gabe
**Aluno:** ${studentName} | **Rank:** ${rank} | **XP:** ${xp} | **Ofensiva:** ${streak} dias 🔥 | **Pure Runs:** ${pureRuns} ⚡

---

### 1. 🎯 Diagnóstico Atual
- **Nível Identificado:** CEFR Reflexo baseado em ${xp} XP acumulados.
- **Portais Conquistados:** ${(stats.conqueredModules || []).join(', ') || 'Nenhum portal finalizado ainda (em onboarding)'}
- **Filtro Afetivo Estimado:** ${streak >= 3 ? '🟢 Baixo (aluno engajado e destravando)' : '🟡 Moderado (necessita reforço de confiança)'}

### 2. 💎 Chunks Nucleares para Ativação Hoje
${chunksAlvo.map(c => `- **"${c}"**`).join('\n')}

### 3. ⚔️ Pauta Cirúrgica para os 30-40 min com Gabe
1. **Aquecimento (5 min):** Conversa casual sem permissão de traduzir mentalmente.
2. **Simulação da Boss Raid (20 min):** **${bossRaidSugerida}**
3. **Ponto Cego de Pronúncia:** ${focoPronuncia}
4. **Fechamento (5 min):** Debriefing olho no olho, carimbo de aprovação do Portal e missão para a próxima semana!
`;

    res.json({
      userId,
      studentName,
      playerRank: rank,
      currentXp: xp,
      streakDays: streak,
      totalPureRuns: pureRuns,
      bossRaidSugerida,
      focoPronuncia,
      chunksAlvo,
      dossierMarkdown,
    });
  } catch (error) {
    console.error('[MANA] Erro ao gerar handoff do mentor:', error);
    res.status(500).json({ error: 'Erro ao gerar dossiê de handoff.' });
  }
});

module.exports = router;



/**
 * Cockpit do Aluno — AIDA MANA 3.0
 * Painel de progresso do aluno: XP, MANA, Streak, Rank e Portais.
 * Servido diretamente pelo Express como página HTML autônoma (<50ms).
 * Consome /api/mana/profile/:userId via fetch client-side (cookie de sessão).
 *
 * Rota: GET /cockpit  (e /painel como alias)
 */

function getCockpitHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AIDA — Cockpit do Aluno</title>
  <meta name="description" content="Seu painel de progresso MANA — XP, Rank, Streak e Portais de Aprendizado." />
  <link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            mana: { 50: '#ecfdf5', 400: '#34d399', 500: '#10b981', 600: '#059669' },
            portal: { purple: '#8b5cf6', blue: '#3b82f6', amber: '#f59e0b', red: '#ef4444', cyan: '#06b6d4' },
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #030712; color: #f3f4f6; font-family: system-ui, -apple-system, sans-serif; }
    .glass-card { background: rgba(17, 24, 39, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
    .glow-mana { box-shadow: 0 0 30px rgba(16, 185, 129, 0.2); }
    .glow-purple { box-shadow: 0 0 25px rgba(139, 92, 246, 0.2); }
    .rank-badge { font-size: 2.5rem; line-height: 1; filter: drop-shadow(0 0 12px currentColor); }
    .xp-bar-fill { transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .mana-bar-fill { transition: width 1.0s cubic-bezier(0.4, 0, 0.2, 1); }
    .portal-locked { opacity: 0.35; filter: grayscale(1); cursor: not-allowed; }
    .portal-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
    .portal-card:not(.portal-locked):hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(16, 185, 129, 0.25); }
    .streak-flame { animation: flicker 1.8s ease-in-out infinite alternate; }
    @keyframes flicker { from { filter: drop-shadow(0 0 4px #f59e0b); } to { filter: drop-shadow(0 0 14px #ef4444); } }
    .pulse-ring { animation: pulseRing 2s ease-out infinite; }
    @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }
    .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  </style>
</head>
<body class="min-h-screen">

  <!-- ═══ HEADER ═══ -->
  <header class="sticky top-0 z-50 glass-card border-b border-white/10">
    <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/assets/logo.svg" alt="AIDA" class="h-7 w-7" onerror="this.style.display='none'" />
        <span class="font-bold text-white text-lg tracking-tight">AIDA</span>
        <span class="text-gray-500 text-sm hidden sm:block">/ Cockpit do Aluno</span>
      </div>
      <div class="flex items-center gap-3">
        <a href="/" class="text-sm text-gray-400 hover:text-mana-400 transition-colors">← Voltar ao Chat</a>
        <span id="header-rank" class="text-sm font-bold text-mana-400 hidden"></span>
      </div>
    </div>
  </header>

  <!-- ═══ MAIN ═══ -->
  <main class="max-w-4xl mx-auto px-4 py-8 space-y-6">

    <!-- ══ LOADING STATE ══ -->
    <div id="loading-state" class="space-y-4">
      <div class="glass-card rounded-2xl p-6 skeleton h-36"></div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="glass-card rounded-2xl p-5 skeleton h-28"></div>
        <div class="glass-card rounded-2xl p-5 skeleton h-28"></div>
        <div class="glass-card rounded-2xl p-5 skeleton h-28"></div>
      </div>
    </div>

    <!-- ══ ERROR STATE ══ -->
    <div id="error-state" class="hidden glass-card rounded-2xl p-8 text-center">
      <div class="text-5xl mb-4">🔐</div>
      <h2 class="text-xl font-bold text-white mb-2">Sessão não encontrada</h2>
      <p class="text-gray-400 mb-6">Faça login no chat da AIDA para visualizar seu Cockpit.</p>
      <a href="/" class="inline-block bg-mana-500 hover:bg-mana-600 text-black font-bold px-6 py-3 rounded-xl transition-colors">
        Ir para o Chat →
      </a>
    </div>

    <!-- ══ CONTENT (hidden until loaded) ══ -->
    <div id="cockpit-content" class="hidden space-y-6">

      <!-- ── HERO: Perfil do Aluno ── -->
      <div class="glass-card rounded-2xl p-6 glow-mana relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-mana-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div class="flex items-start gap-5">
          <div class="relative flex-shrink-0">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-mana-400 to-mana-600 flex items-center justify-center text-2xl font-black text-black" id="avatar-initial">?</div>
            <div class="absolute -bottom-1 -right-1">
              <div class="rank-badge" id="hero-rank-emoji">⚡</div>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-bold text-white truncate" id="hero-name">Carregando...</h1>
              <span class="px-2 py-0.5 rounded-full text-xs font-bold" id="hero-tier-badge">FREE</span>
            </div>
            <p class="text-gray-400 text-sm mt-0.5" id="hero-persona">Persona ideal: —</p>
            <p class="text-gray-500 text-xs mt-1" id="hero-nivel">Nível diagnóstico: —</p>
            <!-- XP Bar -->
            <div class="mt-3">
              <div class="flex justify-between text-xs text-gray-400 mb-1">
                <span>XP Acumulado</span>
                <span id="xp-label">0 XP</span>
              </div>
              <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div id="xp-bar" class="h-full bg-gradient-to-r from-mana-400 to-mana-600 rounded-full xp-bar-fill" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── STATS ROW ── -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- MANA -->
        <div class="glass-card rounded-2xl p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold text-gray-300">⚡ Energia MANA</span>
            <span class="text-xs text-mana-400 font-mono" id="mana-label">— / —</span>
          </div>
          <div class="h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <div id="mana-bar" class="h-full bg-gradient-to-r from-mana-500 to-mana-400 rounded-full mana-bar-fill" style="width: 0%"></div>
          </div>
          <p class="text-xs text-gray-500 mt-2" id="mana-hint">Renova a cada sessão</p>
        </div>
        <!-- STREAK -->
        <div class="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div class="text-4xl streak-flame">🔥</div>
          <div>
            <div class="text-2xl font-black text-white" id="streak-count">0</div>
            <div class="text-xs text-gray-400">Dias seguidos</div>
            <div class="text-xs text-amber-400 mt-0.5" id="streak-status">Mantenha o ritmo!</div>
          </div>
        </div>
        <!-- RANK -->
        <div class="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div class="relative">
            <div class="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center">
              <span class="text-xl font-black text-purple-300" id="rank-letter">E</span>
            </div>
            <div class="pulse-ring absolute inset-0 rounded-full border-2 border-purple-400/40"></div>
          </div>
          <div>
            <div class="text-sm font-bold text-white" id="rank-label">Rank E — Iniciante</div>
            <div class="text-xs text-gray-400 mt-0.5" id="rank-xp-next">Próximo rank: —</div>
          </div>
        </div>
      </div>

      <!-- ── 5 PORTAIS ── -->
      <div>
        <h2 class="text-base font-bold text-gray-300 mb-3">🌀 Portais de Imersão</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="portais-grid">
          <!-- Rendered by JS -->
        </div>
      </div>

      <!-- ── LEADERBOARD ── -->
      <div class="glass-card rounded-2xl p-5">
        <h2 class="text-base font-bold text-gray-300 mb-4">🏆 Ranking dos Alunos</h2>
        <div id="leaderboard-list" class="space-y-2">
          <div class="skeleton rounded-xl h-10"></div>
          <div class="skeleton rounded-xl h-10"></div>
          <div class="skeleton rounded-xl h-10"></div>
        </div>
      </div>

      <!-- ── CTA: Ir para o Chat ── -->
      <div class="text-center py-4">
        <a href="/" class="inline-flex items-center gap-2 bg-mana-500 hover:bg-mana-600 active:bg-mana-700 text-black font-bold px-8 py-3 rounded-xl transition-colors text-sm shadow-lg">
          💬 Continuar praticando no Chat →
        </a>
        <p class="text-xs text-gray-600 mt-3">AIDA — Imersão Ativa em Inglês com IA</p>
      </div>

    </div><!-- /cockpit-content -->
  </main>

  <script>
  (() => {
    // ═══ CONFIGURAÇÃO DE RANKS ═══
    const RANKS = {
      E: { emoji: '⚪', label: 'Rank E — Iniciante',    color: '#9ca3af', next: 'D', xpNext: 500   },
      D: { emoji: '🟢', label: 'Rank D — Dedicado',    color: '#34d399', next: 'C', xpNext: 1500  },
      C: { emoji: '🔵', label: 'Rank C — Consistente', color: '#3b82f6', next: 'B', xpNext: 4000  },
      B: { emoji: '🟣', label: 'Rank B — Breakout',    color: '#8b5cf6', next: 'A', xpNext: 10000 },
      A: { emoji: '🟠', label: 'Rank A — Avançado',    color: '#f59e0b', next: 'S', xpNext: 25000 },
      S: { emoji: '🔴', label: 'Rank S — Soberano',    color: '#ef4444', next: null, xpNext: null  },
    };

    // ═══ PORTAIS ═══
    const PORTAIS = [
      { id: 'jordan',    emoji: '🎬', name: 'Jordan — NYC',       desc: 'Conversas do dia a dia',     color: 'text-mana-400',    glow: 'hover:border-mana-500/50',   path: '/?model=jordan'    },
      { id: 'alexandra', emoji: '💼', name: 'Alexandra — Business',desc: 'Inglês corporativo real',    color: 'text-blue-400',    glow: 'hover:border-blue-500/50',   path: '/?model=alexandra' },
      { id: 'miles',     emoji: '✈️', name: 'Miles — Viagens',    desc: 'Sobrevivência no exterior',  color: 'text-amber-400',   glow: 'hover:border-amber-500/50',  path: '/?model=miles'     },
      { id: 'zack',      emoji: '🎮', name: 'Zack — Gaming',      desc: 'Games & cultura da internet',color: 'text-purple-400',  glow: 'hover:border-purple-500/50', path: '/?model=zack'      },
      { id: 'hayes',     emoji: '📚', name: 'Prof. Hayes',        desc: 'Vocabulário & fluência',     color: 'text-cyan-400',    glow: 'hover:border-cyan-500/50',   path: '/?model=hayes'     },
    ];

    // ═══ HELPERS ═══
    const $ = id => document.getElementById(id);
    const hide = el => el.classList.add('hidden');
    const show = el => el.classList.remove('hidden');

    function setBar(id, pct) {
      const el = $(id);
      if (el) setTimeout(() => { el.style.width = Math.min(100, Math.max(0, pct)) + '%'; }, 80);
    }

    function tierBadge(tier) {
      return tier === 'pro'
        ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-500/30">PRO ✨</span>'
        : '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-700/60 text-gray-400 border border-gray-600/30">FREE</span>';
    }

    function renderPortais(personaIdeal, tier) {
      const grid = $('portais-grid');
      if (!grid) return;
      const isFree = (tier !== 'pro');
      const locked = isFree ? ['alexandra', 'miles', 'hayes'] : [];

      grid.innerHTML = PORTAIS.map((p, i) => {
        const isLocked = locked.includes(p.id) && p.id !== personaIdeal;
        return \`
          <div class="glass-card rounded-xl p-4 border border-white/5 portal-card \${isLocked ? 'portal-locked' : p.glow + ' border-white/5'}"
               onclick="\${isLocked ? "void(0)" : "window.location.href='" + p.path + "'"}" >
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">\${p.emoji}</span>
              <div>
                <div class="text-sm font-bold text-white">\${p.name}</div>
                <div class="text-xs text-gray-500">\${p.desc}</div>
              </div>
              \${p.id === personaIdeal ? '<span class="ml-auto text-xs text-mana-400 font-bold">⭐ Ideal</span>' : ''}
              \${isLocked ? '<span class="ml-auto text-xs text-gray-600">🔒 PRO</span>' : ''}
            </div>
            \${!isLocked ? \`<div class="text-xs \${p.color} mt-1">Entrar no portal →</div>\` : '<div class="text-xs text-gray-700 mt-1">Upgrade para PRO</div>'}
          </div>
        \`;
      }).join('');
    }

    function renderLeaderboard(entries) {
      const list = $('leaderboard-list');
      if (!list) return;
      if (!entries || entries.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-600 text-sm py-4">Nenhum aluno no ranking ainda.</p>';
        return;
      }
      const medals = ['🥇', '🥈', '🥉'];
      list.innerHTML = entries.slice(0, 10).map((e, i) => {
        const rank = RANKS[e.playerRank] || RANKS.E;
        return \`
          <div class="flex items-center gap-3 px-3 py-2 rounded-xl \${i < 3 ? 'bg-white/5' : ''}">
            <span class="text-base w-6 text-center">\${medals[i] || (i + 1) + '.'}</span>
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-mana-400 to-mana-600 flex items-center justify-center text-xs font-black text-black">
              \${(e.name || e.username || '?').charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-white truncate">\${e.name || e.username || 'Aluno'}</div>
              <div class="text-xs text-gray-500">\${rank.label}</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold text-mana-400">\${(e.totalXp || 0).toLocaleString('pt-BR')} XP</div>
              <div class="text-xs">\${rank.emoji}</div>
            </div>
          </div>
        \`;
      }).join('');
    }

    // ═══ FETCH PROFILE ═══
    async function loadProfile() {
      try {
        // Obtém o userId da sessão via /api/user (rota nativa do LibreChat)
        const userResp = await fetch('/api/user', { credentials: 'include' });
        if (!userResp.ok) throw new Error('not_logged_in');
        const userData = await userResp.json();
        const userId = userData._id || userData.id;
        if (!userId) throw new Error('no_user_id');

        // Carrega perfil MANA
        const profileResp = await fetch('/api/mana/profile/' + userId, { credentials: 'include' });
        const profile = profileResp.ok ? await profileResp.json() : {};

        // Carrega leaderboard
        const lbResp = await fetch('/api/mana/leaderboard', { credentials: 'include' });
        const leaderboard = lbResp.ok ? await lbResp.json() : [];

        hide($('loading-state'));
        renderCockpit(userData, profile, leaderboard);
        show($('cockpit-content'));

      } catch (err) {
        console.warn('[Cockpit]', err.message);
        hide($('loading-state'));
        show($('error-state'));
      }
    }

    function renderCockpit(user, profile, leaderboard) {
      const name = user.name || user.username || 'Aluno';
      const rank = profile.playerRank || 'E';
      const rankData = RANKS[rank] || RANKS.E;
      const totalXp = profile.totalXp || 0;
      const currentMana = profile.currentMana ?? 10;
      const maxMana = profile.maxMana ?? 10;
      const streakDays = profile.streakDays || 0;
      const tier = profile.tier || 'free';
      const personaIdeal = profile.personaIdeal || 'jordan';
      const nivel = profile.nivelDiagnosticado || null;

      // Header
      const headerRank = $('header-rank');
      if (headerRank) { headerRank.textContent = rankData.emoji + ' ' + rank; headerRank.classList.remove('hidden'); }

      // Avatar
      const avatar = $('avatar-initial');
      if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

      // Hero
      if ($('hero-name')) $('hero-name').textContent = name;
      if ($('hero-rank-emoji')) $('hero-rank-emoji').textContent = rankData.emoji;
      if ($('hero-tier-badge')) $('hero-tier-badge').outerHTML = tierBadge(tier);
      if ($('hero-persona')) $('hero-persona').textContent = 'Persona ideal: ' + (personaIdeal.charAt(0).toUpperCase() + personaIdeal.slice(1));
      if ($('hero-nivel')) $('hero-nivel').textContent = nivel ? 'Nível diagnóstico: ' + nivel : '';

      // XP Bar (progresso até próximo rank)
      const xpEl = $('xp-label');
      const xpBarEl = $('xp-bar');
      if (xpEl) xpEl.textContent = totalXp.toLocaleString('pt-BR') + ' XP';
      if (xpBarEl && rankData.xpNext) {
        const pct = Math.min(100, (totalXp / rankData.xpNext) * 100);
        setBar('xp-bar', pct);
      } else if (xpBarEl) {
        setBar('xp-bar', 100); // Rank S, barra cheia
      }

      // MANA
      if ($('mana-label')) $('mana-label').textContent = currentMana + ' / ' + maxMana;
      if ($('mana-hint')) $('mana-hint').textContent = currentMana > 0 ? 'Energia disponível para praticar' : 'Recarregue conversando com a AIDA';
      setBar('mana-bar', maxMana > 0 ? (currentMana / maxMana) * 100 : 0);

      // Streak
      if ($('streak-count')) $('streak-count').textContent = streakDays;
      if ($('streak-status')) {
        $('streak-status').textContent = streakDays >= 7
          ? '🏆 Em chamas — ' + streakDays + ' dias!'
          : streakDays >= 3 ? '💪 Ótimo ritmo!' : 'Mantenha o ritmo!';
      }

      // Rank
      if ($('rank-letter')) $('rank-letter').textContent = rank;
      if ($('rank-label')) $('rank-label').textContent = rankData.label;
      if ($('rank-xp-next')) {
        $('rank-xp-next').textContent = rankData.xpNext
          ? 'Próximo rank ' + rankData.next + ': ' + rankData.xpNext.toLocaleString('pt-BR') + ' XP'
          : '🔴 Rank máximo atingido!';
      }

      // Portais
      renderPortais(personaIdeal, tier);

      // Leaderboard
      renderLeaderboard(leaderboard);
    }

    // ═══ BOOT ═══
    loadProfile();
  })();
  </script>

</body>
</html>`;
}

module.exports = { getCockpitHtml };

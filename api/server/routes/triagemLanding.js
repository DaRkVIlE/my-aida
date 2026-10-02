/**
 * Landing Page & Quiz de Triagem MANA 3.0
 * Servida diretamente pelo Express para carregamento ultra-rápido (<50ms)
 * sem dependência de build de frontend ou risco de 404 em produção.
 */

function getTriagemHtml(whatsappNumber) {
  const wa = whatsappNumber || '5511967239791';

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AIDA — O Mecanismo M.A.N.A. & Triagem de Fluência</title>
  <meta name="description" content="A sua boca não fala porque o seu cérebro ainda está traduzindo. Descubra seu nível CEFR real e seu mapa até a fluência em 6-8 meses." />
  <link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            mana: {
              50: '#ecfdf5',
              400: '#34d399',
              500: '#10b981',
              600: '#059669',
            },
            portal: {
              purple: '#8b5cf6',
              blue: '#3b82f6',
              amber: '#f59e0b',
            }
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #030712; color: #f3f4f6; font-family: system-ui, -apple-system, sans-serif; }
    .glass-card { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .glow-hover:hover { border-color: rgba(16, 185, 129, 0.5); box-shadow: 0 0 25px rgba(16, 185, 129, 0.15); }
    .selected-card { border-color: #10b981 !important; background: rgba(16, 185, 129, 0.12) !important; box-shadow: 0 0 30px rgba(16, 185, 129, 0.25) !important; }
  </style>
</head>
<body class="min-h-screen selection:bg-mana-500 selection:text-black">

  <!-- Header / Navigation Bar -->
  <header class="border-b border-gray-800/80 bg-gray-950/80 backdrop-blur sticky top-0 z-50 px-4 py-3">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">⚡</span>
        <span class="font-extrabold tracking-tight text-white text-lg">M.A.N.A. <span class="text-mana-400 font-medium text-xs bg-mana-500/10 border border-mana-500/20 px-2 py-0.5 rounded-full ml-1">Turma Alpha</span></span>
      </div>
      <div class="flex items-center gap-3">
        <a href="#quiz-reflexo" class="text-xs md:text-sm font-semibold text-gray-300 hover:text-white transition">Fazer Triagem</a>
        <a href="/login" class="text-xs md:text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 transition">Entrar no Hub →</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="max-w-4xl mx-auto px-4 pt-16 pb-14 text-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
      <span>🛡️ Piloto Alpha Fechado</span>
      <span>•</span>
      <span>Apenas 8 a 10 Vagas</span>
    </div>

    <h1 class="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight md:leading-tight">
      A sua boca não fala porque o seu cérebro <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-emerald-400 to-teal-200">ainda está traduzindo.</span>
    </h1>

    <p class="mt-6 text-base md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
      Você passou anos decorando regras gramaticais e listas de palavras. Mas na hora de falar numa reunião ou pedir um café lá fora, o cérebro congela em silêncio.
    </p>

    <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="#quiz-reflexo" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-base md:text-lg shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
        Fazer Minha Calibração em 2 Minutos →
      </a>
      <a href="#mecanismo" class="w-full sm:w-auto px-6 py-4 rounded-xl glass-card text-gray-300 hover:text-white font-semibold text-sm transition">
        Como o Método Funciona?
      </a>
    </div>
  </section>

  <!-- O Problema dos Cursinhos -->
  <section class="max-w-5xl mx-auto px-4 py-12 border-t border-gray-900">
    <div class="text-center mb-10">
      <h2 class="text-2xl md:text-3xl font-extrabold text-white">Por que você ainda trava para falar?</h2>
      <p class="text-gray-400 text-sm mt-2">A verdade honesta que a indústria de idiomas tradicional esconde.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 rounded-2xl glow-hover transition">
        <div class="text-3xl mb-3">🔄</div>
        <h3 class="text-lg font-bold text-white mb-2">O Modelo do Aluno Eterno</h3>
        <p class="text-gray-400 text-sm leading-relaxed">
          Escolas tradicionais lucram com mensalidades infinitas. Se você alcançar autonomia em 6 meses, a receita deles acaba. O sistema é desenhado para reter, não para libertar.
        </p>
      </div>

      <div class="glass-card p-6 rounded-2xl glow-hover transition">
        <div class="text-3xl mb-3">📱</div>
        <h3 class="text-lg font-bold text-white mb-2">A Ilusão do Aplicativo</h3>
        <p class="text-gray-400 text-sm leading-relaxed">
          Ligar palavrinhas e traduzir frases artificiais te dá dopamina rápida, mas zero reflexo na vida real. Quando um nativo fala rápido, não existe botão de múltipla escolha.
        </p>
      </div>

      <div class="glass-card p-6 rounded-2xl glow-hover transition">
        <div class="text-3xl mb-3">🧠</div>
        <h3 class="text-lg font-bold text-white mb-2">O Paradoxo da Tradução</h3>
        <p class="text-gray-400 text-sm leading-relaxed">
          Se você precisa pensar em português, conjugar o verbo na cabeça e depois falar, a conversa já acabou. Fluência é falar por <strong class="text-emerald-400">blocos sonoros (chunks)</strong> imediatos.
        </p>
      </div>
    </div>
  </section>

  <!-- O Mecanismo M.A.N.A. -->
  <section id="mecanismo" class="max-w-5xl mx-auto px-4 py-14 border-t border-gray-900">
    <div class="text-center mb-12">
      <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">O Mecanismo Científico</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mt-2">M.A.N.A. — Método de Aquisição Natural Acelerada</h2>
      <p class="text-gray-400 max-w-2xl mx-auto text-sm mt-3 leading-relaxed">
        Baseado na Teoria de Aquisição Natural de Stephen Krashen e Swain: você não aprende regras para falar — você fala do jeito que der para adquirir a língua.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500">
        <div class="text-emerald-400 font-black text-2xl mb-1">M</div>
        <h3 class="font-bold text-white text-base">Modelo Sem Tradução</h3>
        <p class="text-xs text-gray-400 mt-2 leading-relaxed">
          Absorva frases inteiras prontas (chunks) em vez de palavras soltas. O cérebro dispara a frase inteira sem traduzir.
        </p>
      </div>

      <div class="glass-card p-5 rounded-2xl border-l-4 border-l-teal-500">
        <div class="text-teal-400 font-black text-2xl mb-1">A</div>
        <h3 class="font-bold text-white text-base">Aquisição Ativa 24/7</h3>
        <p class="text-xs text-gray-400 mt-2 leading-relaxed">
          5 tutores de IA especializados (AIDA) disponíveis a qualquer hora do dia ou da noite para imersão situacional sem vergonha de errar.
        </p>
      </div>

      <div class="glass-card p-5 rounded-2xl border-l-4 border-l-blue-500">
        <div class="text-blue-400 font-black text-2xl mb-1">N</div>
        <h3 class="font-bold text-white text-base">Noticing & Recasting</h3>
        <p class="text-xs text-gray-400 mt-2 leading-relaxed">
          Sem correções chatas de gramática que travam o aluno. O tutor devolve a frase modelada naturalmente na resposta seguinte.
        </p>
      </div>

      <div class="glass-card p-5 rounded-2xl border-l-4 border-l-purple-500">
        <div class="text-purple-400 font-black text-2xl mb-1">A</div>
        <h3 class="font-bold text-white text-base">Autonomia em 6-8 Meses</h3>
        <p class="text-xs text-gray-400 mt-2 leading-relaxed">
          Um mapa finito de 5 Portais e 2.500 chunks para atingir o B2 pleno com acompanhamento direto de Gabe.
        </p>
      </div>
    </div>
  </section>

  <!-- Os 5 Portais de Fluência -->
  <section class="max-w-5xl mx-auto px-4 py-12 border-t border-gray-900">
    <div class="text-center mb-10">
      <span class="text-xs uppercase tracking-widest text-emerald-400 font-bold">O Mapa da Conquista</span>
      <h2 class="text-2xl md:text-3xl font-extrabold text-white mt-1">Os 5 Portais até o Cume B2</h2>
      <p class="text-gray-400 text-sm mt-2">Você vai saber exatamente onde está e quanto falta.</p>
    </div>

    <div class="space-y-4">
      <div class="glass-card p-4 md:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/20 bg-emerald-950/10">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🚪</span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-white text-base">Portal 1: O Descongelamento</h3>
              <span class="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded font-mono">A1 → A2</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">350 Chunks Nucleares de Sobrevivência • Companion: Jordan 🎬 (Street Scout)</p>
          </div>
        </div>
        <span class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">Semana 1 a 4</span>
      </div>

      <div class="glass-card p-4 md:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">✈️</span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-white text-base">Portal 2: O Motor do BICS</h3>
              <span class="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded font-mono">A2 → B1</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">650 Chunks Cotidianos (Aeroporto, Hotel, Histórias) • Companion: Miles ✈️</p>
          </div>
        </div>
        <span class="text-xs font-semibold text-gray-400 bg-gray-800 px-3 py-1 rounded-full w-fit">Mês 2 e 3</span>
      </div>

      <div class="glass-card p-4 md:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🍻</span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-white text-base">Portal 3: A Tração Conversacional</h3>
              <span class="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded font-mono">B1 → B2 inicial</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">750 Chunks de Storytelling, Debate e Cultura • Companion: Zack 💻 & Jordan 🎬</p>
          </div>
        </div>
        <span class="text-xs font-semibold text-gray-400 bg-gray-800 px-3 py-1 rounded-full w-fit">Mês 4 e 5</span>
      </div>

      <div class="glass-card p-4 md:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">💼</span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-white text-base">Portal 4: A Fronteira Executiva</h3>
              <span class="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded font-mono">B2 Pleno</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">750 Chunks CALP Corporativos (Reuniões, Negociação, Pitch) • Companion: Alexandra 👔</p>
          </div>
        </div>
        <span class="text-xs font-semibold text-gray-400 bg-gray-800 px-3 py-1 rounded-full w-fit">Mês 6 a 8</span>
      </div>

      <div class="glass-card p-4 md:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-500/30 bg-purple-950/10">
        <div class="flex items-center gap-3">
          <span class="text-3xl">👑</span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-white text-base">Portal 5: O Trono da Soberania</h3>
              <span class="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded font-mono">C1 / C2</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">1.000 Chunks Avançados (Sarcasmo, Retórica, Oratória) • Companion: Prof. Hayes 📚</p>
          </div>
        </div>
        <span class="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 w-fit">Lapidação Contínua</span>
      </div>
    </div>
  </section>

  <!-- Quiz: Calibração dos 4 Cenários -->
  <section id="quiz-reflexo" class="max-w-3xl mx-auto px-4 py-16 border-t border-gray-900">
    <div class="text-center mb-10">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase mb-3">
        🧪 Teste de Reflexo Situacional
      </div>
      <h2 class="text-2xl md:text-4xl font-extrabold text-white">Como você reage nestas 4 situações reais?</h2>
      <p class="text-gray-400 text-sm mt-2">Seja 100% sincero. O objetivo é calibrar seu ponto exato de partida.</p>
    </div>

    <!-- Cenário 1 -->
    <div class="glass-card p-6 rounded-2xl mb-6">
      <div class="flex items-center gap-2 text-xl mb-2">
        <span>☕</span>
        <h3 class="font-bold text-white text-base md:text-lg">Cenário 1: O Café com Pressa</h3>
      </div>
      <p class="text-gray-300 text-sm mb-4">Você está atrasado para uma call e precisa pedir um café rápido num Starbucks em Manhattan:</p>
      <div class="space-y-2.5">
        <label onclick="selectOption(1, 3, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          🏃‍♂️ "Large black coffee to go, please — gotta run!"
        </label>
        <label onclick="selectOption(1, 2, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          ☕ "One coffee, please. Thank you."
        </label>
        <label onclick="selectOption(1, 0, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          🤐 (Fico travado pensando se digo "to go", "take away" ou como conjugar o verbo)
        </label>
      </div>
    </div>

    <!-- Cenário 2 -->
    <div class="glass-card p-6 rounded-2xl mb-6">
      <div class="flex items-center gap-2 text-xl mb-2">
        <span>✈️</span>
        <h3 class="font-bold text-white text-base md:text-lg">Cenário 2: O Imprevisto no Aeroporto</h3>
      </div>
      <p class="text-gray-300 text-sm mb-4">Sua mala não apareceu na esteira de bagagens no exterior e o balcão está fechando:</p>
      <div class="space-y-2.5">
        <label onclick="selectOption(2, 3, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          🧳 "Excuse me, my flight just arrived and my luggage hasn't shown up on carousel 4."
        </label>
        <label onclick="selectOption(2, 2, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          🆘 "Excuse me, where is my bag? It didn't come."
        </label>
        <label onclick="selectOption(2, 0, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          📱 (Abro o Google Tradutor com suor frio e digito palavra por palavra)
        </label>
      </div>
    </div>

    <!-- Cenário 3 -->
    <div class="glass-card p-6 rounded-2xl mb-6">
      <div class="flex items-center gap-2 text-xl mb-2">
        <span>💼</span>
        <h3 class="font-bold text-white text-base md:text-lg">Cenário 3: Discordar em Reunião Executiva</h3>
      </div>
      <p class="text-gray-300 text-sm mb-4">Numa reunião com gringos, alguém propõe um prazo impossível e você precisa discordar com firmeza e elegância:</p>
      <div class="space-y-2.5">
        <label onclick="selectOption(3, 3, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          💡 "I see where you're coming from, but that timeline is too tight given our current deliverables."
        </label>
        <label onclick="selectOption(3, 2, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          ✋ "No, this is impossible. We don't have time for this."
        </label>
        <label onclick="selectOption(3, 0, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          🤐 (Fico quieto com a câmera fechada para não me expor e falar errado)
        </label>
      </div>
    </div>

    <!-- Cenário 4 -->
    <div class="glass-card p-6 rounded-2xl mb-8">
      <div class="flex items-center gap-2 text-xl mb-2">
        <span>🍻</span>
        <h3 class="font-bold text-white text-base md:text-lg">Cenário 4: O Happy Hour com Nativos</h3>
      </div>
      <p class="text-gray-300 text-sm mb-4">Um americano vira pra você no bar: "Crazy week, huh? What have you been up to outside of work?":</p>
      <div class="space-y-2.5">
        <label onclick="selectOption(4, 3, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          🍻 "Man, tell me about it! Mostly chilling with family and catching up on movies, you?"
        </label>
        <label onclick="selectOption(4, 2, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          🙂 "Yes, very crazy. I stay home on weekend and rest."
        </label>
        <label onclick="selectOption(4, 0, this)" class="quiz-option block p-3.5 rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950/40 cursor-pointer transition text-sm text-gray-200">
          😅 (Sorrio amarelo, digo "Yes, yes..." e torço para ele não perguntar mais nada)
        </label>
      </div>
    </div>

    <!-- Dossiê do Resultado (Aparece dinamicamente após responder os 4) -->
    <div id="resultado-dossie" class="hidden glass-card p-8 rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-gray-950 to-emerald-950/20 text-center shadow-2xl">
      <span class="text-4xl mb-2 block">🎯</span>
      <h3 class="text-2xl font-black text-white">Seu Diagnóstico de Calibração MANA</h3>
      
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 text-left">
        <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
          <div class="text-xs text-gray-400">Nível CEFR:</div>
          <div id="res-cefr" class="font-black text-emerald-400 text-base">A2 (Básico)</div>
        </div>
        <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
          <div class="text-xs text-gray-400">Rank Inicial:</div>
          <div id="res-rank" class="font-black text-white text-base">Rank D</div>
        </div>
        <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
          <div class="text-xs text-gray-400">Companion Ideal:</div>
          <div id="res-companion" class="font-black text-teal-300 text-base">Jordan 🎬</div>
        </div>
        <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
          <div class="text-xs text-gray-400">Tempo até B2:</div>
          <div id="res-tempo" class="font-black text-amber-300 text-base">6 a 7 meses</div>
        </div>
      </div>

      <p id="res-diagnostico" class="text-sm text-gray-300 leading-relaxed text-left bg-black/40 p-4 rounded-xl border border-gray-800 mb-6">
        Você tem memória passiva de inglês, mas seu cérebro ainda sofre com a hesitação da tradução mental. O método MANA vai ativar seus reflexos imediatos com blocos sonoros naturais.
      </p>

      <!-- Botão WhatsApp com mensagem pré-formatada completa -->
      <a id="res-whatsapp-btn" href="#" target="_blank" rel="noreferrer" class="inline-flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-base md:text-lg shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all">
        <span>💬 Entrar no Piloto Alpha via WhatsApp com Gabe →</span>
      </a>

      <p class="text-xs text-gray-500 mt-3">
        Você fechará as condições do Piloto Alpha diretamente com Gabe (sem checkout automático).
      </p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-gray-900 py-8 px-4 text-center text-xs text-gray-600">
    <p>AIDA & Método M.A.N.A. • Experia Solutions © 2026. Todos os direitos reservados.</p>
    <p class="mt-2 text-gray-500">Desenvolvido para criar autonomia comunicativa real em 6 a 8 meses.</p>
  </footer>

  <script>
    var answers = {};
    var gabeNumber = '${wa}';

    function selectOption(questionId, points, el) {
      answers[questionId] = points;

      var parent = el.parentElement;
      var options = parent.querySelectorAll('.quiz-option');
      options.forEach(function(opt) {
        opt.classList.remove('selected-card');
      });
      el.classList.add('selected-card');

      checkCompletion();
    }

    function checkCompletion() {
      if (Object.keys(answers).length === 4) {
        var total = Object.values(answers).reduce(function(a, b) { return a + b; }, 0);
        showDossie(total);
      }
    }

    function showDossie(score) {
      var cefr = 'A1 (Iniciante)';
      var rank = 'Rank E (Descongelamento)';
      var companion = 'Jordan 🎬 (Amigo de NY)';
      var tempo = '7 a 8 meses';
      var diag = 'Seu cérebro ainda está no circuito de tradução literal. Você gasta 90% da sua energia montando a gramática mental antes de falar. O método vai silenciar seu crítico interno com blocos sonoros curtos e apoio visual total.';

      if (score >= 10) {
        cefr = 'B2 (Independente Pleno)';
        rank = 'Rank B / A';
        companion = 'Alexandra 👔 (Business)';
        tempo = '2 a 3 meses (Lapidação)';
        diag = 'Você já fala com naturalidade, mas ainda busca maior refinamento executivo e autoridade nativa em situações formais e de alta pressão.';
      } else if (score >= 7) {
        cefr = 'B1 (Intermediário)';
        rank = 'Rank C (Tração)';
        companion = 'Zack 💻 & Jordan 🎬';
        tempo = '4 a 5 meses';
        diag = 'Você se vira bem, mas ainda recorre à tradução mental quando o assunto fica complexo ou os nativos usam gírias rápidas.';
      } else if (score >= 4) {
        cefr = 'A2 (Básico Funcional)';
        rank = 'Rank D (Aprendiz)';
        companion = 'Miles ✈️ (Viagens)';
        tempo = '6 a 7 meses';
        diag = 'Você tem memória passiva de vocabulário, mas a sua fala congela pelo medo de errar. A AIDA vai reativar seus chunks situacionais sem cobranças gramaticais.';
      }

      document.getElementById('res-cefr').textContent = cefr;
      document.getElementById('res-rank').textContent = rank;
      document.getElementById('res-companion').textContent = companion;
      document.getElementById('res-tempo').textContent = tempo;
      document.getElementById('res-diagnostico').textContent = diag;

      var waMsg = 'Oi Gabe! Acabei de fazer a triagem do método MANA e quero entrar na Turma Alpha com valor de validação!\\n\\n' +
        '📊 Meu Diagnóstico de Calibração:\\n' +
        '• Pontuação de Reflexo: ' + score + '/12\\n' +
        '• Nível Estimado: ' + cefr + '\\n' +
        '• Rank Inicial: ' + rank + '\\n' +
        '• Companion Sugerido: ' + companion + '\\n' +
        '• Tempo Estimado: ' + tempo + '\\n\\n' +
        'Como funcionam as aulas e como fecho uma das 8 a 10 vagas do Piloto?';

      var waUrl = 'https://wa.me/' + gabeNumber + '?text=' + encodeURIComponent(waMsg);
      document.getElementById('res-whatsapp-btn').href = waUrl;

      var resultBox = document.getElementById('resultado-dossie');
      resultBox.classList.remove('hidden');
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  </script>
</body>
</html>`;
}

module.exports = { getTriagemHtml };

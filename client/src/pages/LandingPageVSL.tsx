import React, { useState } from 'react';

interface ReflexChallenge {
  id: number;
  promptEmoji: string;
  situation: string;
  options: { text: string; points: number; tag: string }[];
}

const reflexChallenges: ReflexChallenge[] = [
  {
    id: 1,
    promptEmoji: '☕ 🏃‍♂️ ⏰',
    situation: 'Você está atrasado para uma call matinal e quer um café rápido em um Starbucks no exterior:',
    options: [
      { text: '🏃‍♂️ "Large black coffee to go, please — gotta run!"', points: 3, tag: 'BICS Fluido' },
      { text: '☕ "One coffee, please. Thank you."', points: 2, tag: 'Básico Funcional' },
      { text: '🤐 (Fico travado pensando se digo "to go", "take away" ou como conjugar o verbo)', points: 0, tag: 'Travamento' },
    ],
  },
  {
    id: 2,
    promptEmoji: '✈️ 🧳 ❓',
    situation: 'No aeroporto gringo, sua mala não apareceu na esteira de bagagens e o balcão está fechando:',
    options: [
      { text: '🧳 "Excuse me, my flight just arrived and my luggage hasn\'t shown up on carousel 4."', points: 3, tag: 'BICS Fluido' },
      { text: '🆘 "Excuse me, where is my bag? It didn\'t come."', points: 2, tag: 'Básico Funcional' },
      { text: '📱 (Abro o Google Tradutor com suor frio e digito palavra por palavra)', points: 0, tag: 'Travamento' },
    ],
  },
  {
    id: 3,
    promptEmoji: '💼 🤝 📊',
    situation: 'Em uma reunião online com gringos, alguém propõe um prazo impossível e você precisa discordar com firmeza e elegância:',
    options: [
      { text: '💡 "I see where you\'re coming from, but that timeline is too tight given our current deliverables."', points: 3, tag: 'CALP Executivo' },
      { text: '✋ "No, this is impossible. We don\'t have time for this."', points: 2, tag: 'Direto / Rústico' },
      { text: '🤐 (Fico quieto com a câmera fechada para não me expor e falar errado)', points: 0, tag: 'Travamento' },
    ],
  },
  {
    id: 4,
    promptEmoji: '💬 🍻 👋',
    situation: 'No happy hour do evento, um colega americano vira pra você e manda: "Crazy week, huh? What have you been up to outside of work?":',
    options: [
      { text: '🍻 "Man, tell me about it! Mostly chilling with family and catching up on movies, you?"', points: 3, tag: 'BICS Fluido' },
      { text: '🙂 "Yes, very crazy. I stay home on weekend and rest."', points: 2, tag: 'Básico Funcional' },
      { text: '😅 (Sorrio amarelo, digo "Yes, yes..." e torço para ele não perguntar mais nada)', points: 0, tag: 'Travamento' },
    ],
  },
];

const GABE_WHATSAPP_NUMBER = '5511967239791';

const LandingPageVSL: React.FC = () => {
  // Estados da Calibração Cognitiva Pré-Chat
  const [selectedPainState, setSelectedPainState] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [reflexAnswers, setReflexAnswers] = useState<Record<number, number>>({});

  const handleReflexSelect = (challengeId: number, points: number) => {
    setReflexAnswers((prev) => ({ ...prev, [challengeId]: points }));
  };

  const totalReflexScore = Object.values(reflexAnswers).reduce((a, b) => a + b, 0);
  const isReflexComplete = Object.keys(reflexAnswers).length === reflexChallenges.length;

  const painLabels: Record<number, string> = {
    1: 'Estudo há anos, leio bem, mas a boca trava na hora de falar',
    2: 'Entendo quase tudo que ouço, mas demoro muito traduzindo mentalmente',
    3: 'Preciso do inglês profissionalmente, mas o medo de errar me silencia',
    4: 'Já me viro, mas quero falar com elegância executiva e naturalidade nativa',
  };

  const calculateCalibration = () => {
    let rank = 'Rank E (Descongelamento)';
    let cefr = 'A1 (Iniciante)';
    let difficulty = 'BABY MODE 👶 (Frases curtas de 4 a 8 palavras + hiper-ancoragem em emojis ☕)';
    let companion = 'Jordan 🎬 (Amigo de NY)';
    let diagnosticText = 'Seu cérebro ainda está no circuito de tradução literal palavra por palavra. Você gasta 90% da sua energia mental montando a gramática antes de falar. O método vai silenciar seu crítico interno com blocos sonoros curtos e apoio visual total.';
    let estimatedTime = '6 a 8 meses até a Autonomia B2';
    let currentPortal = 'Portal 1: Descongelamento (350 chunks essenciais)';

    if (selectedProfile === 'p1') {
      rank = 'Rank E (Descongelamento)';
      cefr = 'A1 (Iniciante)';
      difficulty = 'BABY MODE 👶 (Frases curtas de 4 a 8 palavras + Emojis Contextuais)';
      companion = 'Jordan 🎬 (Amigo de NY)';
      diagnosticText = 'Zero pressão! Você começará com trocas curtas e proteção total contra o pânico. Sem gramática formal: você vai absorver os primeiros 350 chunks da vida real.';
      estimatedTime = '7 a 8 meses até o B2';
      currentPortal = 'Portal 1: Descongelamento (350 chunks)';
    } else if (selectedProfile === 'p2') {
      rank = 'Rank D (Aprendiz em Ativação)';
      cefr = 'A2 (Básico Funcional)';
      difficulty = 'GENTLE IMMERSION 🌿 (Sentenças simples de 8 a 12 palavras, apoio visual)';
      companion = 'Miles ✈️ (Inglês de Viagens) ou Jordan 🎬';
      diagnosticText = 'Você tem memória passiva de inglês, mas sua fala foi traumatizada por correções chatas de cursinho. A AIDA vai reativar seu vocabulário através de situações práticas de viagem e dia a dia sem apontar erros.';
      estimatedTime = '6 a 7 meses até o B2';
      currentPortal = 'Portal 2: O Motor do BICS (650 chunks)';
    } else if (selectedProfile === 'p3') {
      if (totalReflexScore >= 8) {
        rank = 'Rank C (Conversational Player)';
        cefr = 'B1 (Intermediário Independente)';
        difficulty = 'BICS FLUIDITY ⚡ (Conversação espontânea em tempo real, sem tradução)';
        companion = 'Jordan 🎬 ou Alexandra 👔 (Business)';
        diagnosticText = 'Você já entende o inglês do mundo real! Seu único obstáculo é a ponte da fala: o hábito nocivo de traduzir em português antes de emitir a voz. Nós vamos acelerar seu tempo de resposta com o Noticing Natural.';
        estimatedTime = '4 a 5 meses até a consolidação B2';
        currentPortal = 'Portal 3: Narrativa & Imprevistos (750 chunks)';
      } else {
        rank = 'Rank D+ (Em Transição para Intermediário)';
        cefr = 'A2+ (Pré-Intermediário)';
        difficulty = 'SCAFFOLDED BICS 🛡️ (Diálogo com recasting invisível e modelagem direta)';
        companion = 'Jordan 🎬 ou Miles ✈️';
        diagnosticText = 'Você reconhece a língua mas hesita na resposta. O foco será desbloquear o reflexo motor de resposta em menos de 2 segundos.';
        estimatedTime = '5 a 6 meses até o B2';
        currentPortal = 'Portal 2: O Motor do BICS (650 chunks)';
      }
    } else if (selectedProfile === 'p4') {
      rank = 'Rank B (Avançado Corporativo)';
      cefr = 'B2 (Fluência Executiva)';
      difficulty = 'CALP & EXECUTIVE 💼 (Vocabulário executivo, diplomacia, negociação e apresentações)';
      companion = 'Alexandra 👔 (Business English)';
      diagnosticText = 'Você já fala e se vira, mas sente que seu vocabulário é rústico ou simplório em reuniões importantes. O foco é elegância diplomática, connectors corporativos e sofisticação.';
      estimatedTime = '2 a 3 meses de lapidação direta com Gabe';
      currentPortal = 'Portal 4: Negociação Executiva (750 chunks)';
    } else if (selectedProfile === 'p5') {
      rank = 'Rank A/S (Soberania Pró-Nativa)';
      cefr = 'C1/C2 (Proficiência Soberana)';
      difficulty = 'SOVEREIGN REFINEMENT 👑 (Ironia nativa, ritmo stress-timed, debate e alta retórica)';
      companion = 'Prof. Hayes 📚 ou Alexandra 👔';
      diagnosticText = 'Você busca o topo da montanha: a arte da oratória, o ritmo natural (stress-timed rhythm), humor, sutileza e persuasão com mentoria de Gabe.';
      estimatedTime = 'Mentoria Contínua de Maestria';
      currentPortal = 'Portal 5: Cume do Mestre — Soberania';
    }

    return { rank, cefr, difficulty, companion, diagnosticText, estimatedTime, currentPortal };
  };

  const calibration = calculateCalibration();
  const canCalculate = selectedPainState !== null && selectedProfile !== null && isReflexComplete;

  const buildWhatsAppLink = () => {
    const pain = selectedPainState ? painLabels[selectedPainState] : 'Travamento na fala';
    const message = `Olá Gabe! Fiz a triagem no site da AIDA / Método MANA.

Meu resultado da calibração:
• Rank Inicial: ${calibration.rank}
• Nível CEFR: ${calibration.cefr}
• Travamento Principal: "${pain}"
• Portal Inicial: ${calibration.currentPortal}
• Companion Ideal: ${calibration.companion}

Gostaria de garantir uma das vagas do Piloto Alpha para calibrar meu plano de 6 a 8 meses e conversar com você!`;

    return `https://wa.me/${GABE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-green-500 selection:text-black">
      {/* Top Banner de Transparência */}
      <div className="bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-950 border-b border-green-800/40 py-2.5 px-4 text-center text-xs md:text-sm text-green-300 font-mono">
        🚀 <span className="font-bold text-white">Piloto Alpha Aberto:</span> 8 a 10 vagas com acompanhamento direto de Gabe • Preço piloto de validação
      </div>

      {/* Seção 1 - Hero Visceral */}
      <section className="relative py-20 md:py-28 px-6 flex flex-col items-center text-center bg-gradient-to-b from-green-950/20 via-gray-950 to-gray-950 border-b border-gray-900">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-xs md:text-sm px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
          <span>⚡</span> Método MANA 3.0 • Aquisição Natural Acelerada
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 max-w-4xl leading-tight tracking-tight text-white">
          A sua boca não fala porque o seu cérebro{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-200">
            ainda está traduzindo.
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-gray-300 mb-6 max-w-3xl font-light leading-relaxed">
          Você não tem problema de memória e nem "bloqueio genético" para idiomas. Você só foi condicionado a{' '}
          <strong className="text-white font-semibold">pensar em português, caçar regras na cabeça e montar frases como quem resolve uma equação</strong>.
        </p>

        <p className="text-sm md:text-base text-gray-400 mb-10 max-w-2xl italic font-mono">
          "Quando você termina de traduzir a regra na sua mente, a conversa já acabou." — Gabe (Gabriel Lima)
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <button
            onClick={() => {
              document.getElementById('calibracao-pre-chat')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-green-600 hover:bg-green-500 text-black font-extrabold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.4)] text-base md:text-lg cursor-pointer"
          >
            Fazer Minha Calibração de Fala (5 min) →
          </button>
          <button
            onClick={() => {
              document.getElementById('mecanismo-mana')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 font-medium py-4 px-8 rounded-full transition-colors cursor-pointer"
          >
            Como Funciona o Mecanismo MANA
          </button>
        </div>
      </section>

      {/* Seção 2 - O Problema dos Cursinhos: O Golpe do Aluno Eterno */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-b border-gray-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-red-400 font-mono text-xs tracking-wider uppercase font-semibold">
            A Verdade Sem Filtro
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">
            Por que você estuda há anos e ainda trava?
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            O modelo de franquia tradicional não foi desenhado para te fazer falar rápido. Ele foi desenhado para você continuar pagando.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900/70 p-8 rounded-2xl border border-gray-800 hover:border-red-500/40 transition-colors">
            <div className="text-3xl mb-4">💼</div>
            <h3 className="text-xl font-bold mb-3 text-white">O Modelo do Aluno Eterno</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cursos de 4 a 5 anos com livros do Book 1 ao Book 12 são um modelo de receita recorrente, não de neurociência. Se você alcançar autonomia em 6 meses, a escola perde 4 anos de mensalidades.
            </p>
          </div>

          <div className="bg-gray-900/70 p-8 rounded-2xl border border-gray-800 hover:border-yellow-500/40 transition-colors">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-3 text-white">A Ilusão do Aplicativo</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Você passa meses preenchendo lacunas de frases prontas no aplicativo. Quando um colega gringo faz uma pergunta espontânea em uma call, a tela do celular não te salva: sua boca congela.
            </p>
          </div>

          <div className="bg-gray-900/70 p-8 rounded-2xl border border-gray-800 hover:border-green-500/40 transition-colors">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-3 text-white">O Paradoxo da Tradução</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nenhuma criança estuda gramática antes de falar. O cérebro humano só adquire linguagem fluida através de imersão contextual em blocos sonoros completos (chunks), nunca por regras abstratas.
            </p>
          </div>
        </div>
      </section>

      {/* Seção 3 - O Mecanismo MANA Explicado (Antes do Quiz) */}
      <section id="mecanismo-mana" className="py-24 px-6 bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950 border-b border-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              Mecanismo Central • MANA 3.0
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              Como o MANA treina seu cérebro para falar sem traduzir
            </h2>
            <p className="text-gray-400 text-base md:text-lg mt-4">
              A união entre neurociência de aquisição de linguagem e inteligência artificial imersiva 24/7.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-gray-900/90 p-8 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 font-mono font-bold flex items-center justify-center text-lg">M</span>
                  <h3 className="text-xl font-bold text-white">Modelo Sem Tradução</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Em vez de decorar palavras isoladas, você absorve <strong>chunks sonoros prontos</strong> ancorados visualmente em emojis contextuais. Seu cérebro associa o som direto à ideia — exatamente como você faz com o português.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-green-400 font-mono">
                → Elimina o delay mental de tradução.
              </div>
            </div>

            <div className="bg-gray-900/90 p-8 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-lg">A</span>
                  <h3 className="text-xl font-bold text-white">Aquisição Ativa 24/7 (AIDA)</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Sua inteligência de conversação está no seu bolso. Pratique 15 minutos diários com áudio real e reconhecimento de voz Whisper, a qualquer hora do dia ou da noite, com <strong>zero vergonha ou medo de julgamento</strong>.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-emerald-400 font-mono">
                → Imersão sem fricção no WhatsApp ou web.
              </div>
            </div>

            <div className="bg-gray-900/90 p-8 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 font-mono font-bold flex items-center justify-center text-lg">N</span>
                  <h3 className="text-xl font-bold text-white">Noticing & Recasting Natural</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Esqueça correções humilhantes. Quando você comete um desvio, a AIDA responde <strong>modelando a forma perfeita na frase seguinte</strong>. O seu cérebro percebe a diferença subconscientemente sem quebrar o fluxo da conversa.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-teal-400 font-mono">
                → Filtro afetivo baixo: falar sem ansiedade.
              </div>
            </div>

            <div className="bg-gray-900/90 p-8 rounded-2xl border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-green-500 text-black font-mono font-bold flex items-center justify-center text-lg">A</span>
                  <h3 className="text-xl font-bold text-white">Autonomia Guiada em 6 a 8 Meses</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Em vez de 50.000 palavras decoradas, focamos nos <strong>2.500 chunks de alta frequência</strong> que cobrem 90% das reuniões e viagens da vida real. Somado a mentorias de alinhamento com Gabe para garantir seu ritmo.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-green-800/50 text-xs text-green-300 font-mono font-semibold">
                → Linha de chegada visível e definida.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 4 - Os 5 Portais de Fluência (6 a 8 meses) */}
      <section className="py-20 px-6 max-w-5xl mx-auto border-b border-gray-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-green-400 font-mono text-xs tracking-wider uppercase font-semibold">
            Trilha de Domínio • 2.500 Chunks
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">
            Os 5 Portais de Fluência até o B2
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            Você não sobe uma montanha sem mapa. Estes são os 5 portais que você vai cruzar no MANA:
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              portal: 'Portal 1',
              title: 'Descongelamento & Baby Mode',
              rank: 'Rank E → D (A1/A2)',
              chunks: '350 chunks',
              desc: 'Desarmamento do pânico. Respostas rápidas em situações simples do dia a dia com forte apoio de emojis.',
              icon: '🧊 ➔ 💧',
            },
            {
              portal: 'Portal 2',
              title: 'O Motor do BICS (Conversação Cotidiana)',
              rank: 'Rank D → C (A2/B1)',
              chunks: '650 chunks',
              desc: 'Conversação real sem hesitação. Alinhamento de rotinas, viagens, restaurantes e trocas espontâneas.',
              icon: '⚡ 🗣️',
            },
            {
              portal: 'Portal 3',
              title: 'Narrativa & Gestão de Imprevistos',
              rank: 'Rank C → B (B1/B2)',
              chunks: '750 chunks',
              desc: 'Contar histórias no passado, resolver problemas no exterior e explicar ideias sem travar quando a palavra faltar.',
              icon: '🗺️ 🧗',
            },
            {
              portal: 'Portal 4',
              title: 'Negociação Executiva & Posicionamento',
              rank: 'Rank B → B2 Real',
              chunks: '750 chunks',
              desc: 'O cume central da autonomia: defender ideias em reuniões, contra-argumentar com elegância e liderar calls.',
              icon: '💼 🎯',
            },
            {
              portal: 'Portal 5',
              title: 'O Cume do Mestre — Soberania C1/C2',
              rank: 'Rank A/S (Soberano)',
              chunks: '1.000 chunks avançados',
              desc: 'Lapidação pro-level com Gabe: ritmo nativo stress-timed, diplomacia internacional, ironia e humor fino.',
              icon: '👑 ✨',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 hover:border-green-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl md:text-3xl mt-1">{item.icon}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-bold">
                      {item.portal}
                    </span>
                    <h3 className="font-bold text-lg text-white">{item.title}</h3>
                    <span className="text-xs text-gray-400 font-mono">({item.rank})</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
              <div className="text-right whitespace-nowrap self-end md:self-center">
                <span className="text-green-400 font-mono font-bold text-sm">{item.chunks}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 5 - Calibração Cognitiva Pré-Chat (< 5 minutos) */}
      <section id="calibracao-pre-chat" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Diagnóstico Inicial
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Calibração de Fala & Descubra Seu Portal Inicial
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mt-2">
            Responda as 3 etapas abaixo. Nossa inteligência vai calcular seu nível CEFR, seu companion ideal e seu plano de estudos até o B2.
          </p>
        </div>

        {/* Etapa 1: O Teste do Espelho Mental */}
        <div className="mb-12 bg-gray-900/70 p-6 md:p-8 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-green-600 text-black font-mono text-xs w-7 h-7 rounded-full flex items-center justify-center font-extrabold">1</span>
            <h3 className="text-xl md:text-2xl font-bold text-white">O Espelho Mental: Qual é a sua maior dor hoje?</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { id: 1, text: '🤯 "Estudo há anos, entendo bem quando leio, mas travo na hora de falar."' },
              { id: 2, text: '😩 "Entendo quase tudo que ouço, mas para responder demoro muito tempo pensando."' },
              { id: 3, text: '💼 "Preciso do inglês para crescer profissionalmente, mas tenho medo de errar."' },
              { id: 4, text: '🌐 "Já me viro razoavelmente, mas quero falar com naturalidade, elegância e ritmo."' },
            ].map((pain) => (
              <button
                key={pain.id}
                onClick={() => setSelectedPainState(pain.id)}
                className={`p-5 text-left rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedPainState === pain.id
                    ? 'border-green-500 bg-green-950/40 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-[1.01]'
                    : 'border-gray-800 bg-gray-900/90 hover:border-gray-700 hover:bg-gray-800/80'
                }`}
              >
                <span className="text-sm md:text-base text-gray-200">{pain.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Etapa 2: O Perfil Atual do Aluno */}
        <div className="mb-12 bg-gray-900/70 p-6 md:p-8 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-green-600 text-black font-mono text-xs w-7 h-7 rounded-full flex items-center justify-center font-extrabold">2</span>
            <h3 className="text-xl md:text-2xl font-bold text-white">Qual perfil descreve mais honestamente o seu momento?</h3>
          </div>
          <div className="space-y-3">
            {[
              { id: 'p1', icon: '👶', title: 'P1: Zero / Recomeço Absoluto', desc: 'Nunca estudei a sério ou esqueci tudo. Preciso de suporte total, frases simples e acolhimento.' },
              { id: 'p2', icon: '😓', title: 'P2: Básico Traumatizado', desc: 'Já fiz cursinhos, aprendi pouca coisa e peguei trauma de cobrança de regras e testes.' },
              { id: 'p3', icon: '🔇', title: 'P3: Intermediário Bloqueado', desc: 'Entendo bem séries com legenda e leio textos, mas na hora de falar a voz não sai.' },
              { id: 'p4', icon: '💼', title: 'P4: Profissional em Lapidação', desc: 'Consigo me virar no trabalho, mas falta precisão executiva, autoridade e fluidez.' },
              { id: 'p5', icon: '👑', title: 'P5: Soberania C1/C2', desc: 'Já falo com facilidade. Busco ritmo nativo, humor, oratória e refinamento executivo.' },
            ].map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfile(profile.id)}
                className={`w-full p-5 text-left rounded-xl border transition-all duration-200 flex items-start gap-4 cursor-pointer ${
                  selectedProfile === profile.id
                    ? 'border-green-500 bg-green-950/40 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-[1.01]'
                    : 'border-gray-800 bg-gray-900/90 hover:border-gray-700 hover:bg-gray-800/80'
                }`}
              >
                <span className="text-2xl md:text-3xl mt-0.5">{profile.icon}</span>
                <div>
                  <h4 className="font-bold text-base md:text-lg text-white">{profile.title}</h4>
                  <p className="text-gray-400 text-xs md:text-sm mt-1">{profile.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Etapa 3: 4 Micro-Desafios de Reflexo & Decisão */}
        <div className="mb-12 bg-gray-900/70 p-6 md:p-8 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-green-600 text-black font-mono text-xs w-7 h-7 rounded-full flex items-center justify-center font-extrabold">3</span>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">4 Testes de Reflexo em Situações Reais</h3>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">Como você reagiria instintivamente em cada uma destas 4 situações?</p>
            </div>
          </div>

          <div className="space-y-6">
            {reflexChallenges.map((challenge, cIndex) => (
              <div key={challenge.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{challenge.promptEmoji}</span>
                  <span className="font-semibold text-gray-200 text-sm md:text-base">
                    {cIndex + 1}. {challenge.situation}
                  </span>
                </div>
                <div className="space-y-2 mt-3">
                  {challenge.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleReflexSelect(challenge.id, opt.points)}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs md:text-sm transition-colors cursor-pointer ${
                        reflexAnswers[challenge.id] === opt.points
                          ? 'border-green-500 bg-green-950/50 text-green-300 font-medium'
                          : 'border-gray-800 bg-gray-950/70 text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card de Diagnóstico & Dificuldade Calibrada (Revelação Completa) */}
        {canCalculate ? (
          <div className="bg-gradient-to-b from-green-950/80 via-gray-900 to-gray-950 p-6 md:p-10 rounded-2xl border-2 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)] text-center animate-fade-in">
            <div className="inline-block bg-green-500 text-black font-mono text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider mb-4">
              ✓ Diagnóstico de Calibração Concluído
            </div>

            <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
              Seu Diagnóstico: <span className="text-green-400">{calibration.rank}</span>
            </h3>
            <p className="text-green-300 font-mono text-sm md:text-base mb-6">
              Equivalência CEFR: <span className="font-bold underline">{calibration.cefr}</span> • Rumo ao B2 Autônomo
            </p>

            <div className="bg-gray-950/90 p-5 rounded-xl border border-gray-800 text-left max-w-2xl mx-auto mb-6 text-sm text-gray-300 leading-relaxed">
              <strong className="text-white block mb-1">Análise do seu travamento:</strong>
              {calibration.diagnosticText}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left mb-8">
              <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 uppercase font-mono block">Dificuldade da Cena:</span>
                <span className="font-semibold text-xs md:text-sm text-green-300 mt-1 block">{calibration.difficulty}</span>
              </div>
              <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 uppercase font-mono block">Companion de IA Recomendado:</span>
                <span className="font-semibold text-xs md:text-sm text-yellow-300 mt-1 block">{calibration.companion}</span>
              </div>
              <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 uppercase font-mono block">Portal de Início:</span>
                <span className="font-semibold text-xs md:text-sm text-emerald-400 mt-1 block">{calibration.currentPortal}</span>
              </div>
              <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 uppercase font-mono block">Tempo Estimado até B2:</span>
                <span className="font-semibold text-xs md:text-sm text-blue-300 mt-1 block">{calibration.estimatedTime}</span>
              </div>
            </div>

            {/* CTAs Finais */}
            <div className="max-w-xl mx-auto flex flex-col gap-4">
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-black font-black py-5 px-8 rounded-full text-base md:text-lg transition-transform hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.5)] cursor-pointer"
              >
                <span>💬</span> Entrar no Piloto Alpha via WhatsApp com Gabe →
              </a>

              <p className="text-xs text-gray-400 font-mono">
                ⚡ Piloto Alpha limitado a 8-10 alunos • Condição flexível de validação • Fechamento direto com Gabe
              </p>

              <div className="pt-4 border-t border-gray-800 flex items-center justify-center gap-4">
                <a
                  href="/login"
                  className="text-xs md:text-sm text-gray-400 hover:text-green-400 underline transition-colors"
                >
                  Ou testar a AIDA no navegador (15 turnos diários gratuitos) →
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-900/40 rounded-xl border border-dashed border-gray-800 text-gray-500 text-sm">
            Complete as 3 etapas acima (sua dor, seu perfil e as 4 situações de reflexo) para gerar seu diagnóstico completo e liberar o plano de estudos.
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-900 text-center text-gray-500 text-xs">
        <p>MANA 3.0 • Método de Aquisição Natural Acelerada • Criado por Gabe (Gabriel Lima)</p>
        <p className="mt-2 text-gray-600">AIDA Agents Hub • Imersão Ativa 24/7 sem tradução mental</p>
      </footer>
    </div>
  );
};

export default LandingPageVSL;

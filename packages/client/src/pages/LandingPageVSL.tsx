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
    situation: 'Você está atrasado para uma reunião matinal e quer um café rápido:',
    options: [
      { text: '🏃‍♂️ "Grab coffee to go, gotta run!"', points: 3, tag: 'BICS Fluido' },
      { text: '☕ "One coffee, please. Thank you."', points: 2, tag: 'Básico Funcional' },
      { text: '🤐 (Fico travado pensando se digo "to go" ou "take away")', points: 0, tag: 'Travamento' },
    ],
  },
  {
    id: 2,
    promptEmoji: '✈️ 🧳 ❓',
    situation: 'No aeroporto gringo, sua mala não apareceu na esteira de bagagens:',
    options: [
      { text: '🧳 "My luggage seems missing, who do I talk to?"', points: 3, tag: 'BICS Fluido' },
      { text: '🆘 "Excuse me, where is my bag?"', points: 2, tag: 'Básico Funcional' },
      { text: '📱 (Abro o Google Tradutor no celular com vergonha)', points: 0, tag: 'Travamento' },
    ],
  },
  {
    id: 3,
    promptEmoji: '💼 🤝 📊',
    situation: 'Em uma reunião de trabalho, alguém faz uma proposta arriscada e você quer discordar com elegância:',
    options: [
      { text: '💡 "I see your point, but we might want to explore alternatives."', points: 3, tag: 'CALP Executivo' },
      { text: '✋ "No, I don\'t agree with this."', points: 2, tag: 'Direto / Rústico' },
      { text: '🤐 (Fico quieto para não falar errado na frente dos outros)', points: 0, tag: 'Travamento' },
    ],
  },
];

const LandingPageVSL: React.FC = () => {
  // Estados da Calibração Cognitiva Pré-Chat
  const [selectedPainState, setSelectedPainState] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [reflexAnswers, setReflexAnswers] = useState<Record<number, number>>({});
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleReflexSelect = (challengeId: number, points: number) => {
    setReflexAnswers((prev) => ({ ...prev, [challengeId]: points }));
  };

  // Cálculo da Calibração Pré-Chat
  const totalReflexScore = Object.values(reflexAnswers).reduce((a, b) => a + b, 0);
  const isReflexComplete = Object.keys(reflexAnswers).length === reflexChallenges.length;

  const calculateCalibration = () => {
    let rank = 'Rank E (Iniciante)';
    let difficulty = 'BABY MODE 👶 (Frases curtas de até 8 palavras + hiper-ancoragem em emojis ☕)';
    let companion = 'Jordan 🎬 (Street Scout - Amigável e acolhedor)';
    let advice = 'Zero pressão! A AIDA vai te acolher com frases curtas e suporte visual total.';

    if (selectedProfile === 'p1') {
      rank = 'Rank E (Descongelamento)';
      difficulty = 'BABY MODE 👶 (Frases de 4 a 8 palavras + Emojis Contextuais)';
      companion = 'Jordan 🎬 (The Street Scout)';
    } else if (selectedProfile === 'p2') {
      rank = 'Rank D (Aprendiz)';
      difficulty = 'GENTLE IMMERSION 🌿 (Sentenças simples de 8 a 12 palavras, apoio visual)';
      companion = 'Miles ✈️ (The World Explorer) ou Jordan 🎬';
    } else if (selectedProfile === 'p3') {
      if (totalReflexScore >= 6) {
        rank = 'Rank C (Conversational Player)';
        difficulty = 'BICS FLUIDITY ⚡ (Conversação natural, desbloqueio de espontaneidade)';
        companion = 'Jordan 🎬 ou Alexandra 👔';
      } else {
        rank = 'Rank D+ (Em Transição para C)';
        difficulty = 'SCAFFOLDED BICS 🛡️ (Diálogo com recasting rápido para destravar o medo)';
        companion = 'Miles ✈️ ou Jordan 🎬';
      }
    } else if (selectedProfile === 'p4') {
      rank = 'Rank B (Avançado)';
      difficulty = 'CALP & EXECUTIVE 💼 (Vocabulário corporativo, negociação e apresentações)';
      companion = 'Alexandra 👔 (The Vanguard Strategist)';
    } else if (selectedProfile === 'p5') {
      rank = 'Rank A/S (Soberania)';
      difficulty = 'SOVEREIGN REFINEMENT 👑 (Ironia nativa, ritmo acelerado e alta retórica)';
      companion = 'Prof. Hayes 📚 ou Alexandra 👔';
    }

    return { rank, difficulty, companion, advice };
  };

  const calibration = calculateCalibration();
  const canCalculate = selectedPainState !== null && selectedProfile !== null && isReflexComplete;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-green-500 selection:text-black">
      {/* Seção 1 - Hero */}
      <section className="relative py-24 px-6 flex flex-col items-center text-center bg-gradient-to-b from-green-950/30 via-gray-950 to-gray-950 border-b border-gray-900">
        <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-sm px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
          ⚡ Método MANA 3.0 • Aquisição Natural Acelerada
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 max-w-4xl leading-tight tracking-tight">
          "Você não estuda para falar. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">
            Você fala — do jeito que der — para aprender.
          </span>"
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-6 max-w-2xl font-light italic">
          — Gabe (Gabriel Lima)
        </p>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl leading-relaxed">
          Isso é o que nenhum cursinho de inglês te conta. E é exatamente por isso que, depois de anos estudando regras que você nunca usou, a sua língua ainda congela quando você precisa falar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => {
              document.getElementById('calibracao-pre-chat')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full transition-transform hover:scale-105 shadow-[0_0_25px_rgba(34,197,94,0.4)]"
          >
            Fazer Minha Calibração Pré-Chat (5 min) →
          </button>
          <button 
            onClick={() => {
              document.getElementById('horizonte-tempo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 font-medium py-4 px-8 rounded-full transition-colors"
          >
            Entender o Plano de 6 a 8 Meses
          </button>
        </div>
      </section>

      {/* Seção 2 - O Horizonte dos 6 a 8 Meses */}
      <section id="horizonte-tempo" className="py-20 px-6 max-w-6xl mx-auto border-b border-gray-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-green-400 font-mono text-sm tracking-wider uppercase">Sem Promessas Milagrosas • Sem Anos de Enrolação</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            A Meta Real: Comunicação Autônoma em 6 a 8 Meses
          </h2>
          <p className="text-gray-400 text-lg">
            Aprender uma língua não leva 5 anos. Leva 5 anos quando a escola lucra com a sua permanência. No MANA, você treina 15 minutos diários com sua Companion de IA e lapida semanalmente com Gabe.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-3">🧊 ➔ 💧</div>
              <span className="text-xs font-mono text-green-400 uppercase tracking-wider font-semibold">Mês 1 ao 2 • Platô 1</span>
              <h3 className="text-xl font-bold mt-1 mb-2">O Descongelamento</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Fim do pânico e da vergonha. Você adquire os primeiros 350 chunks essenciais com apoio visual massivo de emojis (Baby Mode).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-500 font-mono">
              Resultado: Responde rápido sem travar.
            </div>
          </div>

          <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-3">⚡ 🗣️</div>
              <span className="text-xs font-mono text-green-400 uppercase tracking-wider font-semibold">Mês 3 ao 5 • Platôs 2 e 3</span>
              <h3 className="text-xl font-bold mt-1 mb-2">O Motor do BICS</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Fluência conversacional do dia a dia. Você domina conectores naturais e narra histórias em viagens e imprevistos sem tradução mental.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-500 font-mono">
              Resultado: Bate-papo espontâneo e livre.
            </div>
          </div>

          <div className="bg-gradient-to-b from-green-950/40 to-gray-900 p-6 rounded-2xl border border-green-500/60 shadow-[0_0_20px_rgba(34,197,94,0.15)] flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-3">🎯 💼</div>
              <span className="text-xs font-mono text-green-400 uppercase tracking-wider font-bold">Mês 6 ao 8 • O Cume B2</span>
              <h3 className="text-xl font-bold mt-1 mb-2 text-white">Autonomia Real</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                A meta central conquistada: independência para conduzir reuniões em inglês, defender argumentos contrários com sutileza e resolver crises.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-green-800/60 text-xs text-green-400 font-mono font-semibold">
              Meta atingida: Falante independente!
            </div>
          </div>

          <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-3">👑 ✨</div>
              <span className="text-xs font-mono text-yellow-400 uppercase tracking-wider font-semibold">Mês 8 em Diante</span>
              <h3 className="text-xl font-bold mt-1 mb-2">Lapidação Soberana</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                A partir daqui, é a arte de refinar: ritmo de fala nativo (stress-timed), humor, ironia e elegância executiva com mentoria de Gabe.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-yellow-500/70 font-mono">
              Objetivo: Nível C1/C2 de Soberania.
            </div>
          </div>
        </div>
      </section>

      {/* Seção 3 - O Problema: O Golpe do Aluno Eterno */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-b border-gray-900">
        <h2 className="text-3xl font-bold text-center mb-12">Por que você ainda não fala inglês — a resposta honesta</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span>💼</span> "O Negociador"</h3>
            <p className="text-gray-400 leading-relaxed">
              O modelo tradicional de franquia precisa que você pague mensalidade por 3 a 5 anos. Criar módulos infinitos é uma escolha deliberada de negócio, não de pedagogia.
            </p>
          </div>
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span>🔄</span> "A Ilusão do Progresso"</h3>
            <p className="text-gray-400 leading-relaxed">
              Você preenche lacunas, acerta quizzes de gramática e faz 600 dias de streak no aplicativo. Mas quando o chefe ou o gringo fala "Hey, what do you think?", a mente fica branca.
            </p>
          </div>
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span>🧠</span> "O Paradoxo da Aquisição"</h3>
            <p className="text-gray-400 leading-relaxed">
              Estudar uma língua não é o mesmo que adquirir uma língua. Nenhuma criança estuda gramática para começar a falar. O cérebro só assimila através de imersão e inferência contextual.
            </p>
          </div>
        </div>
      </section>

      {/* Seção 4 - A Montanha B2 */}
      <section className="py-20 px-6 bg-gray-900/40 border-b border-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">O Mapa que nenhum curso te mostra</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            O vocabulário da autonomia não é infinito. São 5 platôs, 2.500 chunks essenciais e um cume visível:
          </p>
          <div className="space-y-4">
            {[
              { icon: '🏔️', title: 'Platô 1: Descongelamento (Rank E → D)', chunks: '350 chunks sonoros' },
              { icon: '🏔️', title: 'Platô 2: Motor do BICS (Rank D → C)', chunks: '650 chunks sonoros' },
              { icon: '🏔️', title: 'Platô 3: Narrativa & Gestão de Imprevistos (Rank C → B)', chunks: '750 chunks sonoros' },
              { icon: '🏔️', title: 'Platô 4: Negociação Executiva (Rank B → Cume B2)', chunks: '750 chunks sonoros' },
              { icon: '👑', title: 'O Cume do Mestre: Lapidação Soberana (Rank A/S)', chunks: '1.000 chunks avançados' },
            ].map((plateau, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{plateau.icon}</span>
                  <span className="font-semibold text-lg">{plateau.title}</span>
                </div>
                <span className="text-green-400 font-mono font-medium">{plateau.chunks}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 5 - Calibração Cognitiva Pré-Chat (< 5 minutos) */}
      <section id="calibracao-pre-chat" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-green-400 font-mono text-sm tracking-wider uppercase">Calibração Cognitiva Pré-Chat</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">
            Descubra seu Rank Inicial & Calibre a Dificuldade
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Para evitar qualquer frustração ou pânico na primeira conversa, nossa IA calibrará a dificuldade exata da cena antes de você entrar no chat.
          </p>
        </div>

        {/* Passo 1: O Teste do Espelho Mental */}
        <div className="mb-12 bg-gray-900/60 p-8 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-green-600 text-white font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">1</span>
            <h3 className="text-2xl font-bold">O Teste do Espelho Mental: Qual é o seu travamento real?</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { id: 1, text: '🤯 "Estudo há anos, entendo bem quando leio, mas travo na hora de falar."' },
              { id: 2, text: '😩 "Entendo quase tudo que ouço, mas para responder demoro muito tempo pensando."' },
              { id: 3, text: '💼 "Preciso do inglês para crescer profissionalmente, mas tenho medo de errar."' },
              { id: 4, text: '🌐 "Já falo razoavelmente, mas quero soar refinado, natural e elegante."' },
            ].map((pain) => (
              <button
                key={pain.id}
                onClick={() => setSelectedPainState(pain.id)}
                className={`p-6 text-left rounded-xl border transition-all duration-300 ${
                  selectedPainState === pain.id 
                    ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-[1.02]' 
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/80'
                }`}
              >
                <span className="text-base text-gray-200">{pain.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Passo 2: Os 5 Perfis MANA */}
        <div className="mb-12 bg-gray-900/60 p-8 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-green-600 text-white font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">2</span>
            <h3 className="text-2xl font-bold">Qual perfil descreve mais honestamente o seu momento?</h3>
          </div>
          <div className="space-y-3">
            {[
              { id: 'p1', icon: '🤣', title: 'P1: Zero', desc: 'Nunca estudei a sério ou esqueci tudo. Preciso de apoio total e zero pressão.' },
              { id: 'p2', icon: '😓', title: 'P2: Básico Traumatizado', desc: 'Já fiz cursos no passado, aprendi pouca coisa e peguei trauma de cobrança gramatical.' },
              { id: 'p3', icon: '🔇', title: 'P3: Intermediário Bloqueado', desc: 'Entendo bem, leio artigos e vejo vídeos com legenda, mas minha fala empaca por medo.' },
              { id: 'p4', icon: '💼', title: 'P4: Profissional em Lapidação', desc: 'Já consigo me virar no trabalho, mas falta precisão executiva, naturalidade e fluidez.' },
              { id: 'p5', icon: '👑', title: 'P5: Soberania C1/C2', desc: 'Já falo com facilidade. Busco ritmo nativo, humor, diplomacia executiva e maestria.' },
            ].map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfile(profile.id)}
                className={`w-full p-5 text-left rounded-xl border transition-all duration-300 flex items-start gap-4 ${
                  selectedProfile === profile.id 
                    ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-[1.01]' 
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/80'
                }`}
              >
                <span className="text-3xl mt-0.5">{profile.icon}</span>
                <div>
                  <h4 className="font-bold text-lg text-white">{profile.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{profile.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Passo 3: Micro-Desafios de Reflexo Visual */}
        <div className="mb-12 bg-gray-900/60 p-8 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-green-600 text-white font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">3</span>
            <div>
              <h3 className="text-2xl font-bold">Micro-Teste de Reflexo & Inferência Visual (Sem Tradução)</h3>
              <p className="text-sm text-gray-400 mt-1">Veja os emojis e a situação. Como você reagiria instintivamente?</p>
            </div>
          </div>
          <div className="space-y-6">
            {reflexChallenges.map((challenge) => (
              <div key={challenge.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{challenge.promptEmoji}</span>
                  <span className="font-semibold text-gray-200 text-sm md:text-base">{challenge.situation}</span>
                </div>
                <div className="space-y-2 mt-3">
                  {challenge.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleReflexSelect(challenge.id, opt.points)}
                      className={`w-full text-left p-3.5 rounded-lg border text-sm transition-colors ${
                        reflexAnswers[challenge.id] === opt.points
                          ? 'border-green-500 bg-green-950/40 text-green-300 font-medium'
                          : 'border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700'
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

        {/* Card de Diagnóstico & Dificuldade Calibrada */}
        {canCalculate && (
          <div className="bg-gradient-to-b from-green-950/60 to-gray-900 p-8 rounded-2xl border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-fade-in text-center">
            <span className="bg-green-500 text-black font-mono text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Diagnóstico de Calibração Concluído
            </span>
            <h3 className="text-2xl md:text-3xl font-bold mt-4 mb-2">
              Seu Rank Inicial Calibrado: <span className="text-green-400">{calibration.rank}</span>
            </h3>
            <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm">
              Sua AIDA iniciará no modo calibrado para você nunca travar nem se sentir pressionado:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-8">
              <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 uppercase font-mono block">Dificuldade da Cena:</span>
                <span className="font-semibold text-sm text-green-300 mt-1 block">{calibration.difficulty}</span>
              </div>
              <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 uppercase font-mono block">Companion Recomendado:</span>
                <span className="font-semibold text-sm text-yellow-300 mt-1 block">{calibration.companion}</span>
              </div>
            </div>

            <a
              href={`/login?profile=${selectedProfile}&rank=${encodeURIComponent(calibration.rank)}`}
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-extrabold py-5 px-10 rounded-full text-lg transition-transform hover:scale-105 shadow-[0_0_25px_rgba(34,197,94,0.5)]"
            >
              Iniciar Chat com Minha Dificuldade Calibrada →
            </a>
            <p className="mt-4 text-xs text-gray-400 font-mono">
              ⚡ Suporte a voz com Google TTS nativo e reconhecimento oral via Whisper ativados.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-900 text-center text-gray-500 text-xs">
        <p>MANA 3.0 • Método de Aquisição Natural Acelerada • Desenvolvido por Gabe (Gabriel Lima)</p>
        <p className="mt-2">Arquitetura de Duas Fases • Imersão Cognitiva Desacoplada do HUD de Progresso</p>
      </footer>
    </div>
  );
};

export default LandingPageVSL;

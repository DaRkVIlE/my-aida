import React, { useState } from 'react';

const LandingPageVSL: React.FC = () => {
  const [selectedPainState, setSelectedPainState] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const showCTA = selectedPainState !== null && selectedProfile !== null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Seção 1 - Hero */}
      <section className="relative py-20 px-6 flex flex-col items-center text-center bg-gradient-to-b from-green-950/20 to-gray-950">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-4xl leading-tight">
          "Você não estuda para falar. Você fala — do jeito que der — para aprender."
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl font-light italic">
          — Gabe (Gabriel Lima)
        </p>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl">
          Isso é o que nenhum curso te conta. E é exatamente por isso que você ainda não está falando.
        </p>
        <button 
          onClick={() => {
            document.getElementById('quiz-pain')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full transition-transform hover:scale-105"
        >
          Descobrir o Meu Perfil →
        </button>
      </section>

      {/* Seção 2 - O Problema */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Por que você ainda não fala inglês — a resposta honesta</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-bold mb-4">💼 "O Negociador"</h3>
            <p className="text-gray-400">Cursos são projetados para durar o máximo possível. Módulos infinitos = mensalidades infinitas.</p>
          </div>
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-bold mb-4">🔄 "A Ilusão do Progresso"</h3>
            <p className="text-gray-400">Você aprende regras que não usa. Quando abre a boca, a língua congela.</p>
          </div>
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-bold mb-4">🧠 "O Paradoxo"</h3>
            <p className="text-gray-400">Estudar uma língua não é o mesmo que adquirir uma língua. Você foi ensinado a estudar.</p>
          </div>
        </div>
      </section>

      {/* Seção 3 - A Montanha B2 */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">O Mapa que nenhum curso te mostra</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            O MANA não é infinito. São 5 platôs, 2.500 chunks, e um cume visível. Você vai saber exatamente onde está e quanto falta.
          </p>
          <div className="space-y-4">
            {[
              { icon: '🏔️', title: 'Platô 1: Descongelamento (E→D)', chunks: '350 chunks' },
              { icon: '🏔️', title: 'Platô 2: Motor do BICS (D→C)', chunks: '650 chunks' },
              { icon: '🏔️', title: 'Platô 3: Narrativa e Imprevistos (C→B)', chunks: '750 chunks' },
              { icon: '🏔️', title: 'Platô 4: Negociação Executiva (B→B2)', chunks: '750 chunks' },
              { icon: '👑', title: 'Cume: Lapidação C1/C2 (S-Rank Soberano)', chunks: '1.000 chunks' },
            ].map((plateau, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors">
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

      {/* Seção 4 - Quiz: Dores */}
      <section id="quiz-pain" className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Qual é o seu travamento? Seja honesto.</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { id: 1, text: '🤯 "Eu estudo há anos e ainda travo na hora de falar"' },
            { id: 2, text: '😩 "Eu entendo tudo mas não consigo responder na hora certa"' },
            { id: 3, text: '💼 "Preciso do inglês no trabalho mas tenho vergonha de errar"' },
            { id: 4, text: '🌐 "Quero refinar meu inglês — já falo, mas quero soberania"' },
          ].map((pain) => (
            <button
              key={pain.id}
              onClick={() => setSelectedPainState(pain.id)}
              className={`p-6 text-left rounded-xl border transition-all duration-300 ${
                selectedPainState === pain.id 
                  ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-[1.02]' 
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">{pain.text}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Seção 5 - Quiz: Perfis */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Onde você está hoje? Escolha o perfil mais honesto:</h2>
        <div className="space-y-4">
          {[
            { id: 'p1', icon: '🤣', title: 'Zero', desc: 'Nunca estudei sério. Parece que é pra sempre um dia.' },
            { id: 'p2', icon: '😓', title: 'Básico Traumatizado', desc: 'Já tentei alguns cursos. Aprendi pouco. Me sinto envergonhado.' },
            { id: 'p3', icon: '🔇', title: 'Intermediário Bloqueado', desc: 'Entendo inglês. Consigo ler. Mas na hora de falar, a mente some.' },
            { id: 'p4', icon: '💼', title: 'Profissional em Lapidação', desc: 'Já me viro. Preciso de precisão, fluidez e vocabulário executivo.' },
            { id: 'p5', icon: '👑', title: 'Soberania C1/C2', desc: 'Já falo bem. Quero o refinamento de nativo.' },
          ].map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile.id)}
              className={`w-full p-6 text-left rounded-xl border transition-all duration-300 flex items-start gap-5 ${
                selectedProfile === profile.id 
                  ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-[1.01]' 
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800'
              }`}
            >
              <span className="text-3xl mt-1">{profile.icon}</span>
              <div>
                <h3 className="font-bold text-xl">{profile.title}</h3>
                <p className="text-gray-400 mt-2">{profile.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Seção 6 - CTA Final */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center min-h-[300px]">
        <div className={`transition-all duration-1000 transform ${showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <h2 className="text-3xl font-bold mb-4">Pronto para subir a montanha?</h2>
          <p className="text-xl text-gray-400 mb-10">
            A triagem de 5 minutos vai revelar o seu Rank inicial, seu Companion ideal e seu Plano de Ataque personalizado.
          </p>
          <a
            href="/triagem"
            className="inline-block bg-green-600 hover:bg-green-500 text-white font-bold py-5 px-10 rounded-full text-xl transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse"
          >
            Iniciar Minha Triagem MANA →
          </a>
          <p className="mt-6 text-sm text-gray-500">
            Sem promessas de fluência em 30 dias. Com mapa real até o B2.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPageVSL;

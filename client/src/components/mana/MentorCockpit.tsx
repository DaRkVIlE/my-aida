import React from 'react';

interface MentorCockpitProps {
  className?: string;
  totalStudents?: number;
}

const MentorCockpit: React.FC<MentorCockpitProps> = ({ className = '', totalStudents = 0 }) => {
  return (
    <div className={`w-full min-h-screen bg-gray-950 text-gray-100 p-6 ${className}`}>
      {/* 1. Header */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            🧠 Cockpit do Mestre
          </h1>
          <p className="text-gray-400 mt-2">Visão em tempo real da sua turma</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-full px-6 py-2 flex items-center gap-3 shadow-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-gray-200">Alunos Ativos:</span>
          <span className="font-mono text-green-400 text-lg">{totalStudents}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Alertas de Filtro Afetivo */}
          <section className="bg-gray-900 border border-red-900/50 rounded-xl p-6 shadow-sm transition-all hover:border-red-900/80">
            <h2 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4">
              ⚠️ Filtro Afetivo Alto
            </h2>
            <div className="bg-gray-950 rounded-lg p-8 text-center border border-gray-800">
              <p className="text-gray-400">Nenhum aluno com filtro afetivo alto hoje. 🌟</p>
            </div>
          </section>

          {/* 4. Boss Raids Pendentes */}
          <section className="bg-gray-900 border border-purple-900/50 rounded-xl p-6 shadow-sm transition-all hover:border-purple-900/80">
            <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2 mb-4">
              ⚔️ Boss Raids Aguardando Debriefing
            </h2>
            <div className="bg-gray-950 rounded-lg p-8 text-center border border-gray-800">
              <p className="text-gray-400">Nenhuma Boss Raid pendente</p>
            </div>
          </section>

          {/* 3. Top Performers esta semana */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm transition-all hover:border-gray-700">
            <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2 mb-4">
              🏆 Top Jogadores da Semana
            </h2>
            <div className="bg-gray-950 rounded-lg p-8 text-center border border-gray-800">
              <p className="text-gray-400 mb-4">Nenhum dado disponível ainda</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-gray-900 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Rank</th>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">XP esta semana</th>
                      <th className="px-4 py-3">Pure Runs</th>
                      <th className="px-4 py-3 rounded-tr-lg">Platô atual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder content would go here */}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Coluna 3 */}
        <div className="space-y-6">
          {/* 5. Progresso Geral da Turma */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm transition-all hover:border-gray-700">
            <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2 mb-6">
              📊 Progresso Agregado
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex flex-col justify-center items-center text-center">
                <span className="text-gray-500 text-xs uppercase mb-2">Total de Chunks Adquiridos</span>
                <span className="text-2xl font-bold text-gray-200">—</span>
              </div>
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex flex-col justify-center items-center text-center">
                <span className="text-gray-500 text-xs uppercase mb-2">Média de Sessões/Semana</span>
                <span className="text-2xl font-bold text-gray-200">—</span>
              </div>
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex flex-col justify-center items-center text-center">
                <span className="text-gray-500 text-xs uppercase mb-2">Taxa de Pure Run</span>
                <span className="text-2xl font-bold text-gray-200">—%</span>
              </div>
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex flex-col justify-center items-center text-center">
                <span className="text-gray-500 text-xs uppercase mb-2">Nível Médio da Turma</span>
                <span className="text-2xl font-bold text-gray-200">—</span>
              </div>
            </div>
          </section>

          {/* 6. Atividade Recente (Feed) */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm flex-1 transition-all hover:border-gray-700">
            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2 mb-4">
              📝 Log de Atividade Recente
            </h2>
            <div className="bg-gray-950 rounded-lg p-6 text-center border border-gray-800 h-64 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Nenhuma atividade registrada ainda. Os alunos aparecerão aqui assim que iniciarem as sessões.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MentorCockpit;

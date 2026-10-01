import React from 'react';

export type PlayerRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

interface PlayerRankBadgeProps {
  rank: PlayerRank;
  size?: 'sm' | 'md' | 'lg';
}

const rankConfig = {
  E: { color: 'bg-gray-600', name: 'Iniciante' },
  D: { color: 'bg-green-700', name: 'Aprendiz' },
  C: { color: 'bg-blue-600', name: 'Conversational Player' },
  B: { color: 'bg-purple-600', name: 'Avançado' },
  A: { color: 'bg-yellow-500', name: 'Mestre' },
  S: { color: 'bg-red-500 animate-pulse', name: 'Soberano' },
};

const sizeConfig = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-lg',
};

const PlayerRankBadge: React.FC<PlayerRankBadgeProps> = ({ rank, size = 'md' }) => {
  const config = rankConfig[rank] || rankConfig.E;
  const sizeClass = sizeConfig[size] || sizeConfig.md;

  return (
    <div className="relative group inline-block">
      <div
        className={`flex items-center justify-center rounded-full font-bold text-white shadow-lg ${config.color} ${sizeClass}`}
      >
        {rank}
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-50">
        {config.name}
      </div>
    </div>
  );
};

export default PlayerRankBadge;

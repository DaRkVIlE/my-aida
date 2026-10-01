import React, { useState } from 'react';
import PlayerRankBadge, { PlayerRank } from './PlayerRankBadge';
import { usePlayerProfile } from '~/hooks/mana/usePlayerProfile';

export interface PlayerHudProps {
  userId: string;
  isPureRun?: boolean;
  className?: string;
}

const xpThresholds = {
  E: 0,
  D: 1000,
  C: 3000,
  B: 7000,
  A: 14000,
  S: 25000,
};

const getNextRankThreshold = (currentRank: PlayerRank) => {
  const ranks: PlayerRank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
  const currentIndex = ranks.indexOf(currentRank);
  if (currentIndex < ranks.length - 1) {
    return xpThresholds[ranks[currentIndex + 1]];
  }
  return xpThresholds.S;
};

const getPrevRankThreshold = (currentRank: PlayerRank) => {
  return xpThresholds[currentRank];
};

const PlayerHud: React.FC<PlayerHudProps> = ({ userId, isPureRun = false, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { profile, isLoading } = usePlayerProfile(userId);

  const defaultProfile = {
    userId: userId || 'player',
    playerRank: 'E' as PlayerRank,
    currentXp: 0,
    streakDays: 0,
    totalPureRuns: 0,
    currentMana: 100,
    maxMana: 100,
    conqueredModules: [],
  };

  const activeProfile = profile || defaultProfile;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const {
    playerRank,
    currentXp,
    streakDays,
    totalPureRuns,
    currentMana,
    maxMana,
    conqueredModules,
  } = activeProfile;

  const nextThreshold = getNextRankThreshold(playerRank);
  const currentThreshold = getPrevRankThreshold(playerRank);
  const xpProgress = nextThreshold > currentThreshold 
    ? Math.max(0, Math.min(100, ((currentXp - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    : 100;
  
  const manaProgress = maxMana > 0 ? (currentMana / maxMana) * 100 : 0;

  const modules = ['M1', 'M2', 'M3', 'M4', 'M5'];

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isExpanded ? 'w-72' : 'w-auto'} ${className}`}>
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl p-4 text-white">
        
        <button 
          onClick={toggleExpand}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          title={isExpanded ? 'Minimize HUD' : 'Expand HUD'}
        >
          ⚔️
        </button>

        {isExpanded ? (
          <div className="flex flex-col space-y-4 pt-2">
            <div className="flex items-center space-x-3">
              <PlayerRankBadge rank={playerRank} size="lg" />
              <div>
                <div className="font-bold text-lg leading-tight">Player</div>
                <div className="text-xs text-gray-400">🛡️ Mana Agent</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-300">XP</span>
                <span className="text-gray-400">{currentXp} / {nextThreshold}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm bg-gray-800/50 rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <span>🔥</span>
                <span className="text-gray-300">{streakDays} dias</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💎</span>
                <span className="text-gray-300">{totalPureRuns} Pure Runs</span>
              </div>
              <div className="col-span-2 mt-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">🌀 Mana</span>
                  <span className="text-blue-300">{currentMana}/{maxMana}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${manaProgress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700/50">
              <div className="text-xs text-gray-400 mb-2">Montanha B2</div>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-700 -z-10 -translate-y-1/2"></div>
                {modules.map((mod, index) => {
                  const isConquered = conqueredModules.includes(mod);
                  return (
                    <div key={mod} className="flex flex-col items-center" title={`Platô ${index + 1}: ${mod}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isConquered ? 'bg-green-600 text-white shadow-[0_0_8px_rgba(22,163,74,0.6)]' : 'bg-gray-700 text-gray-400'}`}>
                        {isConquered ? '🏔️' : '⬜'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2">
              {isPureRun ? (
                <div className="bg-green-900/40 text-green-400 text-xs font-bold py-1.5 px-2 rounded-md border border-green-700/50 flex items-center justify-center">
                  ⚡ PURE RUN ATIVO — +50% XP
                </div>
              ) : (
                <div className="bg-gray-800 text-gray-400 text-xs py-1.5 px-2 rounded-md border border-gray-700/50 text-center">
                  💡 Evite dicas para ativar Pure Run
                </div>
              )}
            </div>
            
          </div>
        ) : (
          <div className="flex items-center space-x-3 pr-4">
            <PlayerRankBadge rank={playerRank} size="md" />
            <div className="flex flex-col justify-center">
              <div className="w-24 bg-gray-800 rounded-full h-1.5 mb-1">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${xpProgress}%` }}></div>
              </div>
              <div className="text-[10px] text-gray-400">{currentXp} XP</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerHud;

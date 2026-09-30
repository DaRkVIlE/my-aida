/**
 * MANA 3.0 — Gamification Data Schemas
 * Arquitetura de dados para o sistema de progressão, missões, roadmap e memória de aquisição.
 * Autoria: Gabe (Gabriel Lima) & Orion
 */

export type PlayerRankTier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface PlayerRankInfo {
  tier: PlayerRankTier;
  title: string;
  cefrEquivalent: string;
  minXpRequired: number;
  perks: string[];
}

export type AcquisitionStatus = 'nova' | 'em_processo' | 'adquirida';

export interface AcquisitionMemoryItem {
  id: string;
  chunk: string;
  category: 'idiom' | 'phrasal_verb' | 'collocation' | 'connector' | 'situational';
  status: AcquisitionStatus;
  firstSeenAt: string; // ISO-8601
  lastUsedAt?: string; // ISO-8601
  frequencyUsed: number;
  spontaneousContexts: string[]; // Contextos onde o aluno usou sem estímulo direto da IA
  xpAwarded: number;
}

export type QuestType = 'audio_echo' | 'situational_sprint' | 'spontaneous_recall' | 'boss_raid';

export interface DailyQuest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  xpReward: number;
  manaReward: number;
  hintsUsedCount: number;
  isPureRun: boolean; // true se completou sem utilizar dicas de tradução
  pureRunBonusXp: number;
  assignedAt: string; // ISO-8601
  expiresAt: string;  // ISO-8601
}

export interface BossRaidScenario {
  id: string;
  rankRequirement: PlayerRankTier;
  title: string;
  narrativeContext: string;
  pressureLevel: 'moderate' | 'high' | 'intense';
  objectives: string[];
  maxTurns: number;
  minAcquiredStructures: number;
  passed: boolean;
  evaluationSummary?: string;
  reviewedByGabe?: boolean;
}

/**
 * Ramificações de Variação de um Nó Conquistado (Skill Tree)
 */
export type BranchStyle = 'street_slang' | 'corporate_polite' | 'regional_idiom' | 'debate_nuance';

export interface MasteryBranch {
  branchId: string;
  title: string;
  style: BranchStyle;
  description: string;
  sampleChunks: string[];
  isUnlocked: boolean;
  isConquered: boolean;
  masteryXpReward: number;
}

/**
 * Módulos Finitos da Montanha do B2
 */
export interface RoadmapModuleNode {
  moduleId: string;
  moduleNumber: number;
  title: string;
  levelTarget: 'A1' | 'A2' | 'B1' | 'B2' | 'C1_refinement';
  description: string;
  totalChunksTarget: number;
  conqueredChunksCount: number;
  isUnlocked: boolean;
  isConquered: boolean;
  masteryBranches: MasteryBranch[];
}

/**
 * Entrada no Mural dos Jogadores (Ranking Público)
 */
export interface PlayerLeaderboardEntry {
  userId: string;
  studentName: string;
  avatarUrl?: string;
  rank: PlayerRankTier;
  currentXp: number;
  conqueredModulesCount: number;
  pureRunCount: number;
  streakDays: number;
  position: number;
}

/**
 * Perfil Gamificado Completo do Jogador
 */
export interface PlayerProfileGamified {
  userId: string;
  studentName: string;
  manaProfile: 'P1_zero' | 'P2_travado' | 'P3_intermediario' | 'P4_lapidacao_b2' | 'P5_soberania_c1';
  assignedPersona: 'jordan' | 'alexandra' | 'miles' | 'zack' | 'prof_hayes';
  rank: PlayerRankTier;
  currentXp: number;
  currentMana: number;
  maxMana: number;
  streakDays: number;
  totalPureRuns: number;
  lastActiveSession: string; // ISO-8601
  dailyQuests: DailyQuest[];
  roadmapModules: RoadmapModuleNode[];
  acquisitionLedger: AcquisitionMemoryItem[];
  bossRaidsCompleted: BossRaidScenario[];
}

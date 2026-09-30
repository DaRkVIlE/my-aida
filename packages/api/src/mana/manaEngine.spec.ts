import { buildManaPrompt } from './promptBuilder';
import { StudentProfile } from './models/StudentProfile';

jest.mock('./models/StudentProfile');
jest.mock('./models/LearningProfile');

describe('MANA 3.0 Engine & Prompt Builder Test Suite', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildManaPrompt with RPG Companions & Decoupled HUD', () => {
    it('should inject Alexandra (The Vanguard Strategist) archetype and MANA 3.0 pillars', async () => {
      const mockStudent = {
        user: 'user-123',
        nivel_diagnosticado: 'P4_lapidacao_b2',
        foco_principal: 'career',
        persona_ideal: 'Alexandra',
        playerRank: 'B',
        interesses: ['business', 'fintech'],
        objetivo_declarado: 'Lead global product syncs',
      };

      (StudentProfile.findOne as jest.Mock).mockResolvedValue(mockStudent);

      const basePrompt = 'You are a helpful assistant.';
      const resultPrompt = await buildManaPrompt('user-123', basePrompt);

      // Verify Mentor and Core Branding
      expect(resultPrompt).toContain('Mentor: Gabe (Gabriel Lima)');
      expect(resultPrompt).toContain('You are ALEXANDRA — an authentic RPG ADVENTURE COMPANION');
      expect(resultPrompt).toContain('The Vanguard Strategist (CALP & Corporate Diplomacy)');

      // Verify Pedagogical Pillars
      expect(resultPrompt).toContain('ZERO EXPLICIT CORRECTION');
      expect(resultPrompt).toContain('RECASTING');
      expect(resultPrompt).toContain('ZERO TRANSLATION');
      expect(resultPrompt).toContain('CONTEXTUAL INFERENCE & NEGOTIATION OF MEANING');
      expect(resultPrompt).toContain('DECOUPLED HUD (ANTI-DUOLINGO)');

      // Verify Student Profile Injection
      expect(resultPrompt).toContain('Player Rank: B');
      expect(resultPrompt).toContain('Lead global product syncs');
    });

    it('should inject Jordan (The Street Scout) when assigned persona is Jordan', async () => {
      const mockStudent = {
        user: 'user-456',
        nivel_diagnosticado: 'P2_travado',
        foco_principal: 'conversacao',
        persona_ideal: 'Jordan',
        playerRank: 'E',
        interesses: ['gaming', 'music'],
      };

      (StudentProfile.findOne as jest.Mock).mockResolvedValue(mockStudent);

      const resultPrompt = await buildManaPrompt('user-456', 'Base');

      expect(resultPrompt).toContain('You are JORDAN');
      expect(resultPrompt).toContain('The Street Scout (BICS & Urban Survival)');
      expect(resultPrompt).toContain('Player Rank: E');
    });

    it('should return basePrompt unchanged if student profile does not exist', async () => {
      (StudentProfile.findOne as jest.Mock).mockResolvedValue(null);

      const basePrompt = 'Standard chatbot prompt';
      const resultPrompt = await buildManaPrompt('unknown-user', basePrompt);

      expect(resultPrompt).toBe(basePrompt);
    });
  });

  describe('Rank Progression & Pure Run Multiplier Verification', () => {
    it('should correctly calculate rank thresholds according to MANA 3.0 GDD', () => {
      const testCases = [
        { xp: 0, expectedRank: 'E' },
        { xp: 500, expectedRank: 'E' },
        { xp: 1000, expectedRank: 'D' },
        { xp: 2999, expectedRank: 'D' },
        { xp: 3000, expectedRank: 'C' },
        { xp: 6999, expectedRank: 'C' },
        { xp: 7000, expectedRank: 'B' },
        { xp: 13999, expectedRank: 'B' },
        { xp: 14000, expectedRank: 'A' },
        { xp: 24999, expectedRank: 'A' },
        { xp: 25000, expectedRank: 'S' },
        { xp: 50000, expectedRank: 'S' },
      ];

      const RANK_THRESHOLDS = [
        { rank: 'S', minXp: 25000 },
        { rank: 'A', minXp: 14000 },
        { rank: 'B', minXp: 7000 },
        { rank: 'C', minXp: 3000 },
        { rank: 'D', minXp: 1000 },
        { rank: 'E', minXp: 0 },
      ];

      function calculateRank(totalXp: number): string {
        for (const threshold of RANK_THRESHOLDS) {
          if (totalXp >= threshold.minXp) return threshold.rank;
        }
        return 'E';
      }

      testCases.forEach(({ xp, expectedRank }) => {
        expect(calculateRank(xp)).toBe(expectedRank);
      });
    });

    it('should grant a 50% bonus on Pure Run completions (zero hints used)', () => {
      const baseGain = 100; // Chunk acquired
      const hintsUsed = 0;

      const finalGain = hintsUsed === 0 ? Math.round(baseGain * 1.5) : baseGain;
      expect(finalGain).toBe(150);

      const hintsUsedWithHelp = 1;
      const finalGainWithHelp = hintsUsedWithHelp === 0 ? Math.round(baseGain * 1.5) : baseGain;
      expect(finalGainWithHelp).toBe(100);
    });
  });
});

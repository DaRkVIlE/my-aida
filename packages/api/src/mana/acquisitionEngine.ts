import mongoose from 'mongoose';
import { AcquisitionMemory, AcquisitionStatus } from './models/AcquisitionMemory';
import { Evidence } from './models/Evidence';
import { StudentProfile, PlayerRank } from './models/StudentProfile';

interface ExtractedLinguisticData {
  structures: string[];
  vocabulary_chunks: string[];
  is_spontaneous: boolean; // True if the student produced the structure without immediate copying
  confidence: number;
}

const RANK_THRESHOLDS: { rank: PlayerRank; minXp: number }[] = [
  { rank: 'S', minXp: 25000 },
  { rank: 'A', minXp: 14000 },
  { rank: 'B', minXp: 7000 },
  { rank: 'C', minXp: 3000 },
  { rank: 'D', minXp: 1000 },
  { rank: 'E', minXp: 0 },
];

/**
 * Calculates current Player Rank based on total accumulated XP.
 */
function calculateRank(totalXp: number): PlayerRank {
  for (const threshold of RANK_THRESHOLDS) {
    if (totalXp >= threshold.minXp) {
      return threshold.rank;
    }
  }
  return 'E';
}

/**
 * The core MANA 3.0 pedagogical and gamification engine.
 * Runs asynchronously after each conversation turn.
 * Uses an LLM to extract linguistic evidence, updates Acquisition Memory, awards XP,
 * and tracks Pure Runs and Player Rank progression.
 */
export async function runAcquisitionEngine(
  userId: string,
  studentMessage: string,
  agentResponse: string,
  conversationId?: string,
  hintsUsedInTurn: number = 0
) {
    const student = await StudentProfile.findOne({ user: userId });
    const studentLevel = student?.nivel_diagnosticado || 'P3_intermediario';

    // 1. Call LLM to extract linguistic data with dynamic level-scaled chunks and spontaneity detection
    const extracted = await extractLinguisticData(studentMessage, agentResponse, studentLevel);
    if (!extracted) return;

    let turnXpAwarded = 0;
    const itemsToProcess = [...extracted.structures, ...extracted.vocabulary_chunks];

    for (const item of itemsToProcess) {
      const cleanItem = item.trim().toLowerCase();
      if (!cleanItem || cleanItem.length < 2) continue;

      let memory = await AcquisitionMemory.findOne({ user: userId, structure_name: cleanItem });

      if (!memory) {
        memory = new AcquisitionMemory({
          user: userId,
          structure_name: cleanItem,
          structure_type: extracted.structures.includes(item) ? 'grammar' : 'vocabulary',
          status: 'NEW',
          introduced_at: new Date(),
          evidence_count: 0,
          confidence_level: 0,
          is_spontaneous: extracted.is_spontaneous,
          xp_awarded: 0,
        });
      }

      // 2. Create Evidence record
      const evidence = new Evidence({
        user: userId,
        acquisition_memory_id: memory._id,
        conversation_id: conversationId ? new mongoose.Types.ObjectId(conversationId) : null,
        context_used: studentMessage.substring(0, 200),
        confidence_score: extracted.confidence,
      });

      await evidence.save();

      // 3. Update Memory stats and state machine
      memory.evidence_count += 1;
      memory.confidence_level = (memory.confidence_level + extracted.confidence) / 2;
      memory.last_seen = new Date();
      memory.last_context = studentMessage;

      // Anti-Farming State Machine:
      // A structure is ACQUIRED only when used spontaneously with high confidence
      let previousStatus = memory.status;
      if (extracted.is_spontaneous && memory.evidence_count >= 2 && memory.confidence_level > 0.65) {
        memory.status = 'ACQUIRED';
      } else if (memory.evidence_count > 0) {
        memory.status = 'LEARNING';
      }

      // XP Allocation:
      // NEW -> LEARNING: +25 XP
      // LEARNING -> ACQUIRED: +100 XP
      if (previousStatus !== 'ACQUIRED' && memory.status === 'ACQUIRED') {
        const xpGain = 100;
        memory.xp_awarded += xpGain;
        turnXpAwarded += xpGain;
      } else if (previousStatus === 'NEW' && memory.status === 'LEARNING') {
        const xpGain = 25;
        memory.xp_awarded += xpGain;
        turnXpAwarded += xpGain;
      }

      await memory.save();
    }

    // 4. Pure Run Bonus calculation
    const isPureRun = hintsUsedInTurn === 0;
    if (turnXpAwarded > 0 && isPureRun) {
      // 50% bonus on earned XP for zero-hint performance
      turnXpAwarded = Math.round(turnXpAwarded * 1.5);
    }

    // 5. Update StudentProfile with XP and Player Rank
    if (turnXpAwarded > 0 || isPureRun) {
      const student = await StudentProfile.findOne({ user: userId });
      if (student) {
        student.currentXp += turnXpAwarded;
        if (isPureRun && turnXpAwarded > 0) {
          student.totalPureRuns += 1;
        }

        // Check Rank level-up
        const newRank = calculateRank(student.currentXp);
        if (newRank !== student.playerRank) {
          console.log(`[MANA 3.0] Student ${userId} ranked up from ${student.playerRank} to ${newRank}!`);
          student.playerRank = newRank;
        }

        await student.save();
      }
    }
  } catch (error) {
    console.error('[MANA 3.0] Acquisition Engine Error:', error);
  }
}

/**
 * Calls Groq (or OpenAI) to extract JSON structured output with spontaneity validation.
 */
async function extractLinguisticData(
  studentMsg: string,
  agentMsg: string,
  studentLevel: string = 'P3_intermediario'
): Promise<ExtractedLinguisticData | null> {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[MANA 3.0] No API key configured for linguistic extraction.');
    return null;
  }

  const endpoint = process.env.GROQ_API_KEY
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const model = process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

  const systemPrompt = `You are the MANA 3.0 Dynamic Linguistic Acquisition & Anti-Farming Engine.
The student is currently at level: "${studentLevel}".
Chunks and structures are NOT rigid or truncated; they adapt dynamically to the student's proficiency level:
- For P1 (Beginner): Extract foundational 1-2 word functional chunks and core vocabulary.
- For P2 (Elementary): Extract multi-word everyday expressions and basic connectors.
- For P3 (Intermediate): Extract natural conversational collocations, discourse connectors, and spoken idioms.
- For P4 (Upper-Intermediate): Extract professional collocations, CALP patterns, and boardroom negotiation chunks.
- For P5 (Advanced/Sovereign): Extract nuanced rhetoric, cultural idioms, and advanced stylistic collocations.

Analyze the conversation turn between the Student and the AI Agent.
Identify:
1. "structures": grammatical patterns or connectors appropriately aligned with this level.
2. "vocabulary_chunks": multi-word idiomatic chunks, collocations, or phrasal verbs dynamically scaled to this level.
3. "is_spontaneous": true ONLY if the student produced the structure autonomously, without merely echoing or parroting what the agent said in the previous turn.
4. "confidence": float between 0.0 and 1.0 indicating contextual accuracy.

Return ONLY a valid JSON object matching this schema:
{
  "structures": ["string"],
  "vocabulary_chunks": ["string"],
  "is_spontaneous": boolean,
  "confidence": number
}
Do not include markdown backticks or explanations.`;

  const userPrompt = `Agent said previously: "${agentMsg}"\nStudent responded: "${studentMsg}"`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('[MANA 3.0] LLM Extraction failed:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content) as ExtractedLinguisticData;
    return parsed;
  } catch (error) {
    console.error('[MANA 3.0] Error parsing linguistic extraction:', error);
    return null;
  }
}

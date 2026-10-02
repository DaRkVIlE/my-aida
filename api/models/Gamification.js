const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    totalXp: {
      type: Number,
      default: 0,
    },
    currentXp: {
      type: Number,
      default: 0,
    },
    playerRank: {
      type: String,
      enum: ['E', 'D', 'C', 'B', 'A', 'S'],
      default: 'E',
    },
    totalPureRuns: {
      type: Number,
      default: 0,
    },
    conqueredModules: {
      type: [String],
      default: [],
    },
    currentMana: {
      type: Number,
      default: 100,
    },
    maxMana: {
      type: Number,
      default: 100,
    },
    nivelDiagnosticado: {
      type: String,
      enum: ['P1', 'P2', 'P3', 'P4', 'P5'],
      default: 'P1',
    },
    personaIdeal: {
      type: String,
      default: 'Jordan',
    },
    currentLevel: {
      type: String,
      default: 'Rank E — Iniciante',
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    weeklyXp: {
      type: Number,
      default: 0,
    },
    /** Tier do usuário: 'free' = aluno visitante (50 MANA/dia), 'pro' = aluno da Turma Alpha (MANA ilimitado) */
    tier: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
      index: true,
    },
    /** Timestamp quando o MANA chegou a 0 — usado para exibir o modal de bloqueio */
    manaLockedAt: {
      type: Date,
      default: null,
    },
    /** Total de MANA gasto em toda a vida do usuário (analytics) */
    totalManaSpent: {
      type: Number,
      default: 0,
    },
    history: [
      {
        xp: Number,
        pureRun: { type: Boolean, default: false },
        mana: { type: Number, default: null },
        date: { type: Date, default: Date.now },
        messageId: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Mongoose previne sobreposição de modelos
const Gamification = mongoose.models.Gamification || mongoose.model('Gamification', gamificationSchema);

module.exports = Gamification;

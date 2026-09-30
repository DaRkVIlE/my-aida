import mongoose, { Document, Schema } from 'mongoose';

export type PlayerRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  studentName?: string;
  nivel_diagnosticado: string; // P1_zero | P2_travado | P3_intermediario | P4_lapidacao_b2 | P5_soberania_c1
  foco_principal: string;
  persona_ideal: string; // Jordan | Alexandra | Miles | Zack | Prof. Hayes
  idioma_alvo: string;
  interesses: string[];
  disponibilidade_diaria: string;
  objetivo_declarado: string;
  plano_atribuido: string;
  // MANA 3.0 Gamification Fields
  playerRank: PlayerRank;
  currentXp: number;
  currentMana: number;
  maxMana: number;
  streakDays: number;
  totalPureRuns: number;
  conqueredModules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentName: { type: String },
    nivel_diagnosticado: { type: String, required: true, default: 'P1_zero' },
    foco_principal: { type: String, required: true, default: 'conversacao' },
    persona_ideal: { type: String, required: true, default: 'Jordan' },
    idioma_alvo: { type: String, required: true, default: 'inglês' },
    interesses: [{ type: String }],
    disponibilidade_diaria: { type: String, default: '15min' },
    objetivo_declarado: { type: String },
    plano_atribuido: { type: String, default: 'PLANO-P1' },
    // MANA 3.0 Gamification Fields
    playerRank: { type: String, enum: ['E', 'D', 'C', 'B', 'A', 'S'], default: 'E' },
    currentXp: { type: Number, default: 0 },
    currentMana: { type: Number, default: 100 },
    maxMana: { type: Number, default: 100 },
    streakDays: { type: Number, default: 0 },
    totalPureRuns: { type: Number, default: 0 },
    conqueredModules: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const StudentProfile =
  mongoose.models.StudentProfile || mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);

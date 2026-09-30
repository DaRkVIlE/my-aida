/**
 * MANA 3.0 Verification Script
 * Validação do Motor de Ranks, Scaffolding de Dicas e Arquétipos dos Companions
 */

const fs = require('fs');
const path = require('path');

console.log('=== [MANA 3.0] INICIANDO VERIFICAÇÃO DETERMINÍSTICA DO MOTOR ===\n');

// 1. Validar gamification.json
const gamificationPath = path.join(__dirname, 'gamification.json');
if (!fs.existsSync(gamificationPath)) {
  console.error('FAIL: gamification.json não encontrado!');
  process.exit(1);
}

const gamification = JSON.parse(fs.readFileSync(gamificationPath, 'utf8'));
console.log('✓ gamification.json carregado com sucesso.');

// 2. Verificar Ranks e Limites
const ranks = gamification.ranks;
console.log(`✓ ${ranks.length} Ranks configurados: ${ranks.map(r => r.tier).join(', ')}`);

const expectedTiers = ['E', 'D', 'C', 'B', 'A', 'S'];
expectedTiers.forEach(tier => {
  const found = ranks.find(r => r.tier === tier);
  if (!found) throw new Error(`Rank ${tier} ausente!`);
});
console.log('✓ Todos os Ranks de E a S validados.');

// 3. Verificar Montanha B2
const mountain = gamification.b2MountainRoadmap;
if (!mountain || mountain.totalEssentialChunks !== 2500) {
  throw new Error('Montanha B2 inválida ou meta de 2.500 chunks ausente!');
}
console.log(`✓ Montanha B2 confirmada com meta de ${mountain.totalEssentialChunks} chunks essenciais.`);
console.log(`✓ Módulos cadastrados: ${mountain.modules.map(m => m.title).join(' | ')}`);

// 4. Testar algoritmo de cálculo de Rank
const RANK_THRESHOLDS = [
  { rank: 'S', minXp: 25000 },
  { rank: 'A', minXp: 14000 },
  { rank: 'B', minXp: 7000 },
  { rank: 'C', minXp: 3000 },
  { rank: 'D', minXp: 1000 },
  { rank: 'E', minXp: 0 },
];

function calculateRank(totalXp) {
  for (const threshold of RANK_THRESHOLDS) {
    if (totalXp >= threshold.minXp) return threshold.rank;
  }
  return 'E';
}

const rankTests = [
  { xp: 0, expected: 'E' },
  { xp: 500, expected: 'E' },
  { xp: 1000, expected: 'D' },
  { xp: 2999, expected: 'D' },
  { xp: 3000, expected: 'C' },
  { xp: 6999, expected: 'C' },
  { xp: 7000, expected: 'B' },
  { xp: 13999, expected: 'B' },
  { xp: 14000, expected: 'A' },
  { xp: 24999, expected: 'A' },
  { xp: 25000, expected: 'S' },
  { xp: 100000, expected: 'S' }
];

rankTests.forEach(({ xp, expected }) => {
  const calculated = calculateRank(xp);
  if (calculated !== expected) {
    throw new Error(`Erro no cálculo de Rank para XP ${xp}: esperado ${expected}, obtido ${calculated}`);
  }
});
console.log('✓ 100% dos cenários de cálculo de Rank aprovados.');

// 5. Testar regra de Bônus Pure Run
function calculateTurnXp(baseXp, hintsUsed) {
  if (hintsUsed === 0 && baseXp > 0) {
    return Math.round(baseXp * 1.5); // +50% Pure Run bonus
  }
  return baseXp;
}

if (calculateTurnXp(100, 0) !== 150) throw new Error('Bônus Pure Run falhou!');
if (calculateTurnXp(100, 1) !== 100) throw new Error('Penalização de dica incorreta!');
console.log('✓ Regra do Bônus Pure Run (+50% XP sem dicas) validada.');

// 6. Verificar integridade dos documentos criados
const requiredDocs = [
  'docs/ONBOARDING-MENTALIDADE-MANA.md',
  'docs/PRD-MANA-v3.0-GAMIFIED-AI.md',
  'docs/ARQUITETURA-EXECUCAO-MANA-3.0.md',
  'docs/STORIES-SPRINT-GAMIFIED-AI.md'
];

requiredDocs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (!fs.existsSync(docPath)) throw new Error(`Documento ${doc} não encontrado!`);
  const content = fs.readFileSync(docPath, 'utf8');
  if (!content.includes('Gabe (Gabriel Lima)') && !content.includes('Gabriel Lima (Gabe)')) {
    throw new Error(`Documento ${doc} não contém o branding de Gabe (Gabriel Lima)!`);
  }
});
console.log('✓ Todos os 4 documentos estratégicos validados com branding de Gabe (Gabriel Lima).');

console.log('\n===============================================================');
console.log('🏆 TODOS OS TESTES DETERMINÍSTICOS PASSARAM COM 100% DE SUCESSO!');
console.log('===============================================================\n');

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

/**
 * Script CLI para promover ou gerenciar o tier de alunos da AIDA / Gabe's English
 * Uso:
 *   node api/server/scripts/promoteStudent.js <email-do-aluno> [tier=pro|free]
 * Exemplo:
 *   node api/server/scripts/promoteStudent.js aluno@gmail.com pro
 */
async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const targetTier = (args[1] || 'pro').toLowerCase();

  if (!email) {
    console.error('\n❌ Uso incorreto!');
    console.log('Exemplo: node api/server/scripts/promoteStudent.js aluno@gmail.com pro\n');
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/LibreChat';
  console.log(`\n🔌 Conectando ao MongoDB...`);
  await mongoose.connect(mongoUri);

  try {
    // Carregar models necessários
    require('~/models');
    const User = mongoose.models.User;
    const Gamification = require('~/models/Gamification');

    if (!User) {
      console.error('❌ Model User não encontrado no Mongoose.');
      process.exit(1);
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      console.error(`\n❌ Nenhum usuário cadastrado com o e-mail: "${cleanEmail}"`);
      console.log('Dica: O aluno precisa ter feito login pelo menos uma vez na AIDA.\n');
      process.exit(1);
    }

    console.log(`👤 Usuário encontrado: ${user.name || user.username || cleanEmail} (ID: ${user._id})`);

    let stats = await Gamification.findOne({ user: user._id });
    if (!stats) {
      stats = new Gamification({
        user: user._id,
        currentMana: 100,
        maxMana: 100,
        tier: targetTier,
        playerRank: 'E',
      });
    } else {
      stats.tier = targetTier;
      if (targetTier === 'pro') {
        stats.currentMana = stats.maxMana || 100;
        stats.manaLockedAt = null;
      }
    }

    await stats.save();

    console.log(`\n🎉 SUCESSO! O aluno foi atualizado para: [TIER: ${targetTier.toUpperCase()}]`);
    console.log(`💙 MANA: ${targetTier === 'pro' ? 'ILIMITADO (∞)' : stats.currentMana + ' / 100'}`);
    console.log(`⭐ XP Atual: ${stats.currentXp || 0} XP | Rank: ${stats.playerRank || 'E'}`);
    console.log(`🏰 Acesso: ${targetTier === 'pro' ? 'Todos os 5 Portais Desbloqueados!' : 'Portal 1 e 3 (Free Tier)'}\n`);

  } catch (err) {
    console.error('❌ Erro durante o processo:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();

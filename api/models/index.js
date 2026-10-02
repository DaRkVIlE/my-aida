const mongoose = require('mongoose');
const { createMethods } = require('@librechat/data-schemas');
const { matchModelName, findMatchingPattern } = require('@librechat/api');
const getLogStores = require('~/cache/getLogStores');

const methods = createMethods(mongoose, {
  matchModelName,
  findMatchingPattern,
  getCache: getLogStores,
});

const seedDatabase = async () => {
  await methods.initializeRoles();
  await methods.seedDefaultRoles();
  await methods.ensureDefaultCategories();
  await methods.seedSystemGrants();
  try {
    const seedAidaAgents = require('~/server/services/seedAidaAgents');
    await seedAidaAgents();
  } catch (seedErr) {
    console.error('[AIDA SEED] Aviso na sincronização de agentes:', seedErr?.message);
  }
};

module.exports = {
  ...methods,
  seedDatabase,
};

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const mongoose = require('mongoose');

/**
 * Seed automático das 5 Personas da AIDA como Agentes Nativos do LibreChat no MongoDB.
 * Lê diretamente o aida-config.yaml e sincroniza com a coleção de Agentes.
 */
async function seedAidaAgents() {
  try {
    const configPath = path.resolve(__dirname, '../../../aida-config.yaml');
    if (!fs.existsSync(configPath)) {
      console.log('[AIDA SEED] aida-config.yaml não encontrado em', configPath);
      return;
    }

    const fileContent = fs.readFileSync(configPath, 'utf8');
    const parsedConfig = yaml.load(fileContent);

    const modelSpecs = parsedConfig?.modelSpecs?.list;
    if (!Array.isArray(modelSpecs) || modelSpecs.length === 0) {
      console.log('[AIDA SEED] Nenhum modelSpec encontrado no aida-config.yaml');
      return;
    }

    const Agent = mongoose.models.Agent;
    if (!Agent) {
      console.log('[AIDA SEED] Modelo Agent do Mongoose ainda não inicializado.');
      return;
    }

    // Portal Mapping para enriquecer cada agente com a jornada MANA 3.0
    const portalMapping = {
      jordan: { portal: 'Portal 1: O Descongelamento (A1 → A2)', tier: 'Free & Pro' },
      miles: { portal: 'Portal 2: O Motor do BICS (A2 → B1)', tier: 'Pro' },
      zack: { portal: 'Portal 3: A Tração Conversacional (B1 → B2)', tier: 'Free & Pro' },
      alexandra: { portal: 'Portal 4: A Fronteira Executiva (B2 Pleno)', tier: 'Pro' },
      hayes: { portal: 'Portal 5: O Trono da Soberania (C1 → C2)', tier: 'Pro' },
    };

    console.log(`[AIDA SEED] Sincronizando ${modelSpecs.length} Personas da AIDA como Agentes Nativos...`);

    // Busca um usuário admin ou primeiro usuário cadastrado para ser author dos agentes oficiais
    const User = mongoose.models.User;
    let systemAuthorId = null;
    if (User) {
      const adminUser = await User.findOne({ role: 'ADMIN' }).lean() || await User.findOne().lean();
      if (adminUser) {
        systemAuthorId = adminUser._id;
      }
    }

    if (!systemAuthorId) {
      systemAuthorId = new mongoose.Types.ObjectId();
    }

    for (const spec of modelSpecs) {
      const agentId = `aida-${spec.name}`;
      const portalInfo = portalMapping[spec.name] || { portal: 'Portal AIDA', tier: 'Pro' };

      const agentData = {
        id: agentId,
        name: spec.label || spec.name,
        description: `${spec.description || ''} • [${portalInfo.portal}]`,
        instructions: spec.preset?.promptPrefix || '',
        provider: spec.preset?.endpoint || 'aida',
        model: spec.preset?.model || 'llama-3.3-70b-versatile',
        model_parameters: {
          temperature: spec.preset?.temperature ?? 0.8,
          maxOutputTokens: spec.preset?.maxOutputTokens ?? 1200,
        },
        category: 'education',
        is_promoted: true,
        author: systemAuthorId,
        authorName: 'AIDA Experia',
        avatar: {
          filepath: spec.iconURL || '/assets/logo.svg',
        },
      };

      await Agent.findOneAndUpdate(
        { id: agentId },
        { $set: agentData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`[AIDA SEED] ✅ Agente Nativo sincronizado: ${spec.label} (${agentId})`);
    }

    console.log('[AIDA SEED] Todos os 5 Guardiões Nativos da AIDA foram persistidos no MongoDB com sucesso!');
  } catch (err) {
    console.error('[AIDA SEED] Erro ao sincronizar Agentes Nativos da AIDA:', err.message);
  }
}

module.exports = seedAidaAgents;

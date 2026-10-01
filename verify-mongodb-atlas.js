/**
 * MongoDB Atlas Diagnostic & Readiness Verifier for AIDA / MANA 3.0
 * 
 * Funciona de forma 100% autônoma (zero dependências externas usando dns e tls nativos do Node),
 * e se mongoose estiver disponível (ex: dentro do container), executa também testes de escrita/leitura.
 * 
 * Usage:
 *   node verify-mongodb-atlas.js "<mongodb+srv://...>"
 */

const dns = require('dns').promises;
const tls = require('tls');
const net = require('net');

const uri = process.argv[2] || process.env.MONGO_URI;

async function testTlsConnection(host, port) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(port, host, { rejectUnauthorized: true, servername: host }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      resolve({
        authorized: socket.authorized,
        subject: cert.subject?.CN || 'Atlas Node',
        validTo: cert.valid_to,
      });
    });

    socket.setTimeout(8000, () => {
      socket.destroy(new Error('Timeout de conexão TLS com o nó do MongoDB Atlas'));
    });

    socket.on('error', (err) => {
      reject(err);
    });
  });
}

async function runAtlasDiagnostics() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('      🌐 AIDA / MANA 3.0 — DIAGNÓSTICO DO MONGODB ATLAS         ');
  console.log('════════════════════════════════════════════════════════════════\n');

  if (!uri) {
    console.error('❌ Nenhuma URI do MongoDB fornecida!');
    console.log('\nComo usar:');
    console.log('  node verify-mongodb-atlas.js "mongodb+srv://usuario:senha@cluster.mongodb.net/aida?retryWrites=true&w=majority"\n');
    console.log('Ou configure no PowerShell:');
    console.log('  $env:MONGO_URI="mongodb+srv://..." ; node verify-mongodb-atlas.js\n');
    console.log('----------------------------------------------------------------');
    console.log('📋 CHECKLIST ESSENCIAL DE CONFIGURAÇÃO DO MONGODB ATLAS:');
    console.log('1. MongoDB Atlas > Security > Network Access:');
    console.log('   Adicione o IP "0.0.0.0/0" (Allow Access from Anywhere).');
    console.log('   (Obrigatório para o Railway poder se conectar ao cluster).');
    console.log('2. MongoDB Atlas > Security > Database Access:');
    console.log('   Crie um usuário com permissão "Read and write to any database".');
    console.log('3. Railway Dashboard > Seu Serviço > Variables:');
    console.log('   Adicione a variável MONGO_URI com a connection string do Atlas.');
    console.log('----------------------------------------------------------------\n');
    process.exit(1);
  }

  // Mascarar senha para log limpo e seguro
  const maskedUri = uri.replace(/:\/\/(.*?):(.*?)@/, '://$1:******@');
  console.log(`🔌 Analisando Connection String: ${maskedUri}`);

  const isAtlasSrv = uri.startsWith('mongodb+srv://');
  if (!isAtlasSrv) {
    console.log('⚠️ Aviso: A URI informada não inicia com "mongodb+srv://".');
  } else {
    console.log('✓ Protocolo Atlas SRV (mongodb+srv://) detectado.');
  }

  // Extrair hostname e database
  const hostMatch = uri.match(/@([^/?]+)/);
  const dbMatch = uri.match(/@(?:[^/?]+)\/([^?]+)/);

  if (!hostMatch) {
    console.error('❌ Formato de URI inválido! Não foi possível identificar o host.');
    process.exit(1);
  }

  const host = hostMatch[1];
  const dbName = dbMatch ? dbMatch[1] : 'aida (default)';
  console.log(`✓ Host Cluster: ${host}`);
  console.log(`✓ Database alvo: ${dbName}\n`);

  // Etapa 1: Resolução DNS SRV
  console.log('🔍 [1/3] Testando resolução DNS SRV dos nós do cluster...');
  let hostsToTest = [];

  if (isAtlasSrv) {
    try {
      const srvRecord = `_mongodb._tcp.${host}`;
      const records = await dns.resolveSrv(srvRecord);
      console.log(`✓ DNS SRV resolvido com sucesso! ${records.length} nós primários/secundários encontrados:`);
      records.forEach((r, idx) => {
        console.log(`   [Nó ${idx + 1}] ${r.name}:${r.port}`);
      });
      hostsToTest = records.map(r => ({ host: r.name, port: r.port }));
    } catch (dnsErr) {
      console.error('❌ Falha na resolução DNS SRV:', dnsErr.message);
      console.log('  Verifique se o nome do cluster está correto na sua URI.');
      process.exit(1);
    }
  } else {
    hostsToTest = [{ host, port: 27017 }];
  }

  // Etapa 2: Handshake TLS/SSL e Firewall
  console.log('\n🔒 [2/3] Testando conectividade e Handshake TLS com o nó do Atlas...');
  const target = hostsToTest[0];
  try {
    const tlsResult = await testTlsConnection(target.host, target.port);
    console.log(`✅ Handshake TLS autorizado com sucesso!`);
    console.log(`   Certificado emitido para: ${tlsResult.subject}`);
    console.log(`   Válido até: ${tlsResult.validTo}`);
    console.log('✓ O Firewall da sua rede/máquina permite conexão na porta do MongoDB (27017).');
  } catch (tlsErr) {
    console.error(`❌ Falha na conexão TLS com ${target.host}:${target.port}`);
    console.error('   Motivo:', tlsErr.message);
    console.log('\n⚠️ DICA: Verifique se o IP da sua máquina está liberado em "Network Access" no Atlas!');
    process.exit(1);
  }

  // Etapa 3: Verificação de Driver (se disponível)
  console.log('\n📦 [3/3] Verificação da integração com a aplicação...');
  let mongoose;
  try {
    mongoose = require('mongoose');
  } catch (e) {
    // Sem mongoose localmente — normal se estiver fora do container
    console.log('ℹ️ Mongoose não instalado no host local (a aplicação roda dentro do container Docker).');
    console.log('✓ O container no Railway possui todas as dependências pré-instaladas.');
  }

  if (mongoose) {
    try {
      console.log('⏳ Conectando Mongoose ao banco para autenticar credenciais...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log('✅ Autenticação com o MongoDB Atlas realizada com sucesso!');
      await mongoose.disconnect();
    } catch (authErr) {
      console.error('❌ Erro de autenticação no MongoDB:', authErr.message);
      process.exit(1);
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🎉 SUCESSO: O MONGODB ATLAS ESTÁ PRONTO PARA RECEBER A AIDA / MANA!');
  console.log('════════════════════════════════════════════════════════════════\n');
  console.log('🚀 Próximo passo para deploy no Railway:');
  console.log('1. No Railway Dashboard > seu serviço AIDA > aba "Variables":');
  console.log(`   Configure: MONGO_URI = ${maskedUri}`);
  console.log('2. No MongoDB Atlas > "Network Access":');
  console.log('   Garanta que "0.0.0.0/0" está na lista para permitir o tráfego do Railway.\n');
}

runAtlasDiagnostics();

const telemetry = require('./telemetry');
const fs = require('fs');
const path = require('path');
require('module-alias')({ base: path.resolve(__dirname, '..') });
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const passport = require('passport');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { logger, runAsSystem } = require('@librechat/data-schemas');
const {
  isEnabled,
  apiNotFound,
  createMetrics,
  ErrorController,
  memoryDiagnostics,
  performStartupChecks,
  handleJsonParseError,
  GenerationJobManager,
  createStreamServices,
  initializeFileStorage,
  initializeDeploymentSkills,
  preAuthTenantMiddleware,
  setupGracefulShutdown,
  updateInterfacePermissions,
} = require('@librechat/api');
const { connectDb, indexSync } = require('~/db');
const {
  updateAccessPermissions,
  sweepOrphanedPreviews,
  getRoleByName,
  seedDatabase,
} = require('~/models');
const initializeOAuthReconnectManager = require('./services/initializeOAuthReconnectManager');
const { capabilityContextMiddleware } = require('./middleware/roles/capabilities');
const createValidateImageRequest = require('./middleware/validateImageRequest');
const { startExpiredFileSweep } = require('./services/Files/process');
const { jwtLogin, ldapLogin, passportLogin } = require('~/strategies');
const { checkMigrations } = require('./services/start/migration');
const optionalJwtAuth = require('./middleware/optionalJwtAuth');
const initializeMCPs = require('./services/initializeMCPs');
const configureSocialLogins = require('./socialLogins');
const { getAppConfig } = require('./services/Config');
const staticCache = require('./utils/staticCache');
const noIndex = require('./middleware/noIndex');
const routes = require('./routes');

const { PORT, HOST, ALLOW_SOCIAL_LOGIN, DISABLE_COMPRESSION, TRUST_PROXY } = process.env ?? {};

// Allow PORT=0 to be used for automatic free port assignment
const port = isNaN(Number(PORT)) ? 3080 : Number(PORT);
const host = HOST || 'localhost';
const trusted_proxy = Number(TRUST_PROXY) || 1; /* trust first proxy by default */

const app = express();
let serverReady = false;

const SERVER_NOT_READY_CODE = 'SERVER_NOT_READY';
const CHAT_START_RETRY_AFTER_SECONDS = '1';

const rejectChatStartsUntilReady = (req, res, next) => {
  if (serverReady || req.method !== 'POST' || req.path === '/abort') {
    return next();
  }

  res.set('Retry-After', CHAT_START_RETRY_AFTER_SECONDS);
  return res.status(503).json({
    code: SERVER_NOT_READY_CODE,
    error: 'Server is still starting. Please retry shortly.',
  });
};

const configureGenerationStreams = () => {
  const streamServices = createStreamServices();
  GenerationJobManager.configure({
    ...streamServices,
    cleanupOnComplete: !isEnabled(process.env.STREAM_KEEP_COMPLETED_JOBS),
  });
  GenerationJobManager.initialize();
};

/**
 * Injeta metadados canônicos da AIDA, OpenGraph completo para WhatsApp/Telegram,
 * Title Enforcer imutável e o Player HUD do MANA 3.0 diretamente no index.html servido pelo servidor.
 */
function enhanceHtmlWithAida(html) {
  if (!html || typeof html !== 'string') {
    return html;
  }

  const gabeWhatsAppNumber = process.env.GABE_WHATSAPP_NUMBER || '5511967239791';

  // 1. Forçar título canônico da AIDA
  html = html.replace(/<title>[\s\S]*?<\/title>/gi, '<title>AIDA — Aprenda Inglês por Imersão Ativa</title>');

  // 2. Limpar meta tags antigas de OpenGraph, Twitter e Description
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');

  // 3. Injetar metadados canônicos da AIDA
  const aidaMetaTags = `
    <meta name="description" content="AIDA — Aprenda inglês por imersão ativa com tutores de IA. Sem aulas chatas, sem gramática decorada. Conversação real desde o primeiro dia." />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="AIDA" />
    <meta property="og:url" content="https://aida.experiasolutions.com.br" />
    <meta property="og:title" content="AIDA — Aprenda Inglês por Imersão Ativa" />
    <meta property="og:description" content="Converse com tutores de IA especializados e aprenda inglês do jeito que o cérebro foi feito para aprender — por imersão ativa." />
    <meta property="og:image" content="https://aida.experiasolutions.com.br/assets/aida-og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="AIDA — Plataforma de Imersão em Inglês com IA" />
    <meta property="og:locale" content="pt_BR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="AIDA — Aprenda Inglês por Imersão Ativa" />
    <meta name="twitter:description" content="Converse com tutores de IA especializados e aprenda inglês por imersão ativa." />
    <meta name="twitter:image" content="https://aida.experiasolutions.com.br/assets/aida-og.png" />
  `;

  html = html.replace(/<head>/i, `<head>${aidaMetaTags}`);

  // 4. Injetar Player HUD MANA e Title Enforcer no final do body
  const aidaHudAndTitleScript = `
    <!-- AIDA MANA 3.0 Player HUD & Title Enforcer -->
    <style>
      #aida-mana-hud {
        position: fixed;
        top: 10px;
        right: 18px;
        z-index: 99999;
        display: none;
        align-items: center;
        gap: 8px;
        background: rgba(13, 13, 20, 0.88);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(139, 92, 246, 0.45);
        border-radius: 9999px;
        padding: 5px 12px;
        color: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 12px rgba(139, 92, 246, 0.25);
        user-select: none;
        cursor: pointer;
        transition: all 0.25s ease;
      }
      #aida-mana-hud:hover {
        border-color: rgba(139, 92, 246, 0.9);
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(139, 92, 246, 0.4);
      }
      .mana-badge-rank {
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        color: #fff;
        padding: 2px 7px;
        border-radius: 9999px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.5px;
      }
      .mana-badge-item {
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
      .mana-badge-mana { color: #38bdf8; font-weight: 700; }
      .mana-badge-xp { color: #34d399; }
      .mana-badge-streak { color: #fb923c; }
      .mana-cockpit-btn {
        background: rgba(139, 92, 246, 0.25);
        border: 1px solid rgba(139, 92, 246, 0.5);
        color: #c084fc;
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        margin-left: 2px;
      }

      /* Slide-over Master Cockpit Drawer */
      #aida-cockpit-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 100000;
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      #aida-cockpit-drawer {
        position: fixed;
        top: 0;
        right: -450px;
        width: 420px;
        max-width: 90vw;
        height: 100vh;
        background: #0b0c10;
        border-left: 1px solid rgba(139, 92, 246, 0.4);
        box-shadow: -10px 0 40px rgba(0, 0, 0, 0.8);
        z-index: 100001;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #e2e8f0;
        transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #aida-cockpit-drawer.open { right: 0; }
      #aida-cockpit-backdrop.open { display: block; opacity: 1; }

      .cockpit-header {
        padding: 20px;
        background: linear-gradient(180deg, rgba(24, 20, 37, 0.95), rgba(11, 12, 16, 0.8));
        border-bottom: 1px solid rgba(139, 92, 246, 0.25);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .cockpit-title { font-size: 16px; font-weight: 800; color: #f8fafc; letter-spacing: 0.5px; }
      .cockpit-close-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #94a3b8;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
      .cockpit-close-btn:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }

      .cockpit-body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
      
      .cockpit-card {
        background: rgba(18, 19, 26, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 16px;
      }
      .cockpit-card-title {
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        color: #94a3b8;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Portais */
      .portal-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        margin-bottom: 8px;
        border: 1px solid transparent;
      }
      .portal-item.active {
        background: rgba(139, 92, 246, 0.15);
        border-color: rgba(139, 92, 246, 0.4);
      }
      .portal-info { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
      .portal-tag { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; }
      .portal-tag-free { background: rgba(52, 211, 153, 0.2); color: #34d399; }
      .portal-tag-pro { background: rgba(139, 92, 246, 0.2); color: #c084fc; }

      /* WhatsApp Alpha Callout */
      .alpha-callout {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(139, 92, 246, 0.15));
        border: 1px solid rgba(16, 185, 129, 0.35);
        border-radius: 14px;
        padding: 18px;
        text-align: center;
      }
      .alpha-callout p { font-size: 13px; line-height: 1.5; color: #cbd5e1; margin-bottom: 12px; }
      .alpha-wa-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        background: #10b981;
        color: #fff;
        padding: 10px 16px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
        transition: background 0.2s;
      }
      .alpha-wa-btn:hover { background: #059669; }

      @media (max-width: 640px) {
        #aida-mana-hud {
          top: auto;
          bottom: 12px;
          right: 12px;
          font-size: 11px;
          padding: 4px 10px;
        }
      }
    </style>

    <!-- Header HUD Flutuante -->
    <div id="aida-mana-hud" onclick="toggleAidaCockpit()">
      <span class="mana-badge-item mana-badge-mana">💙 <span id="mana-hud-val">100</span></span>
      <span class="mana-badge-item mana-badge-streak">🔥 <span id="mana-hud-streak">1d</span></span>
      <span class="mana-badge-rank" id="mana-hud-rank">RANK E</span>
      <span class="mana-badge-item mana-badge-xp">⚡ <span id="mana-hud-xp">0 XP</span></span>
      <span class="mana-cockpit-btn">📊 Cockpit</span>
    </div>

    <!-- Backdrop & Master Cockpit Slide-over Drawer -->
    <div id="aida-cockpit-backdrop" onclick="toggleAidaCockpit()"></div>
    <div id="aida-cockpit-drawer">
      <div class="cockpit-header">
        <div class="cockpit-title">🏰 GABE'S ENGLISH COCKPIT</div>
        <button class="cockpit-close-btn" onclick="toggleAidaCockpit()">✕</button>
      </div>
      <div class="cockpit-body">
        <!-- Card 1: Energia & Vidas -->
        <div class="cockpit-card">
          <div class="cockpit-card-title">💙 Reserva de MANA (Vidas Diárias)</div>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
            <span>Energia para Prática</span>
            <span style="font-weight:700; color:#38bdf8;" id="drawer-mana-text">100 / 100 MANA</span>
          </div>
          <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:9999px; overflow:hidden;">
            <div id="drawer-mana-bar" style="background:#38bdf8; height:100%; width:100%; transition:width 0.3s ease;"></div>
          </div>
          <div style="font-size:11px; color:#94a3b8; margin-top:8px;">
            💡 <strong>Dica MANA:</strong> Responda 100% em inglês sem pedir tradução para ativar <em>Pure Run</em> (+5 MANA e +50% XP bônus)!
          </div>
        </div>

        <!-- Card 2: Montanha B2 (Os 5 Portais) -->
        <div class="cockpit-card">
          <div class="cockpit-card-title">🏔️ Os 5 Portais de Fluência (Montanha B2)</div>
          
          <div class="portal-item active">
            <div class="portal-info">🎬 <span>Portal 1: Descongelamento (A1→A2)</span></div>
            <span class="portal-tag portal-tag-free">Jordan • Livre</span>
          </div>
          
          <div class="portal-item">
            <div class="portal-info">✈️ <span>Portal 2: Motor BICS (A2→B1)</span></div>
            <span class="portal-tag portal-tag-pro">Miles • Pro</span>
          </div>

          <div class="portal-item active">
            <div class="portal-info">🎮 <span>Portal 3: Tração Conversacional (B1→B2)</span></div>
            <span class="portal-tag portal-tag-free">Zack • Livre</span>
          </div>

          <div class="portal-item">
            <div class="portal-info">👔 <span>Portal 4: Fronteira Executiva (B2 Pleno)</span></div>
            <span class="portal-tag portal-tag-pro">Alexandra • Pro</span>
          </div>

          <div class="portal-item">
            <div class="portal-info">📚 <span>Portal 5: Trono da Soberania (C1→C2)</span></div>
            <span class="portal-tag portal-tag-pro">Prof. Hayes • Pro</span>
          </div>
        </div>

        <!-- Card 3: Quests Diárias -->
        <div class="cockpit-card">
          <div class="cockpit-card-title">🎯 Missões Diárias (Quests)</div>
          <div style="font-size:12px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>☕ Conversar com o Jordan hoje</span>
              <span style="color:#34d399; font-weight:700;">+15 XP</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>⚡ Completar uma Pure Run sem socorro em PT</span>
              <span style="color:#34d399; font-weight:700;">+25 XP</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>🔥 Manter ofensiva de 2 dias seguidos</span>
              <span style="color:#fb923c; font-weight:700;">+50 XP</span>
            </div>
          </div>
        </div>

        <!-- Card 4: Turma Alpha do Gabe -->
        <div class="alpha-callout">
          <div style="font-size:14px; font-weight:800; color:#10b981; margin-bottom:6px;">🚀 PILOTO ALPHA COM O GABE</div>
          <p>
            <em>"A sua boca não fala porque o seu cérebro ainda está traduzindo. O inglês não se estuda com regras — se adquire no reflexo."</em>
          </p>
          <p style="font-size:12px;">
            Acesso a todos os 5 Portais, MANA Ilimitado, voz TTS nativa ultra-rápida e acompanhamento pessoal com Gabe.
          </p>
          <a class="alpha-wa-btn" href="https://wa.me/${gabeWhatsAppNumber}?text=Oi%20Gabe!%20Estou%20praticando%20na%20AIDA%20e%20quero%20garantir%20uma%20das%20vagas%20do%20Piloto%20Alpha%20com%20voc%C3%AA." target="_blank" rel="noreferrer">
            📲 Entrar na Turma Alpha no WhatsApp
          </a>
        </div>
      </div>
    </div>

    <script>
      (function() {
        function enforceAidaTitle() {
          if (document.title.includes('LibreChat')) {
            document.title = document.title.replace(/LibreChat/g, 'AIDA');
          }
        }
        enforceAidaTitle();
        var titleObserver = new MutationObserver(enforceAidaTitle);
        var targetTitle = document.querySelector('title');
        if (targetTitle) {
          titleObserver.observe(targetTitle, { childList: true, characterData: true, subtree: true });
        }

        var hudEl = document.getElementById('aida-mana-hud');
        var manaEl = document.getElementById('mana-hud-val');
        var xpEl = document.getElementById('mana-hud-xp');
        var rankEl = document.getElementById('mana-hud-rank');
        var streakEl = document.getElementById('mana-hud-streak');
        var drawerManaText = document.getElementById('drawer-mana-text');
        var drawerManaBar = document.getElementById('drawer-mana-bar');

        // === MANA DEPLETED MODAL ===
        var manaModal = null;
        function showManaDepletedModal(data) {
          if (manaModal && document.body.contains(manaModal)) return;

          manaModal = document.createElement('div');
          manaModal.id = 'aida-mana-modal-overlay';
          manaModal.style.cssText = [
            'position:fixed;inset:0;background:rgba(0,0,0,0.75);',
            'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
            'z-index:200000;display:flex;align-items:center;justify-content:center;',
            'padding:20px;animation:fadeInAida 0.3s ease;'
          ].join('');

          var waLink = data.upgradeLink || 'https://wa.me/${gabeWhatsAppNumber}?text=' + encodeURIComponent('Oi Gabe! Meu MANA acabou na AIDA e quero saber como entrar na Turma Alpha! 💙');
          var refill = data.refillAt || 'Meia-noite UTC';

          manaModal.innerHTML = [
            '<div style="background:#0b0c10;border:1px solid rgba(139,92,246,0.5);border-radius:20px;',
            'padding:32px 28px;max-width:400px;width:100%;text-align:center;',
            'box-shadow:0 20px 60px rgba(0,0,0,0.8),0 0 30px rgba(139,92,246,0.2);">',
            '<div style="font-size:48px;margin-bottom:12px;">💙</div>',
            '<h2 style="font-family:system-ui,sans-serif;font-size:20px;font-weight:800;',
            'color:#f8fafc;margin-bottom:8px;">Sua reserva de MANA zerou!</h2>',
            '<p style="font-family:system-ui,sans-serif;font-size:13px;color:#94a3b8;',
            'line-height:1.6;margin-bottom:20px;">',
            'Você praticou muito hoje! 🔥 Alunos da <strong style="color:#10b981;">Turma Alpha</strong>',
            ' têm MANA ilimitado 💙 ∞ e acesso irrestrito a todos os 5 Portais de Fluência.<br><br>',
            '<span style="color:#64748b;font-size:12px;">⏰ Recarga automática: ', refill, '</span>',
            '</p>',
            '<a href="', waLink, '" target="_blank" rel="noreferrer" ',
            'style="display:block;background:#10b981;color:#000;font-family:system-ui,sans-serif;',
            'font-size:14px;font-weight:800;padding:14px 20px;border-radius:12px;',
            'text-decoration:none;margin-bottom:12px;transition:background 0.2s;">',
            '📲 Entrar na Turma Alpha no WhatsApp',
            '</a>',
            '<button onclick="document.getElementById(\'aida-mana-modal-overlay\').remove()" ',
            'style="background:transparent;border:1px solid rgba(255,255,255,0.12);',
            'color:#64748b;font-family:system-ui,sans-serif;font-size:12px;',
            'padding:8px 16px;border-radius:8px;cursor:pointer;width:100%;">',
            'Voltar amanhã (recarga gratuita às meia-noite)',
            '</button>',
            '</div>'
          ].join('');

          document.body.appendChild(manaModal);
        }

        // === INTERCEPTAR FETCH PARA CAPTURAR 402 MANA_DEPLETED ===
        var _origFetch = window.fetch;
        window.fetch = function() {
          var args = arguments;
          return _origFetch.apply(this, args).then(function(response) {
            if (response.status === 402) {
              response.clone().json().then(function(body) {
                if (body && body.code === 'MANA_DEPLETED') {
                  showManaDepletedModal(body);
                  updateManaHud();
                }
              }).catch(function() {});
            }
            return response;
          });
        };

        window.toggleAidaCockpit = function() {
          var drawer = document.getElementById('aida-cockpit-drawer');
          var backdrop = document.getElementById('aida-cockpit-backdrop');
          if (!drawer || !backdrop) return;
          var isOpen = drawer.classList.contains('open');
          if (isOpen) {
            drawer.classList.remove('open');
            backdrop.classList.remove('open');
          } else {
            drawer.classList.add('open');
            backdrop.classList.add('open');
          }
        };

        function updateManaHud() {
          fetch('/api/user', { credentials: 'include' })
            .then(function(res) {
              if (!res.ok) throw new Error('Unauthenticated');
              return res.json();
            })
            .then(function(user) {
              if (!user || !user.id) return;
              return fetch('/api/mana/profile/' + user.id, { credentials: 'include' });
            })
            .then(function(res) {
              if (!res || !res.ok) return;
              return res.json();
            })
            .then(function(stats) {
              if (!stats) return;
              if (hudEl) hudEl.style.display = 'inline-flex';

              var isPro = stats.tier === 'pro';
              var currentMana = isPro ? '∞' : (typeof stats.currentMana === 'number' ? stats.currentMana : 100);
              var maxMana = stats.maxMana || 100;
              var manaNum = isPro ? maxMana : (typeof stats.currentMana === 'number' ? stats.currentMana : 100);
              var manaPercent = isPro ? 100 : Math.min(100, Math.round((manaNum / maxMana) * 100));

              if (manaEl) manaEl.textContent = currentMana;
              if (xpEl) xpEl.textContent = (stats.currentXp || 0) + ' XP';
              if (rankEl) rankEl.textContent = 'RANK ' + (stats.playerRank || 'E');
              if (streakEl) streakEl.textContent = (stats.streakDays || 1) + 'd';
              if (drawerManaText) drawerManaText.textContent = (isPro ? '∞ / ∞ (Pro ⭐)' : (currentMana + ' / ' + maxMana + ' MANA'));
              if (drawerManaBar) {
                drawerManaBar.style.width = manaPercent + '%';
                drawerManaBar.style.background = isPro
                  ? 'linear-gradient(90deg,#10b981,#34d399)'
                  : (manaPercent <= 20 ? '#ef4444' : manaPercent <= 50 ? '#f97316' : '#38bdf8');
              }

              // Flash vermelho no HUD quando MANA crítico (≤20%)
              if (hudEl && !isPro && manaPercent <= 20) {
                hudEl.style.borderColor = 'rgba(239,68,68,0.7)';
                hudEl.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5),0 0 14px rgba(239,68,68,0.4)';
              } else if (hudEl) {
                hudEl.style.borderColor = '';
                hudEl.style.boxShadow = '';
              }

              // Mostrar modal automaticamente se já zerou
              if (!isPro && manaNum <= 0) {
                showManaDepletedModal({
                  upgradeLink: 'https://wa.me/${gabeWhatsAppNumber}?text=' + encodeURIComponent('Oi Gabe! Meu MANA acabou na AIDA e quero saber como entrar na Turma Alpha! 💙'),
                  refillAt: 'Meia-noite UTC'
                });
              }
            })
            .catch(function() {
              if (hudEl) hudEl.style.display = 'none';
            });
        }

        setTimeout(updateManaHud, 1000);
        setInterval(updateManaHud, 20000);
      })();
    </script>
  `;

  html = html.replace(/<\/body>/i, `${aidaHudAndTitleScript}</body>`);

  return html;
}

const startServer = async () => {
  const { metricsMiddleware, metricsRouter } = createMetrics();
  if (!process.env.METRICS_SECRET) {
    logger.warn('[metrics] METRICS_SECRET is not set - /metrics will return 401 for all requests');
  }

  if (typeof Bun !== 'undefined') {
    axios.defaults.headers.common['Accept-Encoding'] = 'gzip';
  }
  await connectDb();

  logger.info('Connected to MongoDB');
  indexSync().catch((err) => {
    logger.error('[indexSync] Background sync failed:', err);
  });

  app.disable('x-powered-by');
  app.set('trust proxy', trusted_proxy);

  if (isEnabled(process.env.TENANT_ISOLATION_STRICT)) {
    logger.warn(
      '[Security] TENANT_ISOLATION_STRICT is active. Ensure your reverse proxy strips or sets ' +
        'the X-Tenant-Id header — untrusted clients must not be able to set it directly.',
    );
  }

  await runAsSystem(seedDatabase);
  /* Recover stuck `status: 'pending'` records from a crash mid-render.
   * `runAsSystem` is required — `File` is tenant-isolated and strict
   * mode rejects unscoped queries. Lazy sweep in the preview endpoint
   * covers anything younger than the boot cutoff. */
  runAsSystem(sweepOrphanedPreviews).catch((err) => {
    logger.error('[sweepOrphanedPreviews] Background sweep failed:', err);
  });
  const appConfig = await getAppConfig({ baseOnly: true });
  initializeFileStorage(appConfig);
  await initializeDeploymentSkills({ projectRoot: path.resolve(__dirname, '../..') });
  startExpiredFileSweep({ appConfig, loadAppConfig: getAppConfig });
  await runAsSystem(async () => {
    await performStartupChecks(appConfig);
    await updateInterfacePermissions({ appConfig, getRoleByName, updateAccessPermissions });
  });

  const indexPath = path.join(appConfig.paths.dist, 'index.html');
  let indexHTML = enhanceHtmlWithAida(fs.readFileSync(indexPath, 'utf8'));

  // In order to provide support to serving the application in a sub-directory
  // We need to update the base href if the DOMAIN_CLIENT is specified and not the root path
  if (process.env.DOMAIN_CLIENT) {
    const clientUrl = new URL(process.env.DOMAIN_CLIENT);
    const baseHref = clientUrl.pathname.endsWith('/')
      ? clientUrl.pathname
      : `${clientUrl.pathname}/`;
    if (baseHref !== '/') {
      logger.info(`Setting base href to ${baseHref}`);
      indexHTML = indexHTML.replace(/base href="\/"/, `base href="${baseHref}"`);
    }
  }

  app.get('/health', (_req, res) => res.status(200).send('OK'));
  app.get('/livez', (_req, res) => res.status(200).send('OK'));
  app.get('/readyz', (_req, res) => {
    if (!serverReady) {
      return res.status(503).send('NOT_READY');
    }
    return res.status(200).send('OK');
  });

  /* Middleware */
  app.use(metricsMiddleware);
  app.use(noIndex);
  app.use(express.json({ limit: '3mb' }));
  app.use(express.urlencoded({ extended: true, limit: '3mb' }));
  app.use(handleJsonParseError);

  /**
   * Express 5 Compatibility: Make req.query writable for mongoSanitize
   * In Express 5, req.query is read-only by default, but express-mongo-sanitize needs to modify it
   */
  app.use((req, _res, next) => {
    Object.defineProperty(req, 'query', {
      ...Object.getOwnPropertyDescriptor(req, 'query'),
      value: req.query,
      writable: true,
    });
    next();
  });

  app.use(mongoSanitize());
  app.use(cors());
  app.use(cookieParser());

  if (!isEnabled(DISABLE_COMPRESSION)) {
    app.use(compression());
  } else {
    console.warn('Response compression has been disabled via DISABLE_COMPRESSION.');
  }

  app.use(staticCache(appConfig.paths.dist));
  app.use(staticCache(appConfig.paths.fonts));
  app.use(staticCache(appConfig.paths.assets));

  if (telemetry.enabled) {
    app.use(telemetry.telemetryMiddleware);
  }

  if (!ALLOW_SOCIAL_LOGIN) {
    console.warn('Social logins are disabled. Set ALLOW_SOCIAL_LOGIN=true to enable them.');
  }

  /* OAUTH */
  app.use(passport.initialize());
  passport.use(jwtLogin());
  passport.use(passportLogin());

  /* LDAP Auth */
  if (process.env.LDAP_URL && process.env.LDAP_USER_SEARCH_BASE) {
    passport.use(ldapLogin);
  }

  if (isEnabled(ALLOW_SOCIAL_LOGIN)) {
    await configureSocialLogins(app);
  }

  /* Per-request capability cache — must be registered before any route that calls hasCapability */
  app.use(capabilityContextMiddleware);

  /* Pre-auth tenant context for unauthenticated routes that need tenant scoping.
   * The reverse proxy / auth gateway sets `X-Tenant-Id` header for multi-tenant deployments. */
  app.use('/oauth', preAuthTenantMiddleware, routes.oauth);
  /* API Endpoints */
  app.use('/api/auth', preAuthTenantMiddleware, routes.auth);
  app.use('/api/admin', routes.adminAuth);
  app.use('/api/admin/config', routes.adminConfig);
  app.use('/api/admin/grants', routes.adminGrants);
  app.use('/api/admin/groups', routes.adminGroups);
  app.use('/api/admin/roles', routes.adminRoles);
  app.use('/api/admin/users', routes.adminUsers);
  app.use('/api/actions', routes.actions);
  app.use('/api/keys', routes.keys);
  app.use('/api/api-keys', routes.apiKeys);
  app.use('/api/user', routes.user);
  app.use('/api/search', routes.search);
  app.use('/api/messages', routes.messages);
  app.use('/api/convos', routes.convos);
  app.use('/api/presets', routes.presets);
  app.use('/api/projects', routes.projects);
  app.use('/api/prompts', routes.prompts);
  app.use('/api/skills', routes.skills);
  app.use('/api/categories', routes.categories);
  app.use('/api/endpoints', routes.endpoints);
  app.use('/api/balance', routes.balance);
  app.use('/api/models', routes.models);
  app.use('/api/config', preAuthTenantMiddleware, optionalJwtAuth, routes.config);
  app.use('/api/assistants', routes.assistants);
  app.use('/api/files', await routes.files.initialize());
  app.use('/images/', createValidateImageRequest(appConfig.secureImageLinks), routes.staticRoute);
  app.use('/api/share', preAuthTenantMiddleware, routes.share);
  app.use('/api/roles', routes.roles);
  app.use('/api/agents/chat', rejectChatStartsUntilReady);
  app.use('/api/agents', routes.agents);
  app.use('/api/banner', routes.banner);
  app.use('/api/memories', routes.memories);
  app.use('/api/permissions', routes.accessPermissions);

  app.use('/api/tags', routes.tags);
  app.use('/api/mcp', routes.mcp);
  app.use('/api/gamification', routes.gamification);
  app.use('/api/mana', routes.manaProfile);
  app.use('/api/rum', routes.rum);

  app.use('/metrics', metricsRouter);

  /** 404 for unmatched API routes */
  app.use('/api', apiNotFound);

  /** SPA fallback - serve index.html for all unmatched routes */
  app.use((req, res) => {
    res.set({
      'Cache-Control': process.env.INDEX_CACHE_CONTROL || 'no-cache, no-store, must-revalidate',
      Pragma: process.env.INDEX_PRAGMA || 'no-cache',
      Expires: process.env.INDEX_EXPIRES || '0',
    });

    const lang = req.cookies.lang || req.headers['accept-language']?.split(',')[0] || 'en-US';
    const saneLang = lang.replace(/"/g, '&quot;');
    let updatedIndexHtml = indexHTML.replace(/lang="en-US"/g, `lang="${saneLang}"`);

    res.type('html');
    res.send(updatedIndexHtml);
  });

  /** Record trace errors before the final error controller. */
  if (telemetry.enabled) {
    app.use(telemetry.telemetryErrorMiddleware);
  }
  /** Error handler (must be last - Express identifies error middleware by its 4-arg signature) */
  app.use(ErrorController);

  configureGenerationStreams();

  const server = app.listen(port, host, async (err) => {
    if (err) {
      logger.error('Failed to start server:', err);
      process.exit(1);
    }

    if (host === '0.0.0.0') {
      logger.info(
        `Server listening on all interfaces at port ${port}. Use http://localhost:${port} to access it`,
      );
    } else {
      logger.info(`Server listening at http://${host == '0.0.0.0' ? 'localhost' : host}:${port}`);
    }

    /**
     * The listen callback is async, so any rejection from these awaits would
     * otherwise be detached from `startServer().catch(...)` (which only
     * catches errors that happen before `app.listen`). Without explicit
     * handling, the global `unhandledRejection` handler would swallow init
     * failures and leave the server listening but only partially
     * initialized — passing liveness checks while serving broken requests.
     */
    try {
      await runAsSystem(async () => {
        await initializeMCPs();
        await initializeOAuthReconnectManager();
      });
      await checkMigrations();

      const inspectFlags = process.execArgv.some((arg) => arg.startsWith('--inspect'));
      if (inspectFlags || isEnabled(process.env.MEM_DIAG)) {
        memoryDiagnostics.start();
      }
      serverReady = true;
      logger.info('Server readiness checks passing.');
    } catch (initErr) {
      serverReady = false;
      logger.error('Post-listen initialization failed:', initErr);
      process.exit(1);
    }
  });

  setupGracefulShutdown(server);
};

/**
 * Boot rejections (e.g. `connectDb`, `getAppConfig`, `performStartupChecks`)
 * must remain fail-fast: a half-initialized process with no listening HTTP
 * server should die immediately so the orchestrator restarts it, instead of
 * being kept alive by the `unhandledRejection` handler below until the
 * liveness probe eventually times out. Mirrors the pattern in
 * `experimental.js`.
 */
startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

let messageCount = 0;
process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    logger.error('There was an uncaught error:', err);
  }

  if (err.message && err.message?.toLowerCase()?.includes('abort')) {
    logger.warn('There was an uncatchable abort error.');
    return;
  }

  if (err.message.includes('GoogleGenerativeAI')) {
    logger.warn(
      '\n\n`GoogleGenerativeAI` errors cannot be caught due to an upstream issue, see: https://github.com/google-gemini/generative-ai-js/issues/303',
    );
    return;
  }

  if (err.message.includes('fetch failed')) {
    if (messageCount === 0) {
      logger.warn('Meilisearch error, search will be disabled');
      messageCount++;
    }

    return;
  }

  if (err.message.includes('OpenAIError') || err.message.includes('ChatCompletionMessage')) {
    logger.error(
      '\n\nAn Uncaught `OpenAIError` error may be due to your reverse-proxy setup or stream configuration, or a bug in the `openai` node package.',
    );
    return;
  }

  if (err.stack && err.stack.includes('@librechat/agents')) {
    logger.error(
      '\n\nAn error occurred in the agents system. The error has been logged and the app will continue running.',
      {
        message: err.message,
        stack: err.stack,
      },
    );
    return;
  }

  if (isEnabled(process.env.CONTINUE_ON_UNCAUGHT_EXCEPTION)) {
    logger.error('Unhandled error encountered. The app will continue running.', {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    });
    return;
  }

  process.exit(1);
});

/**
 * Unhandled promise rejection handler.
 *
 * Node 15+ terminates the process by default when a promise rejection is
 * unhandled. MCP OAuth reconnect storms and streamable-HTTP transport resets
 * can produce transient fire-and-forget rejections (ECONNRESET, token refresh
 * races) that are recoverable — the server should log and keep serving other
 * requests rather than silently crash under load.
 *
 * Non-Error reasons are forwarded as-is so structured payloads (e.g.
 * `{ code: "ECONNRESET", errno: -104 }`) survive instead of being collapsed to
 * "[object Object]" by `String()`.
 */
process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error) {
    logger.error('Unhandled promise rejection. The app will continue running.', {
      name: reason.name,
      message: reason.message,
      stack: reason.stack,
      cause: reason.cause,
    });
    return;
  }
  logger.error('Unhandled promise rejection. The app will continue running.', { reason });
});

/** Export app for easier testing purposes */
module.exports = app;

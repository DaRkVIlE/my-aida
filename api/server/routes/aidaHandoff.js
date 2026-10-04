/**
 * AIDA SSO Handoff Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Permite que o AIDA Hub (domínio externo) autentique o aluno e abra o Chat
 * já com a persona correta selecionada — sem depender de cookies cross-domain.
 *
 * FLUXO:
 *   1. Hub faz POST /api/auth/hub-login → recebe { token, user }
 *   2. Hub guarda token no localStorage
 *   3. Hub usa `Authorization: Bearer <token>` para chamadas à API
 *   4. Ao clicar num Portal: Hub redireciona para GET /start/:persona?t=<token>
 *   5. Este endpoint seta cookies de sessão e redireciona para /c/new
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { logger } = require('@librechat/data-schemas');
const { findUser, getUserById, updateUser } = require('~/models');
const { setAuthTokens } = require('~/server/services/AuthService');

const router = express.Router();

const ALLOWED_PERSONAS = ['jordan', 'zack', 'miles', 'alexandra', 'hayes', 'aida', 'aida-admin'];
const AIDA_HUB_ORIGIN = process.env.AIDA_HUB_ORIGIN || 'https://aida-hub-production-b723.up.railway.app';

/**
 * POST /api/auth/hub-login
 * Login direto do Hub — retorna JWT sem depender de cookies.
 * O Hub armazena o token no localStorage e usa Bearer para chamadas subsequentes.
 */
router.post('/hub-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const user = await findUser({ email }, '+password');
    if (!user) {
      // Timing-safe: não revela se o email existe
      await new Promise((r) => setTimeout(r, 800));
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Auto-elevação para ADMIN se o email for do Gabe (ADMIN_EMAILS ou emails canônicos)
    const adminEmails = (process.env.ADMIN_EMAILS || 'experiatecnologias@gmail.com,reasonablegabriel@gmail.com,gabrielreasonable4@gmail.com')
      .split(',').map(e => e.trim().toLowerCase());
    if (adminEmails.includes(email.toLowerCase()) && user.role !== 'ADMIN') {
      await updateUser(user._id.toString(), { role: 'ADMIN' });
      user.role = 'ADMIN';
      logger.info(`[aidaHandoff] Auto-promovido para ADMIN: ${email}`);
    }

    // Gera o JWT de acesso sem precisar setar cookies (cross-domain safe)
    const token = await setAuthTokens(user._id, res, null, req);

    const { password: _p, totpSecret: _t, __v: _v, ...safeUser } = user.toObject
      ? user.toObject()
      : user;
    safeUser.id = safeUser._id.toString();

    logger.info(`[aidaHandoff] Hub login bem-sucedido: ${email}`);

    return res.status(200).json({ token, user: safeUser });
  } catch (err) {
    logger.error('[aidaHandoff] hub-login error', err);
    return res.status(500).json({ message: 'Erro interno. Tente novamente.' });
  }
});

/**
 * GET /start/:persona?t=<jwt_token>
 * SSO Handoff: valida o token do Hub, seta cookies de sessão no domínio do Chat,
 * e redireciona para a conversa com a persona selecionada já ativa.
 *
 * Parâmetros:
 *   :persona — ID da persona (jordan | zack | miles | alexandra | hayes)
 *   ?t       — JWT access token emitido pelo Hub Login
 */
router.get('/:persona', async (req, res) => {
  try {
    const { persona } = req.params;
    const token = req.query.t;

    if (!ALLOWED_PERSONAS.includes(persona)) {
      return res.redirect(`/?error=invalid_persona`);
    }

    if (!token) {
      // Sem token: redireciona para o Hub para fazer login
      const hubUrl = `${AIDA_HUB_ORIGIN}?redirect_to=${encodeURIComponent(`/start/${persona}`)}`;
      return res.redirect(hubUrl);
    }

    // Valida o JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      logger.warn('[aidaHandoff] Token inválido ou expirado no handoff');
      const hubUrl = `${AIDA_HUB_ORIGIN}?error=session_expired&redirect_to=${encodeURIComponent(`/start/${persona}`)}`;
      return res.redirect(hubUrl);
    }

    // Busca o usuário no banco
    const user = await getUserById(payload.id, '-password -totpSecret');
    if (!user) {
      return res.redirect(`${AIDA_HUB_ORIGIN}?error=user_not_found`);
    }

    // Seta cookies de sessão no domínio DO CHAT (mesmo domínio, sem cross-domain!)
    await setAuthTokens(user._id, res, null, req);

    logger.info(`[aidaHandoff] SSO handoff bem-sucedido: userId=${payload.id}, persona=${persona}`);

    // Redireciona para o chat. O LibreChat abrirá com o modelSpec padrão (jordan é default: true).
    // Para outras personas, usamos localStorage via query param que o wrapper de URL pode capturar.
    // Como o LibreChat não suporta ?model= nativamente, usamos a URL com hash para o preset.
    return res.redirect(`/?persona=${persona}`);
  } catch (err) {
    logger.error('[aidaHandoff] handoff error', err);
    return res.redirect('/?error=handoff_failed');
  }
});

module.exports = router;

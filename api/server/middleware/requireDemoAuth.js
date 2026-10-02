/**
 * Demo Authentication Middleware
 */

const { demoSessionManager } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');

const requireDemoAuth = async (req, res, next) => {
  if (!demoSessionManager || typeof demoSessionManager.isEnabled !== 'function' || !demoSessionManager.isEnabled()) {
    return res.status(403).json({ message: 'Demo mode is not enabled' });
  }

  let token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    const cookies = require('cookie');
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const parsedCookies = cookies.parse(cookieHeader);
      token = parsedCookies.demo_token;
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Demo token missing' });
  }

  try {
    const session = await demoSessionManager.validateToken(token);
    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired demo token' });
    }

    req.demoSession = session;
    req.user = {
      id: `demo-${session.id}`,
      _id: `demo-${session.id}`,
      name: 'Demo User',
      email: 'demo@example.com',
      isDemo: true,
    };

    next();
  } catch (error) {
    logger.error('Demo auth error', error);
    return res.status(401).json({ message: 'Invalid demo token' });
  }
};

module.exports = requireDemoAuth;

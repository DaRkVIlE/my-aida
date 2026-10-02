/**
 * Demo Message Limiter Middleware
 */

const { demoSessionManager } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');

const demoMessageLimiter = async (req, res, next) => {
  if (!demoSessionManager || typeof demoSessionManager.isEnabled !== 'function' || !demoSessionManager.isEnabled()) {
    return next();
  }

  if (!req.demoSession) {
    return next();
  }

  try {
    const result = await demoSessionManager.incrementMessageCount(req.demoSession.id);
    
    if (!result.success) {
      logger.info(`Demo session ${req.demoSession.id} has reached message limit`);
      return res.status(429).json({
      message: 'You have reached the maximum number of messages for this demo session. Please create an account to continue.',
      remaining: 0,
      limit: demoSessionManager.getConfig().maxMessages,
    });
  }

    res.setHeader('X-Demo-Remaining-Messages', result.remaining);
    next();
  } catch (error) {
    logger.error('Demo message limiter error', error);
    next(error);
  }
};

module.exports = demoMessageLimiter;

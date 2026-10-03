const mongoose = require('mongoose');
const { createSharedLinkAccessMiddleware } = require('@librechat/api');

process.env.ALLOW_SHARED_LINKS_PUBLIC = process.env.ALLOW_SHARED_LINKS_PUBLIC || 'true';
const canAccessSharedLink = createSharedLinkAccessMiddleware({ mongoose });

module.exports = canAccessSharedLink;

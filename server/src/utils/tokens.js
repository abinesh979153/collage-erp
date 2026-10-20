const jwt = require('jsonwebtoken');
const env = require('../config/env');

const ALG = { algorithms: ['HS256'] };

function signAccess(user) {
  return jwt.sign({ role: user.role, tv: user.tokenVersion, typ: 'access' }, env.JWT_ACCESS_SECRET, {
    subject: String(user._id),
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

function signRefresh(user) {
  return jwt.sign({ tv: user.tokenVersion, typ: 'refresh' }, env.JWT_REFRESH_SECRET, {
    subject: String(user._id),
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

function verifyAccess(token) {
  const p = jwt.verify(token, env.JWT_ACCESS_SECRET, ALG);
  if (p.typ !== 'access') throw new Error('wrong token type');
  return p;
}

function verifyRefresh(token) {
  const p = jwt.verify(token, env.JWT_REFRESH_SECRET, ALG);
  if (p.typ !== 'refresh') throw new Error('wrong token type');
  return p;
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };

const {
  UnAuthorizedError, ERR_INVALID_TOKEN, ERR_NO_TOKEN, ForbiddenError,
} = require('moleculer-web').Errors;
const { MoleculerError } = require('moleculer').Errors;

const authorize = async (ctx, route, req) => {
  // Check if token exists in header
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) throw new UnAuthorizedError(ERR_NO_TOKEN);

  // Check if session is active
  ctx.meta.authkey = auth.slice(7);
  let session;
  try {
    session = await ctx.call('session.check', { authkey: ctx.meta.authkey, ip: ctx.meta.ip });
  } catch (e) {
    if (e.type === 'SERVICE_NOT_AVAILABLE') {
      throw new MoleculerError('Services are yet to startup', 408, 'TIMEOUT');
    } else throw new UnAuthorizedError(ERR_INVALID_TOKEN);
  }
  ctx.meta.session = session;

  // Get user data from session
  ctx.meta.user = await ctx.call('user.get', { id: String(session.user) });

  // Route level restriction
  if (req.originalUrl.startsWith('/seller') && ctx.meta.user.role !== 'seller') throw new UnAuthorizedError(ForbiddenError);
  else if (req.originalUrl.startsWith('/buyer') && ctx.meta.user.role !== 'buyer') throw new UnAuthorizedError(ForbiddenError);
};

module.exports = authorize;

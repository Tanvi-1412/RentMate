const { sendError } = require('../utils/response');

const checkOwnership = (Model, paramName = 'id', ownerField = 'ownerId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return sendError(res, 404, 'Resource not found');
      }

      // Admins bypass normal ownership checks
      if (req.user.role === 'ADMIN') {
        req.resource = resource;
        return next();
      }

      const resourceOwnerId = resource[ownerField].toString();
      if (resourceOwnerId !== req.user.userId) {
        return sendError(res, 403, 'Forbidden: You do not own this resource');
      }

      req.resource = resource;
      next();
    } catch (error) {
      return sendError(res, 500, 'Error checking resource ownership', error.message);
    }
  };
};

module.exports = checkOwnership;

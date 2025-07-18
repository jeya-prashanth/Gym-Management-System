import { ForbiddenError } from '../utils/errorHandler.js';

export const roles = {
  ADMIN: 'admin',
  GYM: 'gym',
  MEMBER: 'member'
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      throw new ForbiddenError('Not authorized to access this route');
    }

    const rolesArray = [...allowedRoles];
    const hasPermission = rolesArray.includes(req.user.role);

    if (!hasPermission) {
      throw new ForbiddenError('Not authorized to access this resource');
    }

    next();
  };
};

export const checkOwnership = (modelName, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const Model = (await import(`../models/${modelName}.js`)).default;
      const resource = await Model.findById(req.params[idParam]);

      if (!resource) {
        throw new Error('Resource not found');
      }

      const isAdmin = req.user.role === roles.ADMIN;
      const isOwner = resource.user && resource.user.toString() === req.user.id;
      const isGymOwner = resource.gym && resource.gym.toString() === req.user.gym?.toString();

      if (!isAdmin && !isOwner && !isGymOwner) {
        throw new ForbiddenError('Not authorized to modify this resource');
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const restrictTo = {
  admin: authorize(roles.ADMIN),
  gym: authorize(roles.GYM),
  member: authorize(roles.MEMBER),
  adminAndGym: authorize(roles.ADMIN, roles.GYM),
  adminAndMember: authorize(roles.ADMIN, roles.MEMBER)
};

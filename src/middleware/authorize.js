const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin'
};

const PERMISSIONS = {
  [ROLES.VIEWER]: {
    canViewRecords: true,
    canViewSummary: true,
    canCreateRecords: false,
    canUpdateRecords: false,
    canDeleteRecords: false,
    canManageUsers: false
  },
  [ROLES.ANALYST]: {
    canViewRecords: true,
    canViewSummary: true,
    canCreateRecords: true,
    canUpdateRecords: false,
    canDeleteRecords: false,
    canManageUsers: false
  },
  [ROLES.ADMIN]: {
    canViewRecords: true,
    canViewSummary: true,
    canCreateRecords: true,
    canUpdateRecords: true,
    canDeleteRecords: true,
    canManageUsers: true
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userPermissions = PERMISSIONS[req.user.role];

    if (!userPermissions || !userPermissions[permission]) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
        code: 'PERMISSION_DENIED'
      });
    }

    next();
  };
};

const requireAdmin = authorize(ROLES.ADMIN);

const requireAnalystOrAdmin = authorize(ROLES.ANALYST, ROLES.ADMIN);

const canCreate = checkPermission('canCreateRecords');
const canUpdate = checkPermission('canUpdateRecords');
const canDelete = checkPermission('canDeleteRecords');
const canView = checkPermission('canViewRecords');
const canViewSummary = checkPermission('canViewSummary');
const canManageUsers = checkPermission('canManageUsers');

module.exports = {
  ROLES,
  PERMISSIONS,
  authorize,
  checkPermission,
  requireAdmin,
  requireAnalystOrAdmin,
  canCreate,
  canUpdate,
  canDelete,
  canView,
  canViewSummary,
  canManageUsers
};

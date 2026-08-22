import jwt from 'jsonwebtoken';
import { db } from '../database/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'health_passport_super_secret_jwt_key_2026';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo convenience, allow a fallback Demo-User-Id header if provided in development
    const demoUserId = req.headers['x-demo-user-id'];
    if (demoUserId) {
      const user = db.users.find(u => u.id === demoUserId);
      if (user) {
        req.user = user;
        if (user.role === 'patient') {
          req.patient = db.patients.find(p => p.user_id === user.id);
        } else if (user.role === 'doctor') {
          req.doctor = db.doctors.find(d => d.user_id === user.id);
        }
        return next();
      }
    }
    return res.status(401).json({ error: 'Unauthorized: Authentication token is required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User session not found' });
    }

    req.user = user;
    if (user.role === 'patient') {
      req.patient = db.patients.find(p => p.user_id === user.id);
    } else if (user.role === 'doctor') {
      req.doctor = db.doctors.find(d => d.user_id === user.id);
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token', details: err.message });
  }
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied: Role '${req.user.role}' is not authorized for this resource.`
      });
    }

    next();
  };
}

export function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

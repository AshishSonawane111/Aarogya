import express from 'express';
import { db } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authenticate, (req, res) => {
  const notifications = db.notifications.filter(n => n.user_id === req.user.id);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  res.json({
    unread_count: unreadCount,
    notifications
  });
});

// Mark single notification as read
router.patch('/:id/read', authenticate, (req, res) => {
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id && n.user_id === req.user.id);

  if (!notif) return res.status(404).json({ error: 'Notification not found' });

  notif.is_read = true;

  res.json({ success: true, notification: notif });
});

// Mark all as read
router.post('/mark-all-read', authenticate, (req, res) => {
  db.notifications
    .filter(n => n.user_id === req.user.id)
    .forEach(n => { n.is_read = true; });

  res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;

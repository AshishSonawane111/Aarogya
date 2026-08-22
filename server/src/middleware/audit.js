import { recordAuditLog } from '../database/store.js';

export function auditAccess(actionName, categoryExtractor = null) {
  return (req, res, next) => {
    // Wrap response finish to log after successful response
    res.on('finish', () => {
      if (res.statusCode < 400 && req.user) {
        const patientId = req.params.patientId || req.query.patientId || (req.patient ? req.patient.id : null);
        const category = categoryExtractor ? categoryExtractor(req) : req.query.category || req.body?.category || null;

        let actorName = 'User';
        if (req.patient) actorName = `${req.patient.first_name} ${req.patient.last_name}`;
        if (req.doctor) actorName = `Dr. ${req.doctor.first_name} ${req.doctor.last_name}`;

        recordAuditLog({
          patient_id: patientId,
          actor_id: req.user.id,
          actor_role: req.user.role,
          actor_name: actorName,
          doctor_id: req.doctor ? req.doctor.id : null,
          action: actionName,
          category_accessed: category,
          consent_status: req.consentStatus || 'authorized',
          ip_address: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          user_agent: req.headers['user-agent'] || 'Web Browser',
          details: {
            path: req.originalUrl,
            method: req.method,
            status: res.statusCode
          }
        });
      }
    });

    next();
  };
}

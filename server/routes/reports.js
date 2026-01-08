import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.userId;
    const { type, startDate, endDate, status } = req.query;

    let query = db('reports')
      .where('user_id', userId)
      .orWhere('generated_by', userId);

    if (type) {
      query = query.where('type', type);
    }
    if (status) {
      query = query.where('status', status);
    }
    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }
    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const reports = await query.orderBy('created_at', 'desc');

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.post('/patient-summary', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { patientId, includeVitals, includeMedications, includeLabs, includeEncounters } = req.body;

    const patient = await db('patients').where('id', patientId).first();
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const reportData = {
      patient: {
        id: patient.id,
        name: patient.name,
        dob: patient.dob,
        gender: patient.gender,
        mrn: patient.mrn,
      },
      vitals: [],
      medications: [],
      labs: [],
      encounters: [],
    };

    if (includeVitals) {
      reportData.vitals = await db('vitals')
        .where('patient_id', patientId)
        .orderBy('timestamp', 'desc')
        .limit(50);
    }

    if (includeMedications) {
      reportData.medications = await db('medications')
        .where('patient_id', patientId)
        .where('status', 'active');
    }

    if (includeLabs) {
      reportData.labs = await db('labs')
        .where('patient_id', patientId)
        .orderBy('date', 'desc')
        .limit(20);
    }

    if (includeEncounters) {
      reportData.encounters = await db('encounters')
        .where('patient_id', patientId)
        .orderBy('date', 'desc')
        .limit(10);
    }

    const reportId = uuidv4();
    const report = {
      id: reportId,
      type: 'patient_summary',
      title: `Health Summary - ${patient.name}`,
      user_id: patient.user_id,
      generated_by: req.user.userId,
      status: 'completed',
      data: JSON.stringify(reportData),
      format: 'json',
      created_at: new Date().toISOString(),
    };

    await db('reports').insert(report);

    res.json({
      reportId: report.id,
      title: report.title,
      data: reportData,
      createdAt: report.created_at,
    });
  } catch (error) {
    console.error('Generate patient summary error:', error);
    res.status(500).json({ error: 'Failed to generate patient summary' });
  }
});

router.post('/clinical-encounter', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { encounterId } = req.body;

    const encounter = await db('encounters').where('id', encounterId).first();
    if (!encounter) return res.status(404).json({ error: 'Encounter not found' });

    const patient = await db('patients').where('id', encounter.patient_id).first();
    const clinician = await db('users').where('id', encounter.clinician_id).first();

    const vitals = await db('vitals')
      .where('patient_id', encounter.patient_id)
      .where('timestamp', '>=', new Date(encounter.date).toISOString())
      .orderBy('timestamp', 'asc')
      .limit(10);

    const reportData = {
      encounter: {
        id: encounter.id,
        type: encounter.type,
        date: encounter.date,
        chiefComplaint: encounter.chief_complaint,
        notes: encounter.notes,
        diagnosis: encounter.diagnosis,
        disposition: encounter.disposition,
      },
      patient: {
        name: patient.name,
        mrn: patient.mrn,
        dob: patient.dob,
        gender: patient.gender,
      },
      clinician: {
        name: clinician.name,
        role: clinician.role,
      },
      vitals: vitals,
    };

    const reportId = uuidv4();
    const report = {
      id: reportId,
      type: 'clinical_encounter',
      title: `Encounter Report - ${patient.name} - ${new Date(encounter.date).toLocaleDateString()}`,
      user_id: patient.user_id,
      generated_by: req.user.userId,
      status: 'completed',
      data: JSON.stringify(reportData),
      format: 'json',
      created_at: new Date().toISOString(),
    };

    await db('reports').insert(report);

    res.json({
      reportId: report.id,
      title: report.title,
      data: reportData,
      createdAt: report.created_at,
    });
  } catch (error) {
    console.error('Generate clinical encounter report error:', error);
    res.status(500).json({ error: 'Failed to generate encounter report' });
  }
});

router.post('/analytics', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { startDate, endDate, reportType } = req.body;

    const reportData = {
      period: { start: startDate, end: endDate },
      metrics: {},
    };

    if (reportType === 'all' || reportType === 'triage') {
      const triageStats = await db('triage_sessions')
        .whereBetween('created_at', [startDate, endDate])
        .select(
          db.raw('COUNT(*) as total'),
          db.raw('SUM(CASE WHEN disposition = "emergency" THEN 1 ELSE 0 END) as emergency'),
          db.raw('SUM(CASE WHEN disposition = "urgent" THEN 1 ELSE 0 END) as urgent'),
          db.raw('SUM(CASE WHEN disposition = "routine" THEN 1 ELSE 0 END) as routine'),
          db.raw('SUM(CASE WHEN disposition = "self_care" THEN 1 ELSE 0 END) as self_care')
        )
        .first();

      reportData.metrics.triage = triageStats;
    }

    if (reportType === 'all' || reportType === 'encounters') {
      const encounterStats = await db('encounters')
        .whereBetween('date', [startDate, endDate])
        .select(
          db.raw('COUNT(*) as total'),
          db.raw('COUNT(DISTINCT patient_id) as unique_patients'),
          db.raw('COUNT(DISTINCT clinician_id) as unique_clinicians')
        )
        .first();

      const encountersByType = await db('encounters')
        .whereBetween('date', [startDate, endDate])
        .select('type')
        .count('* as count')
        .groupBy('type');

      reportData.metrics.encounters = {
        ...encounterStats,
        byType: encountersByType,
      };
    }

    if (reportType === 'all' || reportType === 'vitals') {
      const vitalsStats = await db('vitals')
        .whereBetween('timestamp', [startDate, endDate])
        .select(
          db.raw('COUNT(*) as total'),
          db.raw('COUNT(DISTINCT patient_id) as unique_patients'),
          db.raw('AVG(CAST(heart_rate AS REAL)) as avg_heart_rate'),
          db.raw('AVG(CAST(spo2 AS REAL)) as avg_spo2'),
          db.raw('AVG(CAST(temperature AS REAL)) as avg_temperature')
        )
        .first();

      reportData.metrics.vitals = vitalsStats;
    }

    if (reportType === 'all' || reportType === 'alerts') {
      const alertStats = await db('alerts')
        .whereBetween('timestamp', [startDate, endDate])
        .select(
          db.raw('COUNT(*) as total'),
          db.raw('SUM(CASE WHEN severity = "critical" THEN 1 ELSE 0 END) as critical'),
          db.raw('SUM(CASE WHEN severity = "warning" THEN 1 ELSE 0 END) as warning'),
          db.raw('SUM(CASE WHEN status = "resolved" THEN 1 ELSE 0 END) as resolved')
        )
        .first();

      reportData.metrics.alerts = alertStats;
    }

    if (req.user.role === 'admin' && (reportType === 'all' || reportType === 'subscriptions')) {
      const subscriptionStats = await db('subscriptions')
        .whereBetween('created_at', [startDate, endDate])
        .select('tier')
        .count('* as count')
        .groupBy('tier');

      reportData.metrics.subscriptions = {
        byTier: subscriptionStats,
      };
    }

    const reportId = uuidv4();
    const report = {
      id: reportId,
      type: 'analytics',
      title: `Analytics Report - ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      user_id: req.user.userId,
      generated_by: req.user.userId,
      status: 'completed',
      data: JSON.stringify(reportData),
      format: 'json',
      created_at: new Date().toISOString(),
    };

    await db('reports').insert(report);

    res.json({
      reportId: report.id,
      title: report.title,
      data: reportData,
      createdAt: report.created_at,
    });
  } catch (error) {
    console.error('Generate analytics report error:', error);
    res.status(500).json({ error: 'Failed to generate analytics report' });
  }
});

router.post('/governance', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { startDate, endDate } = req.body;

    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const reportData = {
      period: { start: startDate, end: endDate },
      aiPerformance: {},
      compliance: {},
      blockchain: {},
    };

    const feedbackStats = await db('clinician_feedback')
      .whereBetween('created_at', [startDate, endDate])
      .select(
        db.raw('COUNT(*) as total_decisions'),
        db.raw('SUM(CASE WHEN action = "accepted" THEN 1 ELSE 0 END) as accepted'),
        db.raw('SUM(CASE WHEN action = "overridden" THEN 1 ELSE 0 END) as overridden'),
        db.raw('SUM(CASE WHEN action = "modified" THEN 1 ELSE 0 END) as modified')
      )
      .first();

    const acceptanceRate = feedbackStats.total_decisions > 0
      ? (feedbackStats.accepted / feedbackStats.total_decisions) * 100
      : 0;

    reportData.aiPerformance = {
      ...feedbackStats,
      acceptanceRate: acceptanceRate.toFixed(2) + '%',
    };

    const feedbackByModel = await db('clinician_feedback')
      .whereBetween('created_at', [startDate, endDate])
      .select('model_id', 'action')
      .count('* as count')
      .groupBy('model_id', 'action');

    reportData.aiPerformance.byModel = feedbackByModel;

    const consentStats = await db('consent_records')
      .whereBetween('created_at', [startDate, endDate])
      .select(
        db.raw('COUNT(*) as total_consents'),
        db.raw('SUM(CASE WHEN status = "granted" THEN 1 ELSE 0 END) as granted'),
        db.raw('SUM(CASE WHEN status = "revoked" THEN 1 ELSE 0 END) as revoked')
      )
      .first();

    reportData.compliance.consents = consentStats;

    const auditStats = await db('audit_logs')
      .whereBetween('timestamp', [startDate, endDate])
      .select(
        db.raw('COUNT(*) as total_events'),
        db.raw('COUNT(DISTINCT user_id) as unique_users'),
        db.raw('COUNT(DISTINCT action) as unique_actions')
      )
      .first();

    reportData.compliance.auditLogs = auditStats;

    const blockchainStats = await db('subscriptions')
      .whereBetween('created_at', [startDate, endDate])
      .whereNotNull('transaction_hash')
      .select(
        db.raw('COUNT(*) as total_transactions'),
        db.raw('COUNT(DISTINCT user_id) as unique_users')
      )
      .first();

    reportData.blockchain = blockchainStats;

    const reportId = uuidv4();
    const report = {
      id: reportId,
      type: 'governance',
      title: `Governance Report - ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      user_id: req.user.userId,
      generated_by: req.user.userId,
      status: 'completed',
      data: JSON.stringify(reportData),
      format: 'json',
      created_at: new Date().toISOString(),
    };

    await db('reports').insert(report);

    res.json({
      reportId: report.id,
      title: report.title,
      data: reportData,
      createdAt: report.created_at,
    });
  } catch (error) {
    console.error('Generate governance report error:', error);
    res.status(500).json({ error: 'Failed to generate governance report' });
  }
});

router.post('/subscription', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.userId;

    const subscriptions = await db('subscriptions')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    const currentSubscription = await db('subscriptions')
      .where('user_id', userId)
      .where('status', 'active')
      .first();

    const reportData = {
      currentSubscription: currentSubscription || null,
      history: subscriptions,
      summary: {
        totalSubscriptions: subscriptions.length,
        activeSubscription: currentSubscription?.tier || 'none',
        lifetimeValue: subscriptions.length * 29, // Simplified calculation
      },
    };

    const reportId = uuidv4();
    const report = {
      id: reportId,
      type: 'subscription',
      title: 'Subscription History Report',
      user_id: userId,
      generated_by: userId,
      status: 'completed',
      data: JSON.stringify(reportData),
      format: 'json',
      created_at: new Date().toISOString(),
    };

    await db('reports').insert(report);

    res.json({
      reportId: report.id,
      title: report.title,
      data: reportData,
      createdAt: report.created_at,
    });
  } catch (error) {
    console.error('Generate subscription report error:', error);
    res.status(500).json({ error: 'Failed to generate subscription report' });
  }
});

router.get('/:reportId', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { reportId } = req.params;
    const userId = req.user.userId;

    const report = await db('reports')
      .where('id', reportId)
      .where(function() {
        this.where('user_id', userId).orWhere('generated_by', userId);
      })
      .first();

    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.data = JSON.parse(report.data);
    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

router.delete('/:reportId', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { reportId } = req.params;
    const userId = req.user.userId;

    const deleted = await db('reports')
      .where('id', reportId)
      .where('generated_by', userId)
      .delete();

    if (deleted === 0) return res.status(404).json({ error: 'Report not found' });

    res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

router.get('/:reportId/export/csv', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { reportId } = req.params;
    const userId = req.user.userId;

    const report = await db('reports')
      .where('id', reportId)
      .where(function() {
        this.where('user_id', userId).orWhere('generated_by', userId);
      })
      .first();

    if (!report) return res.status(404).json({ error: 'Report not found' });

    const data = JSON.parse(report.data);
    let csv = '';
    
    if (report.type === 'analytics') {
      csv = 'Metric,Value\n';
      Object.entries(data.metrics).forEach(([category, metrics]) => {
        csv += `\n${category.toUpperCase()}\n`;
        Object.entries(metrics).forEach(([key, value]) => {
          if (typeof value === 'object') {
            csv += `${key},${JSON.stringify(value)}\n`;
          } else {
            csv += `${key},${value}\n`;
          }
        });
      });
    } else {
      csv = JSON.stringify(data, null, 2);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { reportType, frequency, parameters } = req.body;
    const userId = req.user.userId;

    const scheduleId = uuidv4();
    const schedule = {
      id: scheduleId,
      user_id: userId,
      report_type: reportType,
      frequency,
      parameters: JSON.stringify(parameters),
      status: 'active',
      last_run: null,
      next_run: calculateNextRun(frequency),
      created_at: new Date().toISOString(),
    };

    await db('report_schedules').insert(schedule);

    res.json({
      scheduleId: schedule.id,
      message: 'Scheduled',
      nextRun: schedule.next_run,
    });
  } catch (error) {
    console.error('Schedule report error:', error);
    res.status(500).json({ error: 'Failed to schedule report' });
  }
});

function calculateNextRun(frequency) {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
}

export default router;

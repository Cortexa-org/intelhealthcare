# Healthcare Reporting System Documentation

## Overview
Comprehensive reporting system for generating clinical, analytical, and governance reports with backend API routes and database support.

---

## 🎯 Report Types

### 1. **Patient Summary Report**
Complete health overview for a patient.

**Endpoint**: `POST /api/reports/patient-summary`

**Request**:
```json
{
  "patientId": "uuid",
  "includeVitals": true,
  "includeMedications": true,
  "includeLabs": true,
  "includeEncounters": true
}
```

**Response**:
```json
{
  "reportId": "uuid",
  "title": "Health Summary - John Doe",
  "data": {
    "patient": {
      "id": "uuid",
      "name": "John Doe",
      "dob": "1980-01-01",
      "gender": "M",
      "mrn": "MRN001"
    },
    "vitals": [...],
    "medications": [...],
    "labs": [...],
    "encounters": [...]
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. **Clinical Encounter Report**
Detailed report for a specific encounter.

**Endpoint**: `POST /api/reports/clinical-encounter`

**Request**:
```json
{
  "encounterId": "uuid"
}
```

**Response**:
```json
{
  "reportId": "uuid",
  "title": "Encounter Report - John Doe - 01/01/2024",
  "data": {
    "encounter": {
      "type": "televisit",
      "date": "2024-01-01",
      "chiefComplaint": "Chest pain",
      "diagnosis": "...",
      "disposition": "..."
    },
    "patient": {...},
    "clinician": {...},
    "vitals": [...]
  },
  "createdAt": "..."
}
```

---

### 3. **Analytics Report**
Statistical overview of system usage.

**Endpoint**: `POST /api/reports/analytics`

**Request**:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "reportType": "all"
}
```

**Report Types**:
- `all` - All metrics
- `triage` - Triage statistics only
- `encounters` - Encounter statistics only
- `vitals` - Vitals statistics only
- `alerts` - Alert statistics only
- `subscriptions` - Subscription statistics (admin only)

**Response**:
```json
{
  "reportId": "uuid",
  "title": "Analytics Report - 01/01/2024 to 12/31/2024",
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    },
    "metrics": {
      "triage": {
        "total": 1500,
        "emergency": 45,
        "urgent": 320,
        "routine": 890,
        "self_care": 245
      },
      "encounters": {
        "total": 850,
        "unique_patients": 520,
        "unique_clinicians": 12,
        "byType": [
          { "type": "televisit", "count": 450 },
          { "type": "in_person", "count": 400 }
        ]
      },
      "vitals": {
        "total": 12500,
        "unique_patients": 680,
        "avg_heart_rate": 75.3,
        "avg_spo2": 97.2,
        "avg_temperature": 98.4
      },
      "alerts": {
        "total": 234,
        "critical": 12,
        "warning": 222,
        "resolved": 198
      }
    }
  }
}
```

---

### 4. **Governance Report** (FR-30, FR-31)
AI performance and compliance metrics.

**Endpoint**: `POST /api/reports/governance`

**Access**: Admin only

**Request**:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response**:
```json
{
  "reportId": "uuid",
  "title": "Governance Report - 01/01/2024 to 12/31/2024",
  "data": {
    "period": {...},
    "aiPerformance": {
      "total_decisions": 5000,
      "accepted": 4200,
      "overridden": 600,
      "modified": 200,
      "acceptanceRate": "84.00%",
      "byModel": [
        {
          "model_id": "triage_v1",
          "action": "accepted",
          "count": 3200
        }
      ]
    },
    "compliance": {
      "consents": {
        "total_consents": 850,
        "granted": 820,
        "revoked": 30
      },
      "auditLogs": {
        "total_events": 125000,
        "unique_users": 1200,
        "unique_actions": 15
      }
    },
    "blockchain": {
      "total_transactions": 450,
      "unique_users": 380
    }
  }
}
```

---

### 5. **Subscription Report**
User's subscription history.

**Endpoint**: `POST /api/reports/subscription`

**Request**: No body required (uses authenticated user)

**Response**:
```json
{
  "reportId": "uuid",
  "title": "Subscription History Report",
  "data": {
    "currentSubscription": {
      "tier": "premium",
      "status": "active",
      "startDate": "2024-01-01"
    },
    "history": [...],
    "summary": {
      "totalSubscriptions": 3,
      "activeSubscription": "premium",
      "lifetimeValue": 87
    }
  }
}
```

---

## 🔍 Query Reports

### Get All Reports
**Endpoint**: `GET /api/reports`

**Query Parameters**:
- `type` - Filter by report type
- `status` - Filter by status
- `startDate` - Filter by creation date (from)
- `endDate` - Filter by creation date (to)

**Example**:
```
GET /api/reports?type=analytics&status=completed&startDate=2024-01-01
```

---

### Get Specific Report
**Endpoint**: `GET /api/reports/:reportId`

**Response**: Full report with parsed JSON data

---

## 📥 Export Reports

### Export to CSV
**Endpoint**: `GET /api/reports/:reportId/export/csv`

**Response**: CSV file download

**Headers**:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="Report Title.csv"
```

---

## 🗑️ Delete Report
**Endpoint**: `DELETE /api/reports/:reportId`

**Authorization**: Can only delete own reports

**Response**:
```json
{
  "message": "Report deleted successfully"
}
```

---

## ⏰ Schedule Reports

### Create Schedule
**Endpoint**: `POST /api/reports/schedule`

**Request**:
```json
{
  "reportType": "analytics",
  "frequency": "weekly",
  "parameters": {
    "reportType": "all",
    "daysBack": 7
  }
}
```

**Frequencies**:
- `daily` - Every 24 hours
- `weekly` - Every 7 days
- `monthly` - Same date each month

**Response**:
```json
{
  "scheduleId": "uuid",
  "message": "Report scheduled successfully",
  "nextRun": "2024-01-08T00:00:00.000Z"
}
```

---

## 🗄️ Database Schema

### `reports` Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  user_id UUID NOT NULL,
  generated_by UUID NOT NULL,
  status VARCHAR DEFAULT 'pending',
  data TEXT,
  format VARCHAR DEFAULT 'json',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (generated_by) REFERENCES users(id)
);
```

### `report_schedules` Table
```sql
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type VARCHAR NOT NULL,
  frequency VARCHAR NOT NULL,
  parameters TEXT,
  status VARCHAR DEFAULT 'active',
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### `clinician_feedback` Table (Governance)
```sql
CREATE TABLE clinician_feedback (
  id UUID PRIMARY KEY,
  clinician_id UUID NOT NULL,
  model_id VARCHAR NOT NULL,
  decision_type VARCHAR NOT NULL,
  ai_recommendation TEXT,
  action VARCHAR NOT NULL,
  clinician_decision TEXT,
  reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (clinician_id) REFERENCES users(id)
);
```

### `consent_records` Table (Compliance)
```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  consent_type VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  details TEXT,
  blockchain_hash VARCHAR,
  granted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### `audit_logs` Table (Compliance)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR NOT NULL,
  resource_type VARCHAR NOT NULL,
  resource_id UUID,
  details TEXT,
  ip_address VARCHAR,
  user_agent VARCHAR,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔐 Security & Authorization

### Authentication
All endpoints require JWT token:
```
Authorization: Bearer <jwt_token>
```

### Permissions
- **Patient Summary**: Clinician or Admin only
- **Clinical Encounter**: Clinician or Admin only
- **Analytics**: Clinician or Admin only
- **Governance**: Admin only
- **Subscription**: Own reports only

### Data Access
- Users can only access reports they created or reports about them
- Report queries filtered by: `user_id = currentUser OR generated_by = currentUser`

---

## 🚀 Setup & Migration

### Run Migration
```bash
npm run migrate:reports
```

### Tables Created
- ✅ `reports`
- ✅ `report_schedules`
- ✅ `clinician_feedback`
- ✅ `consent_records`
- ✅ `audit_logs`

---

## 📊 Report Data Flow

```
1. User requests report
   ↓
2. Backend validates permissions
   ↓
3. Query relevant database tables
   ↓
4. Aggregate and format data
   ↓
5. Create report record in DB
   ↓
6. Return report to user
   ↓
7. User can view/export/delete report
```

---

## 🎯 Use Cases

### Clinical Use
1. **End of Day Summary**: Generate analytics report for daily review
2. **Patient Handoff**: Create patient summary before transfer
3. **Quality Assurance**: Review governance reports monthly

### Administrative Use
1. **Performance Metrics**: Weekly analytics reports
2. **Compliance Audits**: Quarterly governance reports
3. **Subscription Tracking**: Monthly revenue reports

### Patient Use
1. **Health Records**: Generate personal health summary
2. **Insurance Claims**: Export encounter reports to CSV
3. **Subscription History**: Review billing history

---

## 🎨 Frontend Integration (Next Step)

Ready for frontend components:
- `ReportsDashboard.tsx` - View all reports
- `ReportGenerator.tsx` - Create new reports
- `ReportViewer.tsx` - Display report data
- `ReportScheduler.tsx` - Schedule recurring reports

Service layer:
- `src/services/reportService.ts` - API calls

---

## ✅ Features

- ✅ 5 report types (patient, encounter, analytics, governance, subscription)
- ✅ Query filtering (type, status, date range)
- ✅ CSV export
- ✅ Report scheduling
- ✅ Governance metrics (FR-30, FR-31)
- ✅ Audit logging
- ✅ Consent tracking
- ✅ Permission-based access
- ✅ Full database schema
- ✅ RESTful API design

---

## 🔮 Future Enhancements

Potential additions:
- PDF export with custom templates
- Email delivery for scheduled reports
- Report sharing with other users
- Custom report builder
- Data visualization charts
- Report archiving after 90 days
- Real-time report generation status

---

## 📝 Summary

The reporting system provides:
- **Complete backend API** with 11 endpoints
- **5 comprehensive report types** covering all use cases
- **Governance reporting** (FR-30, FR-31 compliance)
- **Audit trails** for compliance
- **Export functionality** (CSV, JSON)
- **Scheduled reports** for automation
- **Secure access control** with JWT authentication

The backend is **production-ready** and waiting for frontend components! 📊✨

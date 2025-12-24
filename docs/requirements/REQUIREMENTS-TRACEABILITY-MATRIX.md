# Requirements Traceability Matrix (RTM) & Gap Analysis

Maps functional requirements (FR-1–FR-31) to the current Healthcare MVP implementation. Use this for compliance audits, sprints, and roadmap planning.

**Legend**

| Status | Meaning |
|--------|---------|
| ✅ Implemented | Requirement is substantially met |
| ⚠️ Partial | Partially met; gaps documented |
| ❌ Not Implemented | No implementation yet |

---

## 1. Clinical Decision Support (CDS) Core

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-1** | ⚠️ Partial | `server/routes/triage.js`, `server/routes/rpm.js`, `server/services/aiService.js`, `ai/prompts.md`, `rpm.checkThresholds` | **Use cases:** Triage (symptoms) and RPM (vitals) exist. **Gaps:** No chest X-ray, sepsis, oncology use cases. Thresholds are hardcoded in `rpm.js` (lines 186–194); no configurable thresholds per use case, no clinical-stakeholder approval workflow. **Next:** Add `use_case_config` table (use_case_id, thresholds JSON, alerting_logic, approved_by, approved_at); expose config API; support additional use cases. |
| **FR-2** | ✅ Implemented | `src/components/AI/AIDecisionModal.tsx`, triage/RPM/meeting UI | AI outputs are presented as recommendations; clinician must confirm/reject. No autonomous actions. Final authority with clinician. |
| **FR-3** | ⚠️ Partial | `AIDecisionModal.tsx` (confidence, provenance), `aiService` (confidence, provenance in JSON), `src/types/index.ts` (AIResponse) | **Implemented:** Confidence scores, provenance strings, low-confidence warning (&lt;60%). **Gaps:** No SHAP/LIME or other explainability visualizations; no explicit “uncertainty” indicator beyond confidence. **Next:** Add SHAP/LIME (or similar) for supported models; surface uncertainty (e.g. confidence intervals, uncertainty badge) in UI. |
| **FR-4** | ⚠️ Partial | `AIDecisionModal.tsx`, `server/routes/ai.js` (POST /decision, GET /decisions, GET /stats), `decision_logs` table | **Implemented:** Accept (confirm) and override (reject) with optional note; logged in `decision_logs` (ai_id, user_id, decision, note, ai_payload). **Gaps:** No explicit “ignore” action (only Cancel which doesn’t log); logging is DB-only, not yet used for model improvement workflows. **Next:** Add “ignore” option and log it; add pipeline to export override logs for model improvement/analytics. |

---

## 2. Data Ingestion & Management

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-5** | ❌ Not Implemented | `server/routes/rpm.js` (custom observation schema), `server/routes/triage.js` | **Current:** Custom JSON for RPM (vitals) and triage (symptoms). **Gaps:** No FHIR, HL7, DICOM, or OMOP. No structured EHR, labs, notes, or imaging ingestion. **Next:** Add adapters/connectors for FHIR R4, HL7v2/v3, DICOM, OMOP CDM; canonical internal model; ingestion API per standard. |
| **FR-6** | ❌ Not Implemented | — | No de-identification or pseudonymization. **Next:** Integrate de-id (e.g. preset tools or APIs); pseudonymization store; re-identification only in authorized clinical context with audit. |
| **FR-7** | ❌ Not Implemented | — | No federated learning or secure enclave training. **Next:** Design federated training pipeline (e.g. FLA), secure enclave options; document data residency and aggregation approach. |

---

## 3. Consent & Privacy Management (Blockchain-Enabled)

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-8** | ❌ Not Implemented | `patients.consent_transcripts`, `transcripts.consent_given` | **Current:** Boolean consent for transcripts only, DB-backed. **Gaps:** No smart contracts; no consent states (grant/restrict/withdraw/scope); no blockchain. **Next:** Define consent ontology and smart contract interface; implement consent states; use pseudonymous identifiers on-chain. |
| **FR-9** | ❌ Not Implemented | Transcript consent checks in meetings flow | **Current:** Consent checked for transcript persistence only. **Gaps:** No consent checks before training, inference, or secondary analysis; no immediate revocation enforcement. **Next:** Consent checks at ingestion, training, and inference; revocation → immediate halt of processing. |
| **FR-10** | ❌ Not Implemented | — | No blockchain; no PHI on-chain policy enforcement. **Next:** Enforce “no PHI on-chain”; only hashes, timestamps, consent state, pseudonymous refs on-chain. |

---

## 4. Model Development & Lifecycle

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-11** | ❌ Not Implemented | `aiService` uses OpenAI API | **Current:** No training in repo; external model API only. **Gaps:** No versioned code/datasets/configs, no random seeds, no training metadata. **Next:** Add training harness with versioning (e.g. DVC, config versioning); log runs (e.g. MLflow); reproducible seeds and env. |
| **FR-12** | ❌ Not Implemented | — | No model registry; no on-chain registration. **Next:** Model registry (e.g. MLflow + EVM); on-chain model id, artifact hash, dataset lineage hashes, approval signatures. |
| **FR-13** | ❌ Not Implemented | — | No retrospective/external/prospective validation workflows; no subgroup metrics. **Next:** Validation pipeline (retrospective/external/prospective); metrics overall and by demographic subgroups. |
| **FR-14** | ❌ Not Implemented | — | No fairness evaluation; no mitigation workflows. **Next:** Fairness metrics across protected attributes; bias detection and mitigation workflow. |

---

## 5. Clinical Evaluation & Trials

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-15** | ❌ Not Implemented | — | No “silent” (non-interventional) mode. **Next:** Silent deployment mode: run inferences, log results, no CDS surfaced to clinicians. |
| **FR-16** | ❌ Not Implemented | — | No pilot/trial support; no configurable alert visibility; no versioned protocols. **Next:** Pilot mode with configurable alert visibility; protocol/amendment versioning and time-stamping. |
| **FR-17** | ❌ Not Implemented | — | No trial auditability; no blockchain. **Next:** Log key trial events (approval, deployment, outcomes) on-chain. |

---

## 6. Deployment & Integration

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-18** | ❌ Not Implemented | — | No EHR integration; no SMART on FHIR. **Next:** SMART on FHIR app; embed CDS in EHR workflows. |
| **FR-19** | ⚠️ Partial | `server/routes/*`, `server/middleware/auth.js` | **Current:** REST APIs for auth, triage, meetings, RPM, chat, AI decisions; JWT + role checks. **Gaps:** No dedicated inference/monitoring/admin API surface; RBAC is basic. **Next:** Formalize inference, monitoring, admin APIs; expand RBAC (e.g. scopes, resource-level). |
| **FR-20** | ❌ Not Implemented | `server/config`, `.env` | **Current:** Single runtime env. **Gaps:** No dev/validation/staging/prod isolation. **Next:** Env-specific config, isolation (DB, secrets, feature flags). |

---

## 7. Monitoring & Post-Market Surveillance

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-21** | ❌ Not Implemented | — | No performance, calibration, or drift monitoring; no threshold alerts. **Next:** Monitoring pipeline (performance, calibration, drift); alerting on threshold breach. |
| **FR-22** | ❌ Not Implemented | — | No data/concept/population drift detection; no drift logging. **Next:** Drift detectors; store and review drift events. |
| **FR-23** | ❌ Not Implemented | `alerts` table (operational alerts only) | **Current:** RPM alerts only. **Gaps:** No safety incident/complaint lifecycle; no on-chain records. **Next:** Incidents/complaints DB + workflow; lifecycle states; immutable on-chain records. |

---

## 8. Blockchain & Auditability (EVM)

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-24** | ❌ Not Implemented | — | No blockchain. **Next:** Permissioned EVM network; role-based node access; audit of access. |
| **FR-25** | ❌ Not Implemented | `decision_logs`, `console.log` audit | **Current:** DB audit for AI decisions; no chain. **Gaps:** No on-chain logs for data access, consent, model deploys, incidents. **Next:** Map audit events to smart contracts; log data access (pseudonymized), consent, deployments, incidents/CAPAs on-chain. |
| **FR-26** | ❌ Not Implemented | — | No cryptographic provenance. **Next:** Hash datasets, models, reports; anchor hashes on-chain; tamper detection. |

---

## 9. Governance & Compliance

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-27** | ❌ Not Implemented | — | No ethics board workflow. **Next:** Ethics approval workflow; hashed, time-stamped decision records. |
| **FR-28** | ❌ Not Implemented | `README` compliance TODOs | **Current:** README lists HIPAA etc. as TODOs. **Gaps:** No audit-ready evidence for FDA, MHRA, EU AI Act, HIPAA; no lifecycle traceability. **Next:** Evidence pack (policies, RTM, validations, audit logs); traceability across lifecycle. |
| **FR-29** | ❌ Not Implemented | — | No model approval workflow; no rollback. **Next:** Approval workflow for model updates; rollback procedure; audit trail. |

---

## 10. Reporting & Analytics

| ID | Status | Artifacts | Gap / Next Steps |
|----|--------|-----------|------------------|
| **FR-30** | ⚠️ Partial | `GET /api/ai/stats`, `GET /api/ai/decisions` | **Current:** Confirm/reject counts and rates; decision list for audit. **Gaps:** No structured analysis of accept/override patterns; no usability/safety feedback loop. **Next:** Analytics over clinician interactions (e.g. by use case, user, time); feed into usability and safety reviews. |
| **FR-31** | ❌ Not Implemented | `src/components/Dashboard/*` | **Current:** General dashboard (stats, quick actions, activity). **Gaps:** No governance dashboards for model performance, fairness, compliance, or blockchain audit. **Next:** Governance dashboards (model performance, fairness, compliance status, chain audit summary); access control. |

---

## Summary

| Category | Implemented | Partial | Not Implemented |
|----------|-------------|---------|------------------|
| 1. CDS Core | 1 | 3 | 0 |
| 2. Data Ingestion | 0 | 0 | 3 |
| 3. Consent & Privacy | 0 | 0 | 3 |
| 4. Model Lifecycle | 0 | 0 | 4 |
| 5. Clinical Trials | 0 | 0 | 3 |
| 6. Deployment | 0 | 1 | 2 |
| 7. Monitoring | 0 | 0 | 3 |
| 8. Blockchain | 0 | 0 | 3 |
| 9. Governance | 0 | 0 | 3 |
| 10. Reporting | 0 | 1 | 1 |
| **Total** | **1** | **5** | **25** |

---

## Recommended Implementation Order

1. **FR-1** — Configurable use-case thresholds and approval workflow (enables safer CDS).
2. **FR-4** — Add “ignore” and ensure override logging supports model improvement.
3. **FR-19** — Strengthen APIs and RBAC (inference, monitoring, admin).
4. **FR-30** — Expand clinician feedback analytics (build on existing `/api/ai/stats`).
5. **FR-5** — FHIR/HL7 ingestion (unblocks EHR integration and FR-18).
6. **FR-20** — Multi-environment support (dev/staging/prod).
7. **FR-21, FR-22** — Performance and drift monitoring (post-market readiness).
8. **FR-8–FR-10, FR-24–FR-26** — Blockchain and consent (multi-sprint).

Use `docs/requirements/FR-SPECIFICATION.md` as the canonical FR source and this RTM for traceability and gap tracking.

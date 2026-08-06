# Clinical Care Engine

The Clinical Care Engine powers the post-session lifecycle on SoulThread, transforming the product from a simple booking directory into a comprehensive digital therapeutics platform.

## Core Modules

1. **Clinical Notes (`ClinicalNotesService.js`)**:
   Strictly partitioned notes ensuring absolute patient privacy.
   - `privateContent`: Highly sensitive provider notes. Completely inaccessible to patients.
   - `sharedSummary`: Curated takeaways that are explicitly published to the patient UI.
   - Notes are automatically drafted the millisecond a session is completed.

2. **Care Plans (`CarePlanService.js`)**:
   Allows Guides to assemble a personalized roadmap of "Homework" (`care_plan_items`).
   - Items can reference global templates from the `ResourceLibrary` or be custom ad-hoc tasks.
   - As patients mark items "completed" on their mobile app, the overall plan `progress` automatically recalculates.

3. **Assessments (`AssessmentService.js`)**:
   Tracks psychometric data (PHQ-9, GAD-7) over time.
   - Guides assign templates.
   - Patients submit answers.
   - The engine automatically calculates the clinical score and pushes the result to the Patient Timeline.

4. **Patient Timeline (`TimelineService.js`)**:
   An immutable, append-only ledger representing the patient's entire recovery history.
   - Serves as the data backbone for the Patient dashboard UI.
   - Automatically updated via the `EventPublisher` (e.g., when a Session completes, an Assessment is scored, or a Care Plan is assigned).

## Security Perimeter
This engine handles the most sensitive data in the platform (HIPAA/GDPR tier data).
- The `clinical_notes` collection is strictly locked down. The API layer (`notesAPI.js`) performs rigorous `request.auth.uid == guideId` validation before allowing any reads or writes.
- Care Plans and Assessments are securely joined to the specific `patientId`.

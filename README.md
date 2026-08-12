# Gambia Education Suite (GES)

An all-in-one institutional School Management SaaS platform designed for modern educational institutions in The Gambia and globally.

## Overview

**Gambia Education Suite (GES)** provides an integrated, role-governed digital infrastructure for school administration, academic management, financial accounting, admissions processing, and student tracking.

---

## Key Features

### 1. Role-Based Access Control (RBAC) & Multi-Portal Architecture
Dedicated views and permissions tailored for 8 distinct user roles:
- **Super Admin**: SaaS platform governance, multi-tenant school onboarding, subscription management, and system audit logs.
- **School Admin**: Full institutional management, academic year setup, staff role assignments, and school configuration.
- **Principal**: Academic governance, promotion policy enforcement, report card approvals, and institutional performance monitoring.
- **Teacher**: Class management, subject-wise marks entry (CA + Exam), attendance tracking, and student advancement recommendations.
- **Accountant**: Student fee structuring, invoice generation, payment processing, printable fee receipts, and institutional expense logging.
- **Receptionist**: Online admissions portal management, applicant tracking, student registration, and parent/guardian linking.
- **Parent**: Guardian dashboard for tracking children's attendance, academic performance, report cards, and fee payment histories.
- **Student**: Student portal for viewing class timetables, published exam results, and school announcements.

### 2. Academic Promotion & Graduation Engine
- Individual student promotion evaluations (🟢 **Promote**, 🔴 **Repeat Grade**, 🟡 **Under Review**).
- Configurable **Principal Approval Required** workflow switch.
- Audit logging tracking evaluator credentials, academic session, destination grade, and rationale.

### 3. Student & Parent Relationship Management
- Structured student admission identifiers (`GIA-2026-XXXX`).
- Multi-parent linking supporting many-to-many relationships (guardians with multiple children, students with multiple contacts).
- Soft-delete status tracking (**ACTIVE**, **TRANSFERRED**, **WITHDRAWN**, **GRADUATED**).

### 4. Examinations, Marks Entry & Report Cards
- Subject-by-subject Continuous Assessment (CA) and End-of-Term Examination scoring.
- Automated score totaling, grade assignment, and GPA calculation.
- Printable official student report cards with teacher/principal commentary.

### 5. Financial Management & Fee Receipts
- Custom fee allocation (Tuition, ICT, Uniforms, Books).
- Payment recording linked to students and parents with instant printable PDF-ready receipts.
- Institutional expense logging and financial summary reporting (GMD / USD).

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, Motion
- **Backend**: Express.js, Node.js, TypeScript (`server.ts`)
- **Build Tools**: Vite, ESBuild, TSX

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or bun

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

3. **Production Build & Execution**:
   ```bash
   npm run build
   npm start
   ```

---

## System Demo Credentials

| Role | Email | Password | Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@gambiaedu.gm` | `admin123` | Platform Governance & Multi-Tenant Management |
| **School Admin** | `admin@gambiaedu.gm` | `admin123` | Institutional Administration & Settings |
| **Principal** | `principal@gambiaedu.gm` | `admin123` | Academic Approvals & Strategic Review |
| **Teacher** | `teacher@gambiaedu.gm` | `admin123` | Class Instruction, Attendance & Marks Entry |
| **Accountant** | `accountant@gambiaedu.gm` | `admin123` | Fees, Payments & Expense Tracking |
| **Receptionist** | `receptionist@gambiaedu.gm` | `admin123` | Admissions & Front-Desk Operations |
| **Parent** | `parent@gambiaedu.gm` | `admin123` | Child Progress, Report Cards & Payment History |
| **Student** | `student@gambiaedu.gm` | `admin123` | Personal Timetable & Academic Results |

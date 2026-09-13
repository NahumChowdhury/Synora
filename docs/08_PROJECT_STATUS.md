# Synora — Project Status

## Purpose

This document tracks the live development status of Synora.

Unlike other documentation, this file is updated after every completed milestone and serves as the project's current checkpoint.

---

# Project Information

**Project Name:** Synora

**Current Version:** v0.1.0 (Development)

**Repository:**
https://github.com/NahumChowdhury/Synora

---

# Current Development Phase

**Phase:**

🟡 Phase 2 — Secure Authentication

Status:

In Progress

---

# Completed Milestones

## Foundation

* Project initialized
* Git repository created
* GitHub repository connected
* PostgreSQL configured
* Prisma configured
* Backend created
* Frontend created

---

## Authentication

Completed:

* User Registration
* User Login
* Password hashing (bcrypt)
* JWT generation
* Database integration
* Frontend ↔ Backend communication

In Progress:

* JWT verification
* Protected dashboard
* Logout
* User profile

---

# Core Modules

## Task Marketplace

Status:

Not Started

---

## Borrow Hub

Status:

Not Started

---

## Opportunity Network

Status:

Not Started

---

## Campus Guide

Status:

Not Started

---

# Current Database

Implemented Models:

* User

Planned Models:

* Task
* TaskApplication
* TaskReview
* BorrowItem
* BorrowRequest
* BorrowHistory
* Opportunity
* OpportunityApplication
* Place
* Review
* Report
* Notification

---

# Current API Endpoints

Implemented:

POST /api/auth/register

POST /api/auth/login

GET /api/auth/verify *(when verified and tested)*

Planned:

GET /api/profile

PUT /api/profile

POST /api/tasks

GET /api/tasks

POST /api/borrow

GET /api/opportunities

POST /api/reviews

---

# Manual Testing Status

| Feature               | Status                 |
| --------------------- | ---------------------- |
| Register              | ✅ Passed               |
| Login                 | ✅ Passed               |
| Password Hashing      | ✅ Passed               |
| PostgreSQL Connection | ✅ Passed               |
| Prisma                | ✅ Passed               |
| Frontend ↔ Backend    | ✅ Passed               |
| JWT Verify            | ⏳ Pending Verification |
| Protected Dashboard   | ⏳ Pending              |
| Logout                | ⏳ Pending              |

---

# Known Issues

No critical issues at this time.

Minor issues should be documented here as they are discovered.

---

# Next Immediate Milestone

Complete Secure Authentication.

Remaining tasks:

* Verify JWT middleware
* Protect dashboard
* Logout
* User profile
* Authentication testing

Only after Phase 2 is complete should development continue to:

➡️ Phase 3 — Task Marketplace

---

# Documentation Status

| Document                  | Status |
| ------------------------- | ------ |
| 00_PROJECT_VISION         | ✅      |
| 01_CORE_RULES             | ✅      |
| 02_FEATURE_SPECIFICATIONS | ✅      |
| 03_DATABASE_RULES         | ✅      |
| 04_UI_UX_GUIDELINES       | ✅      |
| 05_DEVELOPMENT_ROADMAP    | ✅      |
| 06_ARCHITECTURE           | ✅      |
| 07_DECISION_LOG           | ✅      |
| 08_PROJECT_STATUS         | ✅      |

---

# Git Status Checklist

Before every push:

* Documentation updated
* Manual testing completed
* Code committed
* GitHub pushed
* PROJECT_STATUS updated

---

# Last Stable Checkpoint

Authentication system:

* Registration working
* Login working
* Database verified
* JWT generation implemented

Current focus:

**Finish Secure Authentication before beginning Task Marketplace.**

---

# Notes

This file must always reflect the current state of the project.

Whenever a milestone is completed:

1. Update this document.
2. Commit changes.
3. Push to GitHub.

This document is the first file that any developer or AI assistant should read to understand the current progress of Synora.

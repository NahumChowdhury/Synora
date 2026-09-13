# Synora — Database Rules

## Purpose

This document defines the long-term database architecture of Synora.

Every new database table, Prisma model, or relationship must follow these rules.

---

# Database Philosophy

The database should be:

* Normalized
* Scalable
* Secure
* Easy to maintain
* Optimized for future growth

Business rules should be enforced through relationships rather than duplicated data.

---

# Primary Database

PostgreSQL

ORM:

Prisma

---

# Entity Naming Rules

* Model names use PascalCase.
* Database tables use Prisma defaults.
* Field names use camelCase.
* IDs use auto-increment integers unless otherwise approved.

Example:

User

Task

BorrowItem

Review

---

# Common Fields

Every major table should contain:

* id
* createdAt
* updatedAt

If soft deletion is required:

* deletedAt

---

# User Table

Responsible for authentication and identity.

Current fields:

* id
* email
* passwordHash
* createdAt

Future additions:

* fullName
* profilePhoto
* department
* studentId (optional)
* university
* role
* reputationScore

---

# Planned Core Tables

Authentication

* User

Task Marketplace

* Task
* TaskApplication
* TaskReview

Borrow Hub

* BorrowItem
* BorrowRequest
* BorrowHistory

Opportunity Network

* Opportunity
* OpportunityApplication

Campus Guide

* Place
* Review

Administration

* Report
* Notification
* AuditLog

---

# Relationships

User

↓

creates

↓

Task

↓

receives

↓

Applications

↓

selects Worker

↓

TaskReview

BorrowItem

↓

BorrowRequest

↓

BorrowHistory

Place

↓

Review

Opportunity

↓

OpportunityApplication

---

# Data Integrity Rules

* Foreign keys must be used whenever relationships exist.
* No orphan records.
* Cascade deletion only where appropriate.
* User deletion should never destroy platform history unless explicitly approved.

---

# Authentication Data

Passwords:

* Always hashed using bcrypt.

Tokens:

* JWT only.

No plaintext passwords may ever be stored.

---

# Future Expansion Rules

When introducing a new feature:

1. Design database schema first.
2. Update this document.
3. Create Prisma models.
4. Run migration.
5. Implement backend.
6. Implement frontend.

Never reverse this order.

---

# Migration Rules

Every migration must:

* Have a meaningful name.
* Be tested locally.
* Be committed with matching documentation updates.

---

# Documentation Rule

If the database structure changes:

The following documents must be updated:

* PROJECT_STATUS
* DATABASE_RULES
* DEVELOPMENT_ROADMAP (if affected)

Documentation and implementation must always remain synchronized.

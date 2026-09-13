# Synora — Decision Log

## Purpose

This document records every important architectural, business, and design decision made during Synora's development.

Before changing an existing system, review this document to understand why the current approach was chosen.

---

# Decision 001

## University-Only Platform

Decision:

Synora will initially support only verified university students.

Reason:

A trusted community is more valuable than rapid user growth.

Status:

Approved

---

# Decision 002

## One Account per University Email

Decision:

Each institutional email may register only one account.

Reason:

Prevent duplicate accounts and increase trust.

Status:

Approved

---

# Decision 003

## Task Marketplace Uses Anonymous Profiles

Decision:

Users remain anonymous during task application.

Reason:

Reduce bias and encourage fair selection based on skills rather than identity.

Admin can always view the real user.

Status:

Approved

---

# Decision 004

## Opportunity Network Uses Real Identity

Decision:

Opportunity Network is not anonymous.

Reason:

Students need to know who they are collaborating with.

Status:

Approved

---

# Decision 005

## Borrow Hub Uses Credit System

Decision:

New users receive 5 credits.

Borrowing costs 1 credit.

Successfully lending earns 2 credits.

Reason:

Encourage contribution and discourage abuse.

Status:

Approved

---

# Decision 006

## Initial Payment Method

Decision:

Task Marketplace will use Cash on Delivery (COD) during the first release.

Reason:

Avoid payment gateway complexity in the early stages.

Online payment may be introduced later.

Status:

Approved

---

# Decision 007

## Authentication Technology

Decision:

Passwords are hashed using bcrypt.

Authentication uses JWT.

Reason:

Industry-standard security with a simple implementation.

Status:

Approved

---

# Decision 008

## Backend Architecture

Decision:

Frontend and backend remain separate.

Frontend communicates only through REST APIs.

Reason:

Improves scalability and separation of concerns.

Status:

Approved

---

# Decision 009

## Documentation First

Decision:

Major features must be documented before implementation.

Reason:

Reduces misunderstandings and keeps AI-generated code aligned with project goals.

Status:

Approved

---

# Decision 010

## Development Workflow

Decision:

Every feature follows this order:

1. Update documentation (if needed)
2. Design database
3. Backend implementation
4. Backend testing
5. Frontend implementation
6. Frontend testing
7. Update PROJECT_STATUS
8. Commit to Git
9. Push to GitHub

Reason:

Ensures consistency, traceability, and easier debugging.

Status:

Approved

---

# Future Decisions

Every major project decision should be added here with:

* Decision Number
* Title
* Description
* Reason
* Status
* Date (optional)

Never overwrite old decisions.

If a decision changes, create a new entry explaining the change instead of deleting the old one.

This preserves the project's history and rationale.

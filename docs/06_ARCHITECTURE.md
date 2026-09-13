# Synora — System Architecture

## Purpose

This document describes the technical architecture of Synora.

It explains how the frontend, backend, database, and authentication work together.

Every developer and AI assistant should read this document before making architectural changes.

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

Runs on:

```
http://localhost:3000
```

---

## Backend

* Node.js
* Express.js
* TypeScript

Runs on:

```
http://localhost:5000
```

---

## Database

* PostgreSQL

ORM:

* Prisma

---

## Authentication

* bcrypt (password hashing)
* JWT (authentication)
* Protected API endpoints
* Client-side dashboard protection

---

# Project Structure

```
synora/
│
├── docs/
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── lib/
│   ├── components/
│   └── backend/
│       ├── prisma/
│       ├── src/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── lib/
│       │   ├── types/
│       │   └── server.ts
│
├── PROJECT_STATUS.md
└── README.md (future)
```

> **Note:** If folders are added in the future, this structure should be updated.

---

# System Flow

```
User

↓

Frontend (Next.js)

↓

Express API

↓

Prisma ORM

↓

PostgreSQL
```

The frontend should never communicate directly with the database.

All database access must go through the backend API.

---

# Authentication Flow

```
Register

↓

Backend

↓

Hash Password

↓

Save User

↓

Login

↓

Verify Password

↓

Generate JWT

↓

Frontend stores token

↓

Dashboard

↓

Verify Token

↓

Protected Content
```

---

# API Design Principles

* Use REST endpoints.
* Return JSON responses.
* Use proper HTTP status codes.
* Validate request data.
* Handle errors consistently.

Example:

```
GET    /api/auth/verify
POST   /api/auth/login
POST   /api/auth/register
```

---

# Database Access Rules

Only backend controllers may communicate with Prisma.

Frontend must never:

* Import Prisma
* Query PostgreSQL directly
* Contain business logic for database operations

---

# Frontend Responsibilities

The frontend is responsible for:

* User interface
* User interactions
* Form validation (basic)
* Calling backend APIs
* Displaying API responses

The frontend should not contain business logic that belongs in the backend.

---

# Backend Responsibilities

The backend is responsible for:

* Authentication
* Authorization
* Business logic
* Database operations
* Validation
* Security
* API responses

---

# Documentation Rule

Whenever the architecture changes:

Update:

* ARCHITECTURE.md
* PROJECT_STATUS.md

before committing.

---

# Coding Standards

## General

* Use TypeScript.
* Keep functions small and readable.
* Prefer reusable utilities over duplicate code.
* Separate concerns (UI, business logic, data access).

## Naming

Variables:

camelCase

Functions:

camelCase

Components:

PascalCase

Models:

PascalCase

Files:

Follow the existing project conventions.

---

# Future Architecture Goals

As Synora grows, the architecture may include:

* Shared TypeScript types
* API service layer
* Global state management
* File upload service
* Real-time notifications
* Background jobs
* Deployment pipeline

These should be added without breaking the existing architecture.

---

# Architecture Principle

Synora should remain:

* Modular
* Scalable
* Maintainable
* Secure
* Easy to understand

Every architectural decision should prioritize long-term maintainability over short-term convenience.

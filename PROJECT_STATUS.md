# Synora Project Status

---

# Project Overview

**Project Name:** Synora — DIU Campus

**Goal:**

Synora is a modern full-stack university collaboration platform built specifically for DIU students.

The platform is focused on **TWO CORE PILLARS**:

1. **Task Marketplace**: Anonymous student-to-student task hiring and academic workspace assistance.
2. **Team Match & Opportunity Network**: Professional student collaboration for projects, research, clubs, startups, tours, competitions, and business ideas.

Messaging supports both systems.

The project is production-ready, fully hand-designed with a Stripe/Linear-level light SaaS aesthetic, and backed by robust PostgreSQL APIs.

---

# Core Features (Final 2 MVP Pillars)

## 1. Task Marketplace

**Status:** Completed ✅

Features:
- Students post paid/academic tasks
- Anonymous student worker handles (e.g. `Student #102`) to keep worker email identity private
- Workers apply with pitches
- Task owner selects worker & communicates via dedicated task chat
- Full Task lifecycle: `OPEN` -> `ASSIGNED` -> `IN_PROGRESS` -> `COMPLETED` / `CANCELLED`
- Anonymous dual rating system (1-5 stars) with 1-day waiting enforcement
- Admin task moderation

---

## 2. Team Match & Opportunity Network

**Status:** Completed & Expanded ✅

Features:
- **Structured Categories**:
  - *Academic & Projects*: University Project, Course Project, Thesis / Research, Study Group
  - *Clubs & Competitions*: Club Member, Event Team, Competition Team, Hackathon Team, Volunteer Team
  - *Startup & Business*: Startup Partner, Co-founder Search, Business Partner, Business Idea Collaboration
  - *Tours & Activities*: Tour / Travel Group, Event Companion, Activity Partner
  - *Skills & Collaboration*: Skill Partner, Designer / Developer, Content / Media, Marketing
- **Rich Opportunity Creation**: Title, Category, Sub-category, Description, "What looking for", Required skills, People needed, Deadline, Dept, Preferred batch, Meeting preference (`In-Person`, `Online`, `Hybrid`), Location.
- **Application & Response Flow**: Students express interest; creators can review applicants and **Accept** or **Reject**.
- **Messaging Integration**: Accepting a team match application automatically establishes/links a direct chat conversation.
- **Opportunity Management**: Opportunity creator can toggle status (`OPEN` / `CLOSED`) or delete posts.

---

## 3. Messaging & Chat

**Status:** Completed ✅

Features:
- Professional split-view messaging interface
- Real-time conversation tracking linked to task marketplace and team match applications

---

# Permanently Removed Modules

- **Borrow Hub / Credit System**: Permanently removed across frontend tabs, cards, modals, backend controllers (`borrowController.ts`), routes (`/api/borrow`), Prisma models (`BorrowItem`, `BorrowRequest`, `CreditTransaction`), user fields, and feature settings.
- **Campus Directory / Shops & Hotels**: Permanently removed across all layers.

---

# Architecture & Security

## Database & ORM
- PostgreSQL connected & synchronized via Prisma
- Models: `User`, `Profile`, `Task`, `TaskApplication`, `Rating`, `TeamPost`, `TeamApplication`, `Conversation`, `Message`, `FeatureSetting`

## Authentication & DIU Email Rule
- Registration strictly restricted to `@diu.edu.bd` emails
- Password hashing with bcrypt
- JWT carrying `userId`, `email`, `role` (`USER`/`ADMIN`)
- Protected backend middleware & session management

## Feature Toggles & Admin System
- Backend feature toggle middleware (`checkFeature`)
- Core feature toggles: `Task Marketplace`, `Team Match Network`
- User ban/unban moderation

---

# Verification Status

- **Backend TypeScript (`tsc --noEmit`):** PASSED (0 errors)
- **Frontend TypeScript (`tsc --noEmit`):** PASSED (0 errors)
- **Next.js Production Build (`next build`):** PASSED (Static & dynamic routes compiled)
- **Grep Audit:** PASSED (0 obsolete references)
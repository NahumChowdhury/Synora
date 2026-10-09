# Architecture

## Frontend
Next.js application providing landing/auth pages and a task-focused dashboard. Browser API calls go through the configured application API layer rather than hardcoded local machine URLs.

## Backend
Express API with authenticated routes for auth, profile, tasks, chat, and admin. The removed Team Match API is not registered.

## Database
PostgreSQL via Prisma. The active Prisma schema models only the task product and supporting systems. Historical migrations may retain legacy Team Match database objects until a separately reviewed cleanup migration is approved.

## Authentication
Google verifies the DIU account. The backend verifies the identity token and accepts only verified `@diu.edu.bd` identities. The application session is stored in a secure/HttpOnly cookie configuration appropriate to the environment.

## Privacy boundary
Task Marketplace is anonymous by context. Backend serializers must prevent profile/email/global user identifiers from leaking into task-facing responses and task conversations.

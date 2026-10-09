# Synora — Task-Only Production Deployment & Pilot Checklist

Do not skip the verification gates below.

## 0. Safety rules
- Keep Git checkpoint `b7e9fac` available as rollback history.
- Work on `production-hardening` until validation is complete.
- Back up PostgreSQL before applying migrations.
- Never commit `.env`, DB passwords, JWT secrets, Google credentials, or proxy secrets.
- Never run `prisma db push --accept-data-loss` or a database reset against real data.
- Team Match / Opportunity Network is removed from the product. Do not restore its routes/UI during deployment.

## 1. Google Web OAuth client
Create a Google OAuth Web client for Synora and configure the required authorized JavaScript origins.

For local testing add:

`http://localhost:3000`

Later add the exact HTTPS production frontend origin.

Use the same Web Client ID in frontend and backend configuration. Do not expose a Google client secret through `NEXT_PUBLIC_*` variables.

If DIU Google Workspace policy blocks the app, institutional approval may be required before all DIU accounts can sign in.

## 2. Generate local secrets
Generate two different random values locally:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Use one for `JWT_SECRET` and one for `INTERNAL_PROXY_KEY`.

## 3. Local environment

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
BACKEND_URL=http://localhost:5000
INTERNAL_PROXY_KEY=YOUR_SECOND_RANDOM_SECRET
```

### `frontend/backend/.env`
```env
DATABASE_URL=YOUR_EXISTING_POSTGRESQL_CONNECTION_STRING
JWT_SECRET=YOUR_FIRST_RANDOM_SECRET
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
COOKIE_SAME_SITE=lax
INTERNAL_PROXY_KEY=YOUR_SECOND_RANDOM_SECRET
ALLOW_ADMIN_PASSWORD_LOGIN=false
```

Do not send real secret values through chat or commit them.

## 4. Validate backend before DB migration
From `frontend/backend`:

```powershell
npm install
npx prisma validate
npx prisma generate
npm run typecheck
npm run build
npm audit
```

Review audit findings. Do not use `npm audit fix --force` blindly.

## 5. Database migration
First create a real PostgreSQL backup.

Then from `frontend/backend`:

```powershell
npx prisma migrate status
npx prisma migrate deploy
```

Historical migrations still create legacy Team Match DB objects because they existed in the older MVP. The active Prisma schema/application does not expose or use them. This avoids destructive cleanup during the launch-hardening pass.

If migration history reports a conflict, stop. Do not reset or force-push the schema.

## 6. Frontend validation
From `frontend`:

```powershell
npm install
npm run lint
npm run build
```

## 7. Required local real-account tests
Use real DIU Google accounts, not invented addresses.

### Authentication and session isolation
- Real `@diu.edu.bd` Google account can authenticate.
- Non-DIU Google account is rejected.
- No arbitrary student password registration is available.
- Student A and Student B remain independent in separate browser profiles/devices.
- Logging out A does not log out or convert B.
- Expired/invalid session returns to Login appropriately.
- Banned account cannot use protected routes.

### Task Marketplace
- Student A creates an OPEN task.
- Student B sees only task-context anonymous requester identity.
- B applies once; duplicate/self-application is rejected where applicable.
- A sees an anonymous worker alias, not B's DIU email/name/global ID.
- A selects B; task becomes ASSIGNED and a task conversation is created.
- Valid lifecycle reaches IN_PROGRESS then COMPLETED.
- Cancellation permissions are enforced.
- Rating duplicate/timing rules are enforced.

### Cross-user authorization
Use an unrelated Student C and attempt direct API/resource access:
- C cannot manage A's task.
- C cannot select workers for A.
- C cannot read A/B task conversation.
- C cannot send messages to that conversation.

### Messaging safety
- Only requester and selected worker can access task chat.
- Adult/sexual content and explicit threats covered by server rules are rejected.
- Block prevents messages until unblocked.
- Incoming message can be reported.
- Admin can review/disposition the report.

### Admin
- Non-admin cannot access admin routes.
- Admin can ban/unban normal users.
- Admin cannot ban self/another ADMIN through the normal panel.
- Disabling Task Marketplace blocks Task API operations and shows the disabled state in UI.

### Removed feature verification
- No Team Match / Opportunity tab, card, CTA, API route, or admin toggle is visible/usable.
- Requests to `/api/team/*` return 404 because the route is not registered.

## 8. Production topology
Recommended browser path:

`Browser -> https://FRONTEND/api-proxy/... -> Backend API`

Production frontend env:
```env
NEXT_PUBLIC_API_URL=/api-proxy
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
BACKEND_URL=https://YOUR-BACKEND-HOST
INTERNAL_PROXY_KEY=YOUR_SHARED_PROXY_SECRET
```

Production backend env:
```env
DATABASE_URL=YOUR_MANAGED_POSTGRESQL_URL
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
FRONTEND_URL=https://YOUR-FRONTEND-HOST
PORT=5000
NODE_ENV=production
COOKIE_SAME_SITE=lax
INTERNAL_PROXY_KEY=YOUR_SHARED_PROXY_SECRET
ALLOW_ADMIN_PASSWORD_LOGIN=false
```

## 9. Production requirements
- HTTPS frontend/backend.
- Managed PostgreSQL with backups.
- `/health` returns HTTP 200.
- Logs retained by hosting provider.
- Basic uptime/error monitoring.
- Secrets only in hosting environment stores.
- Final real support/contact, retention, and deletion details added to policy pages.

## 10. Pilot/public launch gate
Start with a small controlled DIU pilot.

Pilot only after auth, multi-user isolation, Task privacy, authorization, messaging safety, builds, migrations, desktop/mobile checks, and backups all pass.

Fix pilot P0/P1 findings before wider public launch.

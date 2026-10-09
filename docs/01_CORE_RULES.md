# Core Rules

## Identity and authentication
- Students authenticate with a verified Google identity whose verified email ends in `@diu.edu.bd`.
- Typing an arbitrary DIU-looking address is never enough to prove ownership.
- Sessions are per browser/device and are not shared globally between users.
- Backend authorization is authoritative; hidden buttons are not security controls.

## Task Marketplace
- Task lifecycle: `OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED`.
- `CANCELLED` is allowed only where backend rules permit it.
- Requesters cannot apply to their own task.
- Duplicate applications are rejected.
- A requester selects one worker from valid applicants.
- Selecting a worker creates the task conversation.
- Task participant identity is context-specific and anonymous.
- Never expose DIU email, profile full name, or global user ID as a Task participant identifier.
- Ratings are 1–5 and must obey duplicate and time-window rules.

## Messaging and safety
- Messaging is only for the requester and selected worker of a task.
- Adult/sexual content, threats, harassment, spam, and other prohibited content may be blocked by safety checks and can be reported.
- Participants can block/unblock each other.
- Administrators can review message reports.

## Admin
- Roles: `USER` and `ADMIN`.
- Admin routes are backend-protected.
- Admin can ban/unban non-admin users.
- The only product feature toggle is `taskBoardEnabled`.

## Product scope
Synora has one core product feature: Task Marketplace. Team Match / Opportunity Network is removed.

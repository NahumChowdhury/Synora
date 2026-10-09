# Decision Log

## 2026-10-08 — Task-only product scope
Synora is reduced to exactly one core feature: **Task Marketplace**.

The former **Team Match / Opportunity Network** is removed from the frontend and backend API surface. Messaging remains only as a supporting Task Marketplace system.

For migration safety, existing legacy Team Match database objects may remain temporarily even though they are omitted from the active Prisma application schema and inaccessible through the product. A destructive cleanup can happen later only after a verified database backup and explicit review.

## Identity decision
Verified DIU Google authentication proves account ownership. Task Marketplace still uses anonymous contextual participant identity, so verified account details must not leak into task-facing UI/API responses.

## Removed historical features
Borrow Hub, credits, Campus Directory, shops, hotels, business directory/reviews, and Team Match / Opportunity Network are not part of current Synora.

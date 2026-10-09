# Database Rules

## Active application models
The task-only application actively uses `User`, `Profile`, `Task`, `TaskApplication`, `Rating`, `Conversation`, `Message`, `UserBlock`, `MessageReport`, and `FeatureSetting`.

The Prisma application schema intentionally omits the removed Team Match models. Older migration history may leave legacy Team Match tables/columns in an existing database during the non-destructive transition. They are not part of the active application API and should not be queried by production code.

## Relationships
- A User can create and be assigned Tasks.
- A Task can have many applications and ratings.
- A Task can have at most one Task conversation.
- A Conversation belongs to exactly the selected task participants in the active product.
- Messages belong to conversations and senders.
- Blocks and reports support messaging moderation.

## Privacy
Internal user IDs may be stored for relational integrity, but Task API responses must not use those IDs, DIU emails, or profile names as participant aliases.

## Migration safety
Never use destructive reset commands against a database containing real user data. Prefer reviewed migrations and take a database backup before any destructive schema cleanup.

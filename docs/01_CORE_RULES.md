# Synora — Core Rules

## Purpose

This document defines the permanent business rules of Synora.

Every AI assistant, developer, or contributor working on Synora must follow these rules.

These rules cannot be changed without explicit approval from the project owner.

---

# User Eligibility

Only verified university students may use Synora.

Initially:

* Daffodil International University (DIU)

Future expansion:

* Other universities with verified institutional email addresses.

Only one account is allowed per university email.

---

# Authentication Rules

* University email is mandatory during registration.
* Passwords must always be hashed using bcrypt.
* Authentication uses JWT.
* Protected pages require valid authentication.
* Users cannot access protected pages without login.

---

# Task Marketplace Rules

Purpose:

Allow students to earn money by completing academic or creative tasks.

Rules:

* Task owners remain anonymous to applicants.
* Workers remain anonymous until selected.
* Real university email is hidden from users.
* Admin can always view real user information.
* One worker is selected per task.
* Payment method is Cash on Delivery (COD) during the first version.
* Ratings are submitted only after task completion.
* Both task owner and worker rate each other.
* Admin may remove fraudulent users.

---

# Borrow Hub Rules

Purpose:

Allow students to borrow and lend campus resources.

Initial Credit System:

* Every new user starts with **5 credits**.
* Borrowing an item costs **1 credit**.
* Successfully lending an item rewards **2 credits**.

Credits are earned only through legitimate platform activities.

---

# Opportunity Network Rules

Purpose:

Help students find collaborators.

Unlike Task Marketplace:

* Real identity is visible.
* Real name is required.
* Skills and interests are displayed.
* Anonymous profiles are not allowed.

This module is intended for:

* Project teammates
* Club recruitment
* Startup partners
* Travel partners
* Collaboration opportunities

---

# Campus Guide Rules

Purpose:

Improve campus life through community reviews.

Users may review:

* Cafeterias
* Restaurants
* Shops
* Hotels
* Clubs
* Campus facilities

Rules:

* Reviews should be honest.
* Spam is prohibited.
* Admin may remove inappropriate reviews.

---

# Rating System

Ratings are based on a 5-star scale.

General principles:

* Higher ratings indicate greater trust.
* Consistently poor ratings may lead to account restrictions.
* Admin has final authority over disputes and abuse.

---

# Privacy Rules

* University email addresses are never publicly displayed.
* Passwords are never stored in plain text.
* Personal information is protected.
* Anonymous features remain anonymous unless required for moderation.

---

# Admin Authority

Administrators can:

* Ban users.
* Remove fraudulent content.
* Moderate reviews.
* Enable or disable platform features.
* Resolve disputes.

Administrators must not abuse these privileges.

---

# Project Integrity

No future feature should violate these core rules without explicit approval from the project owner.

If any implementation conflicts with this document, this document takes precedence.

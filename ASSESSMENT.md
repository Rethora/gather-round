# 📋 Take-Home Assessment – Mid-Level Full Stack Developer

## Project Name: GatherRound

Build a lightweight full-stack web app where users can organize small events and invite others to attend. You can use any technologies or architecture you prefer.

---

## 📌 Overview

**“GatherRound”** is a web app that allows users to host informal events (e.g., game nights, study groups, pick-up sports), invite others, and manage RSVPs and discussions.

---

## 🔐 Epic 1 – Account & Identity

| ID  | User Story                                              | Acceptance Criteria                                                                                                                    |
| --- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A-1 | As an unregistered visitor, I want to create an account | Sign-up requires email + password (or OAuth). Validation errors are shown inline. After registration, user is signed in automatically. |
| A-2 | As a signed-in user, I want to sign out                 | Clicking “Sign Out” fully clears auth tokens. Protected pages redirect to login.                                                       |
| A-3 | As a signed-in user, I want to reset my password        | “Forgot password?” emails a time-limited reset link. Link leads to reset page. Old sessions are revoked after reset.                   |

---

## 🗓️ Epic 2 – Event Management

| ID  | User Story                                         | Acceptance Criteria                                                                                                     |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| E-1 | As a host, I want to create an event               | Required: title, date/time, location (text), max guests. Optional: description, image URL. Creator becomes event owner. |
| E-2 | As a host, I want to edit or cancel my event       | Only the owner can modify or delete. Guests are notified on updates or cancellation.                                    |
| E-3 | As a user, I want to browse upcoming public events | List paginates server-side. Past events excluded. Search by keyword and filter by date.                                 |
| E-4 | As a guest, I want to RSVP Yes / No / Maybe        | RSVP status visible to guest and host. RSVP changes update instantly.                                                   |
| E-5 | As a host, I want a real-time guest list           | Guest list updates without refresh (WebSocket, SSE, or polling). Grouped by RSVP status.                                |

---

## 💬 Epic 3 – Social Layer

| ID  | User Story                                         | Acceptance Criteria                                                                                  |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| S-1 | As a guest, I want to comment on an event          | Comments show author, timestamp, markdown. Anti-spam: rate limit or simple captcha.                  |
| S-2 | As a user, I want to mention others with @username | Typing `@` triggers username autocomplete. Mentions trigger notifications (in-app + optional email). |

---

## 📊 Epic 4 – Personal Dashboard

| ID  | User Story                                      | Acceptance Criteria                                                                                             |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| D-1 | As a user, I want a dashboard to view my events | Two tabs: “Hosting” and “Attending.” Sortable by date. Shows RSVP count (for hosts) and my status (for guests). |

---

## 📱 Epic 5 – Accessibility & Responsiveness

| ID  | User Story                                       | Acceptance Criteria                                                               |
| --- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| R-1 | As any user, I want mobile and desktop usability | WCAG 2.1 AA color contrast. Works at 320px width and up. Touch targets ≥ 44×44px. |

---

## 🧪 Epic 6 – Quality & DevOps

| ID  | User Story                                          | Acceptance Criteria                                                                                      |
| --- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Q-1 | As a stakeholder, I want automated tests            | Unit tests for core logic. At least one E2E test for “create event → RSVP.”                              |
| Q-2 | As a developer, I want CI for lint, test, and build | All steps run on PR. Failures block merge. Builds produce artifact (e.g. Docker image or static output). |
| Q-3 | As a developer, I want a one-command setup          | Clear README + single command (e.g., Docker Compose, npm script) to start API, DB, and frontend locally. |

---

## 🚀 Stretch Goals (Optional)

| ID  | User Story                                                           |
| --- | -------------------------------------------------------------------- |
| X-1 | As a host, I want optional map embed based on event location         |
| X-2 | As a guest, I want to download an .ics calendar invite for my events |
| X-3 | As an admin, I want charts showing events per week and RSVP stats    |
| X-4 | As a user, I want a dark mode toggle saved in my account             |

---

## ✅ Evaluation Criteria

- Clarity and maintainability of code
- Thoughtful scope management and architecture
- Use of best practices (auth, validation, testing, performance)
- Design and usability (even minimal UI counts)
- Clear instructions in `README.md`

---

Good luck, and have fun! 🎉

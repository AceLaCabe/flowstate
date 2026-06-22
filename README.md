# Flowstate

Flowstate is a calm planning workspace for organizing projects, tasks, schedules, files, and shared work in one focused place.

It is designed for people managing multiple moving parts — freelancers, small teams, creative workers, agencies, families, and households — who need structure without the visual noise or overwhelm of traditional project management tools.

---

## Why Flowstate Exists

Planning tools can quickly become another source of stress.

Many productivity apps are powerful, but they often feel heavy, corporate, or visually overwhelming. Flowstate approaches project management differently: it focuses on calm hierarchy, clear next actions, and flexible organization that can support both work and life.

The goal is simple:

> Help users see what matters next without forcing them to process everything at once.

---

## What Flowstate Does

Flowstate helps users organize:

* Projects
* Tasks
* Deadlines
* Calendar events
* Files and assets
* Team or group collaboration
* Account and workspace settings

Instead of separating work across scattered notes, task lists, file folders, and calendars, Flowstate brings the core planning pieces into one connected workspace.

---

## Live Demo

Flowstate includes a public demo route so visitors can explore the product without creating an account.

```txt
/demo
```

The demo uses static sample data and lets users navigate through the main product areas:

* Dashboard
* Projects
* Tasks
* Calendar

Demo actions such as creating, editing, deleting, and saving are intentionally disabled.

---

## Core Product Areas

### Dashboard

The dashboard gives users a calm workspace overview.

It surfaces:

* Active projects
* Open tasks
* Overdue tasks
* Team members
* Upcoming events
* One clear next action

The dashboard is designed to reduce scanning fatigue by helping users quickly understand what needs attention first.

---

### Projects

Projects give tasks, files, events, and planning details a clear home.

Users can organize projects by:

* Title
* Description
* Status
* Due date
* Current momentum

Supported project statuses include:

* Active
* On hold
* Completed

Projects are useful for client work, creative initiatives, launches, household planning, personal goals, and team coordination.

---

### Tasks

Tasks stay connected to projects so next actions do not float around without context.

Users can:

* Create tasks
* Assign tasks to projects
* Add descriptions
* Set due dates
* Assign priority
* Mark tasks complete
* Edit tasks
* Delete tasks

Task views highlight:

* Open tasks
* Completed tasks
* High-priority tasks
* Overdue tasks
* Tasks with and without due dates

---

### Calendar

The calendar gives users a schedule layer for time-based planning.

Users can organize:

* Meetings
* Planning sessions
* Deadlines
* Important time blocks
* Upcoming events
* Past events

Calendar views include:

* Month view
* Week view
* Agenda view

The calendar is designed to support different levels of visibility depending on how much detail the user needs.

---

### Assets

The assets page is scaffolded for future file organization.

It is designed to support:

* PDFs
* Word documents
* Excel files
* CSV files
* PowerPoint decks
* Audio files
* Project references
* Creative assets
* Planning documents

The intended future direction is for users to upload files and attach them to specific projects.

---

### Team

The team page is scaffolded for future collaboration and group management.

It is designed to support:

* Workspace teams
* Project groups
* Family or household groups
* Client review groups
* Shared project visibility
* Role-based access
* Group leader controls

This supports Flowstate’s larger goal of being useful for both professional teams and real-life coordination.

---

### Settings

The settings area includes functional account controls and planned workspace preferences.

Current account features include:

* Updating user name
* Changing email
* Changing password
* Logging out

Planned settings include:

* Workspace preferences
* Group leader controls
* Appearance options
* Notification preferences
* Security and access controls

---

## UX Principles

Flowstate is built around a few core design principles.

### Calm visual hierarchy

The interface avoids unnecessary visual noise and uses spacing, soft contrast, rounded cards, and clear sections to make information easier to process.

### One clear next action

The dashboard and task experience are designed to help users identify the next best move instead of forcing them to scan every item manually.

### Flexible work-life structure

Flowstate is not limited to corporate project management. It can support client work, creative projects, household planning, family coordination, and personal organization.

### Project-connected planning

Tasks, events, files, and team activity are meant to connect back to project spaces so users can keep context intact.

### Public portfolio access

The public demo allows visitors, recruiters, and reviewers to explore the product without signing up or logging in.

---

## Tech Stack

Flowstate is built with:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase Auth
* Supabase Database
* Supabase SSR helpers

---

## Routes

| Route                   | Purpose                        |
| ----------------------- | ------------------------------ |
| `/`                     | Marketing landing page         |
| `/demo`                 | Public interactive demo        |
| `/auth/login`           | Login page                     |
| `/auth/sign-up`         | Account creation               |
| `/auth/forgot-password` | Password recovery              |
| `/dashboard`            | Authenticated dashboard        |
| `/projects`             | Project planning               |
| `/tasks`                | Task management                |
| `/calendar`             | Schedule management            |
| `/assets`               | Asset library scaffold         |
| `/team`                 | Team and group scaffold        |
| `/settings`             | Account and workspace settings |

---

## Public and Protected Routes

Flowstate uses route protection for authenticated app pages.

Public routes include:

* `/`
* `/demo`
* `/auth/login`
* `/auth/sign-up`
* `/auth/forgot-password`
* `/auth/confirm`
* `/auth/error`

Authenticated routes include:

* `/dashboard`
* `/projects`
* `/tasks`
* `/calendar`
* `/assets`
* `/team`
* `/settings`

The `/demo` route is intentionally public so portfolio visitors can preview the product without creating an account.

---

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Run the development server:

```bash
npm run dev
```

Open the app in your browser:

```txt
http://localhost:3000
```

---

## Supabase Setup

Flowstate uses Supabase for authentication and workspace data.

The app currently expects tables for:

* `profiles`
* `workspaces`
* `workspace_members`
* `projects`
* `tasks`
* `events`

The public demo route does not require Supabase data and can be viewed without logging in.

---

## Current Status

Flowstate currently includes:

* Polished marketing landing page
* Public interactive demo
* Authenticated dashboard
* Project management
* Task management
* Calendar views
* Assets scaffold
* Team scaffold
* Settings scaffold
* Account settings form
* Logout functionality
* Public route exception for `/demo`

---

## Planned Improvements

Future improvements may include:

* Real file uploads through Supabase Storage
* Project-specific asset libraries
* Group creation
* Team invitations
* Role-based permissions
* Workspace customization
* Appearance settings
* Notification preferences
* Project detail pages
* Task filtering by project and due date
* Calendar events connected to projects and tasks
* More robust demo interactions
* File previews for uploaded assets

---

## Portfolio Purpose

Flowstate was created as a portfolio project to demonstrate:

* Product thinking
* UX/UI design
* Front-end development
* Authentication workflows
* Dashboard design
* Route protection
* Public demo access
* Calm interface design
* Multi-feature app architecture

The project focuses on turning complex planning needs into a softer, more usable digital workspace.

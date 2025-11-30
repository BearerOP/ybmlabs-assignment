# Feedback Pulse - Architecture Documentation

## Overview

Feedback Pulse is a full-stack SaaS application that enables companies to embed a lightweight feedback widget on their websites and manage all submissions from an admin dashboard.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS v4 with Finotive design system
- **Data Fetching**: SWR for client-side caching
- **Form Validation**: React Hook Form + Zod

## Architecture Layers

### 1. Database Layer (`prisma/schema.prisma`)

**Entities:**
- **User**: Stores user accounts with email/password authentication
- **Project**: Each user can create multiple projects with unique keys
- **Feedback**: Stores feedback submissions linked to projects
- **FeedbackLabel**: Many-to-many relationship for organizing feedback

**Key Design Decisions:**
- `projectKey` is auto-generated and unique for widget embedding
- Cascade deletion to maintain referential integrity
- Indexed fields for query performance (userId, projectId, createdAt)

### 2. Authentication Flow

**Implementation**: JWT-based session management with secure cookies

**Flow:**
1. User signs up/logs in via `/api/auth/signup` or `/api/auth/login`
2. Server hashes password (SHA-256) and creates user record
3. JWT token generated with user payload (userId, email)
4. Token stored in HTTP-only cookie (7-day expiration)
5. Middleware validates token on protected routes
6. Session extracted in server components via `getSession()`

**Security Features:**
- HTTP-only cookies prevent XSS attacks
- Secure flag in production
- Middleware protects all dashboard routes
- Password hashing before storage

### 3. Widget Design

**Architecture**: Standalone JavaScript that loads asynchronously

**Components:**
1. **Floating Button**: Fixed position with neon glow animation
2. **Modal Form**: Overlay with feedback type selection, message, email
3. **CORS Configuration**: Wildcard origin to work on any domain

**Widget Flow:**
1. Client adds script tag with `data-project-key` attribute
2. Widget loads and injects styles + DOM elements
3. User clicks button → modal appears
4. Form submission → POST to `/api/feedback/submit`
5. Success → confirmation message, auto-close

**CORS Setup:**
- Middleware adds CORS headers to `/api/feedback/submit`
- OPTIONS handler for preflight requests
- Allows all origins for widget accessibility

### 4. Admin Dashboard

**Pages:**
- `/dashboard` - Project list with creation
- `/dashboard/projects/[projectId]` - Feedback management

**Features:**
- SSR for initial project data (SEO, performance)
- CSR with SWR for feedback list (real-time updates, caching)
- Client-side filtering (All/Bug/Feature/Other)
- Pagination with prev/next controls
- Label management (add/remove)

**Data Flow:**
1. Server component fetches project + counts
2. Client component fetches feedback with filters
3. SWR caches results and handles revalidation
4. Mutations trigger `mutate()` for instant UI updates


## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Feedback
- `POST /api/feedback/submit` - Submit feedback (public, CORS-enabled)
- `GET /api/projects/[id]/feedback` - List feedback with filters/pagination
- `POST /api/feedback/[id]/analyze` - Analyze sentiment with AI

### Labels
- `POST /api/feedback/[id]/labels` - Add label
- `DELETE /api/feedback/[id]/labels` - Remove label

## Design System (Finotive)

**Color Palette:**
- Background: Deep Void (#0D0E12)
- Cards: Card Carbon (#141519)
- Primary: Neon Mint (#4EEA95)
- Text: White (#FFFFFF) / Steel Gray (#868894)
- Accents: Emerald (#22C55E), Soft Rose (#F75555)

**Typography:**
- Font: Geist Sans
- Hierarchy: 32-36px (numbers), 16-18px (headings), 14px (body)

**Components:**
- Cards: 20px border radius, subtle borders
- Buttons: Pill-shaped with neon glow effects
- Badges: Transparent backgrounds with colored borders

## Improvements & Future Enhancements

### Performance
- Implement Redis caching for frequently accessed projects
- Add database connection pooling
- Optimize widget bundle size (currently ~15KB)
- Lazy load dashboard components

### Features
- Email notifications for new feedback
- Webhook support for integrations
- Bulk label operations
- Advanced filtering (date range, sentiment, labels)
- Export feedback to CSV/JSON
- Rich text support in feedback messages
- File attachments in feedback
- Feedback voting/prioritization
- Public feedback boards

### Security
- Rate limiting on API endpoints
- CAPTCHA for feedback submission
- API key authentication for webhooks
- Two-factor authentication
- Password complexity requirements
- Bcrypt instead of SHA-256

### Monitoring
- Error tracking (Sentry)
- Analytics dashboard (submission trends)
- Performance monitoring
- Uptime monitoring for widget

### Developer Experience
- API client libraries (JS, Python, Ruby)
- CLI tool for project management
- Comprehensive testing suite
- CI/CD pipeline
- Staging environment

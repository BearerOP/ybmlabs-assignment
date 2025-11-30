# Feedback Pulse - Architecture Documentation

## Overview

Feedback Pulse is a full-stack SaaS application that enables companies to embed a lightweight feedback widget on their websites and manage all submissions from an admin dashboard.

**Live URL**: https://ybmlabs.bearerop.live

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM (hosted on Neon)
- **Authentication**: Better Auth with OAuth (Google, GitHub)
- **Styling**: Tailwind CSS v4 with Finotive design system
- **Data Fetching**: SWR for client-side caching
- **Form Validation**: React Hook Form + Zod

## Architecture Layers

### 1. Database Layer (`prisma/schema.prisma`)

**Entities:**

- **User**: Stores user accounts with OAuth authentication support
  - `id`: Unique identifier (CUID)
  - `email`: Unique email address
  - `password`: Optional (null for OAuth users)
  - `name`: Optional display name
  - `emailVerified`: Email verification status
  - `image`: Profile image URL
  - Relations: `projects`, `accounts`, `sessions`

- **Account**: OAuth provider accounts linked to users
  - `id`: Unique identifier
  - `userId`: Foreign key to User
  - `providerId`: OAuth provider (e.g., "google", "github")
  - `accountId`: Provider-specific account identifier
  - `accessToken`, `refreshToken`: OAuth tokens
  - `scope`: OAuth scopes

- **Session**: User sessions managed by Better Auth
  - `id`: Unique identifier
  - `userId`: Foreign key to User
  - `token`: Session token
  - `expiresAt`: Session expiration
  - `ipAddress`, `userAgent`: Session metadata

- **Project**: User feedback collection projects
  - `id`: Unique identifier
  - `name`: Project name
  - `projectKey`: Unique key for widget embedding (auto-generated CUID)
  - `userId`: Owner user ID
  - Relations: `feedback`

- **Feedback**: Submitted feedback entries
  - `id`: Unique identifier
  - `projectId`: Foreign key to Project
  - `type`: Feedback type (BUG, FEATURE, OTHER)
  - `message`: Feedback message text
  - `email`: Optional reporter email
  - `userAgent`: Optional browser information
  - `sentiment`: Optional sentiment value (future feature)
  - Relations: `labels`

- **FeedbackLabel**: Labels for organizing feedback
  - `id`: Unique identifier
  - `feedbackId`: Foreign key to Feedback
  - `label`: Label text

**Key Design Decisions:**

- `projectKey` is auto-generated using CUID for widget embedding
- Cascade deletion maintains referential integrity (delete user → delete projects → delete feedback)
- Indexed fields for query performance (`userId`, `projectId`, `createdAt`)
- OAuth accounts stored separately from users for multi-provider support
- Sessions stored in database for server-side session management

### 2. Authentication Flow

**Implementation**: Better Auth with OAuth (Google and GitHub)

**Architecture:**

- **Better Auth**: Modern authentication library with built-in OAuth support
- **Prisma Adapter**: Database adapter for Better Auth using PostgreSQL
- **Session Management**: Database-stored sessions with secure tokens
- **OAuth Providers**: Google and GitHub integration

**Flow:**

1. User clicks "Sign in with Google" or "Sign in with GitHub" on login/signup page
2. Client calls `signIn.social()` from `@/lib/auth-client`
3. Better Auth redirects user to OAuth provider (Google/GitHub)
4. User authorizes application on provider
5. Provider redirects back to `/api/auth/callback/[provider]`
6. Better Auth handles callback, creates/updates user and account records
7. Session created in database with secure token
8. Session cookie set (HTTP-only, secure in production)
9. User redirected to dashboard

**Security Features:**

- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- CSRF protection via Better Auth
- OAuth tokens stored securely in database
- Session tokens are cryptographically secure
- Automatic session expiration and cleanup

**OAuth Configuration:**

- **Google OAuth**: Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- **GitHub OAuth**: Requires `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- Callback URLs: `https://ybmlabs.bearerop.live/api/auth/callback/[provider]`

### 3. Widget Design

**Architecture**: Standalone JavaScript that loads asynchronously

**Components:**

1. **Floating Button**: Fixed position button with subtle styling
   - Position: Bottom-right corner (24px from edges)
   - Styling: Subtle background with border, no gradients
   - Border-radius: 14px (slightly rounded corners)
   - Text: "Feedback" label with icon
   - Animations: Smooth enter animation and hover effects

2. **Modal Form**: Overlay modal with feedback submission form
   - Dark theme with glassmorphism backdrop
   - Feedback type selection (Bug, Feature, Other)
   - Message textarea
   - Optional email input
   - Smooth open/close animations

3. **CORS Configuration**: Wildcard origin to work on any domain
   - Public endpoint: `/api/feedback/submit`
   - CORS headers on all responses
   - OPTIONS handler for preflight requests

**Widget Flow:**

1. Client adds script tag with `data-project-key` attribute
2. Widget script loads asynchronously
3. Widget initializes and detects project key from script tag
4. Styles and DOM elements injected into page
5. Floating button appears in bottom-right corner
6. User clicks button → modal appears with smooth animation
7. User fills form and submits
8. Form submission → POST to `/api/feedback/submit`
9. Success → confirmation message, modal auto-closes after 2 seconds

**CORS Setup:**

- All responses from `/api/feedback/submit` include CORS headers
- `Access-Control-Allow-Origin: *` allows any origin
- OPTIONS handler returns proper preflight response
- Enables widget to work on any website domain

**Styling Approach:**

- Subtle, clean design without gradients
- Dark background with light text
- Minimal shadows and borders
- Smooth transitions and hover effects
- Mobile-responsive design

### 4. Admin Dashboard

**Pages:**

- `/dashboard` - Project list with creation
- `/dashboard/projects/[projectId]` - Feedback management

**Features:**

- **SSR for Initial Load**: Server-side rendering for project data (SEO, performance)
- **CSR with SWR**: Client-side data fetching with caching for feedback list
- **Real-time Updates**: SWR revalidation on mutations
- **Client-side Filtering**: Filter by type (All/Bug/Feature/Other)
- **Pagination**: Previous/Next controls with page info
- **Label Management**: Add and remove labels to organize feedback

**Data Flow:**

1. Server component (`/dashboard/page.tsx`) fetches projects via `getSession()` and Prisma
2. Client component (`ProjectsList`) renders project cards
3. User clicks project → navigates to `/dashboard/projects/[projectId]`
4. Server component fetches project details and feedback count
5. Client component (`FeedbackList`) fetches feedback via SWR
6. SWR caches results and handles revalidation
7. User actions (add label, filter) trigger `mutate()` for instant UI updates

## API Endpoints

See [docs/api.md](./api.md) for complete API documentation.

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
- Buttons: Subtle backgrounds with borders, 14px border-radius
- Badges: Transparent backgrounds with colored borders

## Improvements & Future Enhancements

### Performance

- Implement Redis caching for frequently accessed projects
- Add database connection pooling (Neon connection pooling)
- Optimize widget bundle size (currently ~15KB)
- Lazy load dashboard components
- Implement incremental static regeneration for dashboard

### Features

- Email notifications for new feedback
- Webhook support for integrations (Slack, Discord, etc.)
- Bulk label operations
- Advanced filtering (date range, labels, email)
- Export feedback to CSV/JSON
- Rich text support in feedback messages
- File attachments in feedback
- Feedback voting/prioritization
- Public feedback boards
- Sentiment analysis (upcoming feature)

### Security

- Rate limiting on API endpoints
- CAPTCHA for feedback submission
- API key authentication for webhooks
- Two-factor authentication (2FA)
- Enhanced session security options

### Monitoring

- Error tracking (Sentry integration)
- Analytics dashboard (submission trends)
- Performance monitoring
- Uptime monitoring for widget
- Database query performance monitoring

### Developer Experience

- API client libraries (JS, Python, Ruby)
- CLI tool for project management
- Comprehensive testing suite
- CI/CD pipeline
- Staging environment
- Widget customization options (colors, position)

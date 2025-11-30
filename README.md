# Feedback Pulse

A modern, full-stack SaaS feedback collection platform with an embeddable widget and powerful admin dashboard.

**Live URL**: https://ybmlabs.bearerop.live

## Demo

Watch a demo video to see Feedback Pulse in action:

🎥 **[View Demo Video](https://www.loom.com/share/db837f0a40b0448fa3e21934a2e3f53c)**

## Features

- **Authentication**: OAuth sign-in with Google and GitHub
- **Projects**: Create and manage multiple feedback collection projects
- **Embeddable Widget**: Lightweight JavaScript widget that works on any website
- **Admin Dashboard**: Beautiful Fintech-inspired UI for managing feedback
- **Filtering & Pagination**: Filter by type (Bug/Feature/Other) with client-side pagination
- **Label Management**: Organize feedback with custom labels

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM (hosted on Neon)
- **Styling**: Tailwind CSS v4 (Finotive design system)
- **Auth**: Better Auth with OAuth (Google, GitHub)
- **Data Fetching**: SWR

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Neon recommended)
- Google OAuth credentials (for Google sign-in)
- GitHub OAuth credentials (for GitHub sign-in)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd feedback-pulse
```

2. Install dependencies
```bash
npm install
# or
bun install
```

3. Set up environment variables
```bash
# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/feedback_pulse"
BETTER_AUTH_SECRET="your-secret-key-minimum-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth (Get from https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (Get from https://github.com/settings/developers)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

4. Run database migrations
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start development server
```bash
npm run dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Create an Account

Sign up at `/signup` using Google or GitHub OAuth.

### 2. Create a Project

From the dashboard, click "New Project" and give it a name.

### 3. Embed the Widget

Copy the embed code from your project and add it to your website before the closing `</body>` tag:

```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://ybmlabs.bearerop.live/widget/feedback.js';
    script.setAttribute('data-project-key', 'YOUR_PROJECT_KEY');
    script.async = true;
    script.id = 'feedback-pulse-script';
    document.head.appendChild(script);
  })();
</script>
```

### React / Next.js Usage

To embed the widget inside your React/Next.js app, use the provided helper component:

```tsx
import { FeedbackPulseWidget } from "@/components/feedback-pulse-widget"

export function YourPage() {
  return (
    <>
      {/* page content */}
      <FeedbackPulseWidget projectKey="YOUR_PROJECT_KEY" />
    </>
  )
}
```

The component injects the widget script, removes it on unmount, and uses `NEXT_PUBLIC_APP_URL` (or the current origin) to resolve the script. Pass a `baseUrl` prop if you need to load the widget from another domain.

### 4. Collect Feedback

Visitors will see a floating feedback button in the bottom-right corner of your website. They can submit:
- Bug reports
- Feature requests
- General feedback

### 5. Manage in Dashboard

View all feedback in your dashboard:
- Filter by type (All/Bug/Feature/Other)
- Add custom labels for organization
- Paginate through submissions

## Project Structure

```
feedback-pulse/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints (Better Auth)
│   │   ├── projects/       # Project management
│   │   └── feedback/       # Feedback submission
│   ├── dashboard/          # Protected dashboard pages
│   ├── widget/             # Widget script endpoint
│   └── layout.tsx          # Root layout
├── components/             # React components
├── lib/                    # Utilities (auth, db)
├── prisma/                 # Database schema
├── public/                 # Static assets (widget)
└── docs/                   # Documentation
```

## API Documentation

See [docs/api.md](docs/api.md) for complete API reference.

## Architecture

See [docs/architecture.md](docs/architecture.md) for system design details.

## Database Schema

- **User**: User accounts with OAuth support
- **Account**: OAuth provider accounts (Google, GitHub)
- **Session**: User sessions
- **Project**: Feedback projects with unique keys
- **Feedback**: Submitted feedback entries
- **FeedbackLabel**: Labels for organizing feedback

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Secret for Better Auth (min 32 characters) | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL (e.g., https://ybmlabs.bearerop.live) | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | Yes |

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `https://ybmlabs.bearerop.live/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: Feedback Pulse
   - Homepage URL: `https://ybmlabs.bearerop.live`
   - Authorization callback URL: `https://ybmlabs.bearerop.live/api/auth/callback/github`
4. Copy the Client ID and generate a Client Secret

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables (all required variables from above)
4. Deploy

The build process will:
- Run `prisma generate` during `prebuild`
- Build the Next.js application
- Deploy to Vercel

### Other Platforms

1. Build the application: `npm run build`
2. Set up PostgreSQL database
3. Run migrations: `npx prisma migrate deploy`
4. Start server: `npm start`

## Standards Compliance

This project follows best practices:

- ✅ **Next.js App Router**: Uses App Router with proper directory structure
- ✅ **Admin pages: SSR**: Server-side rendering for dashboard pages
- ✅ **Feedback listing: CSR + pagination**: Client-side rendering with SWR and pagination
- ✅ **Working CORS**: Proper CORS headers for widget functionality
- ✅ **Form validation**: React Hook Form + Zod for all forms

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

**Live Application**: https://ybmlabs.bearerop.live

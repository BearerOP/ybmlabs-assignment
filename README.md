# Feedback Pulse

A modern, full-stack SaaS feedback collection platform with an embeddable widget and powerful admin dashboard.

## Features

- **Authentication**: Secure email/password signup and login with JWT sessions
- **Projects**: Create and manage multiple feedback collection projects
- **Embeddable Widget**: Lightweight JavaScript widget that works on any website
- **Admin Dashboard**: Beautiful Fintech-inspired UI for managing feedback
- **Filtering & Pagination**: Filter by type (Bug/Feature/Other) with client-side pagination
- **Label Management**: Organize feedback with custom labels

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4 (Finotive design system)
- **Auth**: JWT with HTTP-only cookies
- **Data Fetching**: SWR

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd feedback-pulse
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
# or
bun install
\`\`\`

3. Set up environment variables
\`\`\`bash
# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/feedback_pulse"
JWT_SECRET="your-secret-key"
\`\`\`

4. Run database migrations
\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`

5. Start development server
\`\`\`bash
npm run dev
# or
bun dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Create an Account

Sign up at `/signup` with your email and password.

### 2. Create a Project

From the dashboard, click "New Project" and give it a name.

### 3. Embed the Widget

Copy the embed code from your project and add it to your website before the closing `</body>` tag:

```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget/feedback.js';
    script.setAttribute('data-project-key', 'YOUR_PROJECT_KEY');
    script.async = true;
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

The component injects `/widget/feedback.js`, removes it on unmount, and uses `NEXT_PUBLIC_APP_URL` (or the current origin) to resolve the script. Pass a `baseUrl` prop if you need to load the widget from another domain.

### 4. Collect Feedback

Visitors will see a floating feedback button on your website. They can submit:
- Bug reports
- Feature requests
- General feedback

### 5. Manage in Dashboard

View all feedback in your dashboard:
- Filter by type (All/Bug/Feature/Other)
- Add custom labels for organization
- Paginate through submissions

## Project Structure

\`\`\`
feedback-pulse/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── projects/       # Project management
│   │   └── feedback/       # Feedback submission & analysis
│   ├── dashboard/          # Protected dashboard pages
│   ├── widget/             # Widget script endpoint
│   └── layout.tsx          # Root layout
├── components/             # React components
├── lib/                    # Utilities (auth, db, AI)
├── prisma/                 # Database schema
├── public/                 # Static assets (widget)
└── docs/                   # Documentation
\`\`\`

## API Documentation

See [docs/api.md](docs/api.md) for complete API reference.

## Architecture

See [docs/architecture.md](docs/architecture.md) for system design details.

## Database Schema

- **User**: User accounts
- **Project**: Feedback projects with unique keys
- **Feedback**: Submitted feedback entries
- **FeedbackLabel**: Labels for organizing feedback

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

1. Build the application: `npm run build`
2. Set up PostgreSQL database
3. Run migrations: `npx prisma migrate deploy`
4. Start server: `npm start`

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

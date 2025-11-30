# Feedback Pulse - API Documentation

## Base URL

```
https://ybmlabs.bearerop.live/api
```

For local development:
```
http://localhost:3000/api
```

## Authentication

Feedback Pulse uses **Better Auth** for authentication with OAuth providers (Google and GitHub).

### OAuth Authentication

Protected endpoints require a valid session cookie. Session cookies are automatically set after OAuth authentication.

**Include credentials in requests:**

```javascript
fetch('/api/projects', {
  credentials: 'include'
})
```

### Available OAuth Providers

- **Google**: Sign in with Google account
- **GitHub**: Sign in with GitHub account

### Authentication Endpoints

All authentication is handled through Better Auth at `/api/auth/[...all]`:

- `GET /api/auth/sign-in/google` - Initiate Google OAuth flow
- `GET /api/auth/sign-in/github` - Initiate GitHub OAuth flow
- `POST /api/auth/sign-out` - Sign out and destroy session
- `GET /api/auth/me` - Get current user session

## Endpoints

### Authentication

#### Get Current User

**GET** `/api/auth/me`

Get authenticated user details from session.

**Response (200):**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://...",
    "emailVerified": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error (401):**
```json
{
  "error": "Unauthorized"
}
```

---

#### Sign Out

**POST** `/api/auth/logout`

Destroy user session and sign out.

**Response (200):**
```json
{
  "success": true
}
```

---

### Projects

#### List Projects

**GET** `/api/projects`

Get all projects for authenticated user.

**Response (200):**
```json
{
  "projects": [
    {
      "id": "clx...",
      "name": "My Website",
      "projectKey": "clx...",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "_count": {
        "feedback": 42
      }
    }
  ]
}
```

---

#### Create Project

**POST** `/api/projects`

Create a new project.

**Request Body:**
```json
{
  "name": "My Website"
}
```

**Response (201):**
```json
{
  "project": {
    "id": "clx...",
    "name": "My Website",
    "projectKey": "clx...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "feedback": 0
    }
  }
}
```

**Error (400):**
```json
{
  "error": "Project name is required"
}
```

---

#### Get Project

**GET** `/api/projects/:projectId`

Get a single project by ID.

**Response (200):**
```json
{
  "project": {
    "id": "clx...",
    "name": "My Website",
    "projectKey": "clx...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "feedback": 42
    }
  }
}
```

**Error (404):**
```json
{
  "error": "Project not found"
}
```

---

#### Update Project

**PATCH** `/api/projects/:projectId`

Update project name.

**Request Body:**
```json
{
  "name": "Updated Name"
}
```

**Response (200):**
```json
{
  "project": {
    "id": "clx...",
    "name": "Updated Name",
    "projectKey": "clx...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "feedback": 42
    }
  }
}
```

---

#### Delete Project

**DELETE** `/api/projects/:projectId`

Delete a project and all associated feedback.

**Response (200):**
```json
{
  "success": true
}
```

---

### Feedback

#### Submit Feedback

**POST** `/api/feedback/submit`

Submit feedback (public endpoint, CORS-enabled).

**Request Body:**
```json
{
  "projectKey": "clx...",
  "type": "BUG",
  "message": "Button doesn't work on mobile",
  "email": "reporter@example.com"
}
```

**Fields:**
- `projectKey` (required): Project key from embed code
- `type` (required): "BUG" | "FEATURE" | "OTHER"
- `message` (required): Feedback message text
- `email` (optional): Reporter's email address

**Response (201):**
```json
{
  "success": true,
  "feedback": {
    "id": "clx...",
    "type": "BUG",
    "message": "Button doesn't work on mobile",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "error": [
    {
      "path": ["message"],
      "message": "Message is required"
    }
  ]
}
```

**Error (404):**
```json
{
  "error": "Invalid project key"
}
```

**CORS Headers:**
All responses include:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

#### List Feedback

**GET** `/api/projects/:projectId/feedback`

Get feedback for a project with filtering and pagination.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `type` (optional, default: "ALL"): "ALL" | "BUG" | "FEATURE" | "OTHER"

**Example:**
```
GET /api/projects/clx.../feedback?page=1&limit=10&type=BUG
```

**Response (200):**
```json
{
  "feedback": [
    {
      "id": "clx...",
      "type": "BUG",
      "message": "Button doesn't work",
      "email": "reporter@example.com",
      "userAgent": "Mozilla/5.0...",
      "sentiment": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "labels": [
        {
          "id": "clx...",
          "label": "Mobile"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

### Labels

#### Add Label

**POST** `/api/feedback/:feedbackId/labels`

Add a label to feedback.

**Request Body:**
```json
{
  "label": "Priority"
}
```

**Response (201):**
```json
{
  "label": {
    "id": "clx...",
    "label": "Priority",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Remove Label

**DELETE** `/api/feedback/:feedbackId/labels?labelId=clx...`

Remove a label from feedback.

**Query Parameters:**
- `labelId` (required): ID of label to remove

**Response (200):**
```json
{
  "success": true
}
```

---

## Error Responses

All endpoints follow consistent error response format:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Widget Integration

### Installation

Add this script before the closing `</body>` tag:

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

Replace `YOUR_PROJECT_KEY` with the key from your project dashboard.

### React/Next.js Component

Use the provided React component:

```tsx
import { FeedbackPulseWidget } from "@/components/feedback-pulse-widget"

export function YourPage() {
  return (
    <>
      {/* Your page content */}
      <FeedbackPulseWidget projectKey="YOUR_PROJECT_KEY" />
    </>
  )
}
```

### Customization

The widget automatically adapts to your website and works across all domains.

**Features:**
- Floating button (bottom-right, subtle design)
- Accessible modal form
- Mobile responsive
- Dark theme compatible
- No dependencies
- CORS-enabled for cross-domain support

# Feedback Pulse - API Documentation

## Base URL

\`\`\`
https://your-domain.com/api
\`\`\`

## Authentication

Protected endpoints require a valid session cookie. Include credentials in requests:

\`\`\`javascript
fetch('/api/projects', {
  credentials: 'include'
})
\`\`\`

## Endpoints

### Authentication

#### Sign Up

**POST** `/api/auth/signup`

Create a new user account.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
\`\`\`

**Error (400):**
\`\`\`json
{
  "error": "User already exists"
}
\`\`\`

---

#### Login

**POST** `/api/auth/login`

Authenticate a user.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "securepassword"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
\`\`\`

---

#### Logout

**POST** `/api/auth/logout`

Destroy user session.

**Response (200):**
\`\`\`json
{
  "success": true
}
\`\`\`

---

#### Get Current User

**GET** `/api/auth/me`

Get authenticated user details.

**Response (200):**
\`\`\`json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
\`\`\`

---

### Projects

#### List Projects

**GET** `/api/projects`

Get all projects for authenticated user.

**Response (200):**
\`\`\`json
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
\`\`\`

---

#### Create Project

**POST** `/api/projects`

Create a new project.

**Request Body:**
\`\`\`json
{
  "name": "My Website"
}
\`\`\`

**Response (201):**
\`\`\`json
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
\`\`\`

---

#### Get Project

**GET** `/api/projects/:projectId`

Get a single project by ID.

**Response (200):**
\`\`\`json
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
\`\`\`

---

#### Update Project

**PATCH** `/api/projects/:projectId`

Update project name.

**Request Body:**
\`\`\`json
{
  "name": "Updated Name"
}
\`\`\`

**Response (200):**
\`\`\`json
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
\`\`\`

---

#### Delete Project

**DELETE** `/api/projects/:projectId`

Delete a project and all associated feedback.

**Response (200):**
\`\`\`json
{
  "success": true
}
\`\`\`

---

### Feedback

#### Submit Feedback

**POST** `/api/feedback/submit`

Submit feedback (public endpoint, CORS-enabled).

**Request Body:**
\`\`\`json
{
  "projectKey": "clx...",
  "type": "BUG",
  "message": "Button doesn't work on mobile",
  "email": "reporter@example.com"
}
\`\`\`

**Fields:**
- `projectKey` (required): Project key from embed code
- `type` (required): "BUG" | "FEATURE" | "OTHER"
- `message` (required): Feedback message
- `email` (optional): Reporter's email

**Response (201):**
\`\`\`json
{
  "success": true,
  "feedback": {
    "id": "clx...",
    "type": "BUG",
    "message": "Button doesn't work on mobile",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
\`\`\`

---

#### List Feedback

**GET** `/api/projects/:projectId/feedback`

Get feedback for a project with filtering and pagination.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `type` (optional, default: "ALL"): "ALL" | "BUG" | "FEATURE" | "OTHER"

**Example:**
\`\`\`
GET /api/projects/clx.../feedback?page=1&limit=10&type=BUG
\`\`\`

**Response (200):**
\`\`\`json
{
  "feedback": [
    {
      "id": "clx...",
      "type": "BUG",
      "message": "Button doesn't work",
      "email": "reporter@example.com",
      "userAgent": "Mozilla/5.0...",
      "sentiment": "negative",
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
\`\`\`

---

### Labels

#### Add Label

**POST** `/api/feedback/:feedbackId/labels`

Add a label to feedback.

**Request Body:**
\`\`\`json
{
  "label": "Priority"
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "label": {
    "id": "clx...",
    "label": "Priority",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
\`\`\`

---

#### Remove Label

**DELETE** `/api/feedback/:feedbackId/labels?labelId=clx...`

Remove a label from feedback.

**Query Parameters:**
- `labelId` (required): ID of label to remove

**Response (200):**
\`\`\`json
{
  "success": true
}
\`\`\`

---

## Error Responses

All endpoints follow consistent error response format:

**400 Bad Request:**
\`\`\`json
{
  "error": "Validation error message"
}
\`\`\`

**401 Unauthorized:**
\`\`\`json
{
  "error": "Unauthorized"
}
\`\`\`

**404 Not Found:**
\`\`\`json
{
  "error": "Resource not found"
}
\`\`\`

**500 Internal Server Error:**
\`\`\`json
{
  "error": "Internal server error"
}
\`\`\`

---

## Widget Integration

### Installation

Add this script before the closing `</body>` tag:

\`\`\`html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget/feedback.js';
    script.setAttribute('data-project-key', 'YOUR_PROJECT_KEY');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
\`\`\`

Replace `YOUR_PROJECT_KEY` with the key from your project dashboard.

### Customization

The widget automatically adapts to your website and works across all domains.

**Features:**
- Floating button (bottom-right)
- Accessible modal form
- Mobile responsive
- Dark mode compatible
- No dependencies

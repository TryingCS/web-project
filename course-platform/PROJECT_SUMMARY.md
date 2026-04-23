# Interactive Course Platform - Project Summary

## Overview

A full-stack web application for creating and consuming interactive educational content. Built with React frontend, PHP backend, and MySQL database.

**Live Demo:** https://nlsykg2wsg4vm.ok.kimi.link

## Project Structure

```
course-platform/
├── backend/              # PHP REST API
│   ├── config.php       # Configuration and helpers
│   ├── db.php           # Database connection
│   ├── index.php        # API router
│   ├── .htaccess        # URL rewriting
│   ├── database.sql     # Database schema
│   └── routes/          # API endpoints
│       ├── auth.php     # Authentication
│       ├── courses.php  # Course CRUD
│       ├── sections.php # Section CRUD
│       ├── pages.php    # Page CRUD
│       ├── blocks.php   # Block CRUD
│       └── progress.php # Progress tracking
├── frontend/            # React + TypeScript source
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── Navbar.tsx
│   │   │   └── blocks/  # Block renderers
│   │   │       ├── TextBlock.tsx
│   │   │       ├── PredictionBlock.tsx
│   │   │       ├── QuizBlock.tsx
│   │   │       ├── FillBlankBlock.tsx
│   │   │       └── ImageHotspotsBlock.tsx
│   │   ├── pages/       # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── CourseViewPage.tsx
│   │   │   ├── MyCoursesPage.tsx
│   │   │   └── CourseEditorPage.tsx
│   │   ├── lib/         # Utilities
│   │   │   ├── api.ts   # API client
│   │   │   └── auth-context.tsx
│   │   └── types/       # TypeScript types
│   │       └── index.ts
│   └── dist/            # Built frontend
├── frontend-dist/       # Copy of built frontend
├── README.md            # Setup instructions
├── setup.sh             # Automated setup script
└── PROJECT_SUMMARY.md   # This file
```

## Features Implemented

### Authentication System
- ✅ User registration with email, username, password
- ✅ Login with session-based authentication
- ✅ Logout functionality
- ✅ Protected routes
- ✅ Password hashing with bcrypt

### Course Management
- ✅ Create courses with title, description, image
- ✅ Edit course details
- ✅ Delete courses (with cascade)
- ✅ View all courses
- ✅ Creator dashboard

### Course Structure
- ✅ Create sections within courses
- ✅ Create pages within sections
- ✅ Edit/delete sections and pages
- ✅ Ordered sections and pages

### Content Blocks (5 Types)
- ✅ **Text Block** - HTML content rendering
- ✅ **Prediction Block** - Multiple choice with immediate feedback
- ✅ **Quiz Block** - Similar to prediction with scoring
- ✅ **Fill-in-the-Blank** - Interactive text completion
- ✅ **Image Hotspots** - Clickable image areas with explanations

### Learner Experience
- ✅ Browse all courses
- ✅ Course view with sidebar navigation
- ✅ Page navigation within sections
- ✅ Interactive block rendering
- ✅ Immediate feedback on interactions
- ✅ Progress tracking (completed pages)

### API Endpoints (RESTful)
- ✅ Auth: POST /register, POST /login, POST /logout, GET /me
- ✅ Courses: GET /courses, GET /courses/:id, POST /courses, PUT /courses/:id, DELETE /courses/:id
- ✅ Sections: POST /courses/:id/sections, PUT /sections/:id, DELETE /sections/:id
- ✅ Pages: POST /sections/:id/pages, GET /pages/:id, PUT /pages/:id, DELETE /pages/:id
- ✅ Blocks: POST /pages/:id/blocks, PUT /blocks/:id, DELETE /blocks/:id
- ✅ Progress: GET /courses/:id/progress, POST /pages/:id/complete

## Database Schema

### Tables
1. **users** - id, username, email, password_hash, created_at
2. **courses** - id, title, description, creator_id, image_url, created_at
3. **sections** - id, course_id, title, position, created_at
4. **pages** - id, section_id, title, position, created_at
5. **blocks** - id, page_id, type, content (JSON), position, created_at
6. **user_progress** - id, user_id, page_id, completed, completed_at
7. **quiz_attempts** - id, user_id, block_id, answers (JSON), score, created_at

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (UI components)
- React Router (routing)

### Backend
- PHP 8+
- PDO (database access)
- MySQL 5.7+
- Session-based authentication

### Security
- Password hashing (bcrypt)
- Prepared statements (SQL injection prevention)
- CORS headers
- Input validation

## Setup Instructions

### Quick Start

1. **Setup Database:**
   ```bash
   mysql -u root -p < backend/database.sql
   ```

2. **Configure Backend:**
   Edit `backend/config.php` with your database credentials.

3. **Deploy Backend:**
   Copy `backend/` to your web server (e.g., `/var/www/html/api`).

4. **Configure Frontend:**
   Edit `frontend/src/lib/api.ts` with your API URL.

5. **Build Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

6. **Deploy Frontend:**
   Copy `frontend/dist/` to your web server.

### Using Setup Script

```bash
chmod +x setup.sh
sudo ./setup.sh
```

## API Base URL Configuration

The frontend expects the API at `http://localhost/api`. Update this in:
- File: `frontend/src/lib/api.ts`
- Line: `const API_BASE_URL = 'http://localhost/api';`

## Block Content Examples

### Text Block
```json
{
  "html": "<p>Your <strong>HTML</strong> content here</p>"
}
```

### Prediction/Quiz Block
```json
{
  "question": "What is the capital of France?",
  "options": ["Berlin", "Madrid", "Paris", "Lisbon"],
  "correct": 2,
  "explanation": "Paris is the capital of France."
}
```

### Fill-in-the-Blank Block
```json
{
  "text": "The sky is ___ and grass is ___.",
  "answers": ["blue", "green"]
}
```

### Image Hotspots Block
```json
{
  "imageUrl": "https://example.com/diagram.jpg",
  "hotspots": [
    {
      "x": 0.25,
      "y": 0.6,
      "label": "Heart",
      "explanation": "The heart pumps blood throughout the body."
    }
  ]
}
```

## User Roles

### Guest (Not Logged In)
- View course list
- View course content
- Cannot track progress
- Cannot create content

### Authenticated User
- All guest features
- Create/edit/delete own courses
- Track progress on courses
- Complete pages and see checkmarks

## Success Criteria Met

✅ User can register and log in
✅ Logged-in user can create a course with sections, pages, and blocks
✅ Blocks are correctly saved and retrieved
✅ Learner can view the course and interact with blocks
✅ Interactive blocks provide immediate feedback
✅ System tracks which pages a user has completed

## Future Enhancements (Not in MVP)

- Admin role for platform management
- Drag-and-drop reordering
- Rich text editor for content
- File uploads for images
- Quiz scoring and analytics
- Course enrollment system
- Comments and discussions
- Certificates of completion
- Mobile app

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License

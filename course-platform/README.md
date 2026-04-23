# Interactive Course Platform

A full-stack web application where creators can build structured courses with sections, pages, and interactive learning blocks. Learners can browse courses, navigate through content, and engage with interactive blocks including prediction prompts, multiple-choice quizzes, fill-in-the-blank exercises, and image hotspots.

## Features

### User Authentication
- Registration with email, username, and password
- Login with session-based authentication
- Logout functionality

### Course Management (Creator)
- Create, edit, and delete courses
- Add course title, description, and optional image
- Dashboard to manage your courses

### Course Structure
- Create sections within courses (ordered)
- Create pages within sections (ordered)
- Edit and delete sections and pages

### Content Blocks
Each page can contain multiple blocks of different types:

1. **Text Block** - Simple HTML content
2. **Prediction Block** - Question with multiple-choice options and explanation
3. **Quiz Block** - Similar to prediction for graded questions
4. **Fill-in-the-Blank Block** - Paragraph with blanks for learners to fill
5. **Image Hotspots Block** - Interactive image with clickable areas

### Learner Experience
- Browse all available courses
- View course with sidebar navigation
- Interact with blocks and receive immediate feedback
- Progress tracking (completed pages marked with checkmarks)

## Technology Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** PHP 8+ with PDO
- **Database:** MySQL 5.7+
- **Authentication:** PHP Sessions

## Installation

### Prerequisites
- PHP 8.0 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- Node.js 18+ (for development)

### Backend Setup

1. **Create the database:**
   ```bash
   mysql -u root -p < backend/database.sql
   ```

2. **Configure database connection:**
   Edit `backend/config.php` with your database credentials:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'course_platform');
   define('DB_USER', 'root');
   define('DB_PASS', 'your_password');
   ```

3. **Deploy backend:**
   Copy the `backend` folder to your web server's document root (e.g., `/var/www/html/api`)

4. **Configure Apache .htaccess:**
   Ensure mod_rewrite is enabled. The included `.htaccess` file handles URL rewriting.

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL:**
   Edit `src/lib/api.ts` and update the API_BASE_URL:
   ```typescript
   const API_BASE_URL = 'http://your-domain.com/api';
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Deploy frontend:**
   Copy the `dist` folder contents to your web server's document root.

## Development

### Run Frontend Development Server
```bash
cd frontend
npm run dev
```

The development server will start at `http://localhost:5173`

### API Endpoints

#### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user

#### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

#### Sections
- `POST /api/courses/:id/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section

#### Pages
- `POST /api/sections/:id/pages` - Create page
- `GET /api/pages/:id` - Get page with blocks
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

#### Blocks
- `POST /api/pages/:id/blocks` - Create block
- `PUT /api/blocks/:id` - Update block
- `DELETE /api/blocks/:id` - Delete block

#### Progress
- `GET /api/courses/:id/progress` - Get course progress
- `POST /api/pages/:id/complete` - Mark page complete

## Database Schema

### Tables
- **users** - User accounts
- **courses** - Course information
- **sections** - Course sections
- **pages** - Section pages
- **blocks** - Page content blocks (JSON content)
- **user_progress** - User progress tracking
- **quiz_attempts** - Quiz attempt history

## Block Content JSON Schemas

### Text Block
```json
{
  "html": "<p>Your HTML content here</p>"
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
  "imageUrl": "https://example.com/image.jpg",
  "hotspots": [
    {
      "x": 0.5,
      "y": 0.5,
      "label": "Center",
      "explanation": "This is the center of the image."
    }
  ]
}
```

## Security Features

- Password hashing with bcrypt
- Prepared statements to prevent SQL injection
- Session-based authentication
- CORS headers configured
- Input validation on all endpoints

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License

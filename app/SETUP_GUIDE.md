# CourseCraft - Complete Setup Guide

## Overview

CourseCraft is a full-stack interactive course platform built with:
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** PHP 8+ with PDO
- **Database:** MySQL 5.7+

## Running the Mock/Local Version (No Backend Required)

The deployed version uses a **Mock API** that stores all data in your browser's localStorage. No server, no database, no setup required.

### To Test Locally:
```bash
cd /path/to/course-platform/frontend
npm install
npm run dev
```
Open `http://localhost:5173`

### Reset Demo Data:
Open browser DevTools → Application → LocalStorage → Clear all

---

## Setting Up the Real Backend with XAMPP

### Step 1: Install XAMPP

1. Download XAMPP from https://www.apachefriends.org/
2. Install to `C:\xampp` (Windows) or `/Applications/XAMPP` (Mac)

### Step 2: Start Apache and MySQL

1. Open XAMPP Control Panel
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**
4. Both should show green (running)

### Step 3: Create the Database

1. Open browser to `http://localhost/phpmyadmin`
2. Click **Databases** tab
3. Enter name: `course_platform`
4. Select collation: `utf8mb4_unicode_ci`
5. Click **Create**

### Step 4: Import the Database Schema

1. In phpMyAdmin, click on `course_platform` database
2. Click **SQL** tab
3. Open `/backend/database.sql` from this project
4. Copy all the SQL and paste into the SQL box
5. Click **Go**

### Step 5: Deploy the PHP Backend

1. Copy the entire `backend/` folder from this project
2. Paste it into `C:\xampp\htdocs\api` (Windows) or `/Applications/XAMPP/htdocs/api` (Mac)

The folder structure should be:
```
htdocs/
└── api/
    ├── .htaccess
    ├── config.php
    ├── db.php
    ├── index.php
    ├── database.sql
    └── routes/
        ├── auth.php
        ├── blocks.php
        ├── courses.php
        ├── pages.php
        ├── progress.php
        └── sections.php
```

### Step 6: Configure Database Connection

Edit `C:\xampp\htdocs\api\config.php`:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');  // Your frontend URL
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'course_platform');
define('DB_USER', 'root');
define('DB_PASS', '');  // Default XAMPP has no password

session_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function errorResponse($message, $statusCode = 400) {
    jsonResponse(['error' => $message], $statusCode);
}

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        errorResponse('Unauthorized', 401);
    }
    return $_SESSION['user_id'];
}

function getJsonInput() {
    $json = file_get_contents('php://input');
    return json_decode($json, true);
}
```

### Step 7: Enable mod_rewrite (if 404 errors)

Edit `C:\xampp\apache\conf\httpd.conf`:

Find this line and uncomment it (remove #):
```
LoadModule rewrite_module modules/mod_rewrite.so
```

Find the Directory section for htdocs:
```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride All        ← Change from None to All
    Require all granted
</Directory>
```

Restart Apache from XAMPP Control Panel.

### Step 8: Test the API

Open browser to:
```
http://localhost/api/
```

You should see:
```json
{"message": "Course Platform API"}
```

### Step 9: Switch Frontend to Real API

Edit `frontend/src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  }

  // Auth
  async register(credentials: RegisterCredentials): Promise<User> {
    return this.request<User>('/register', { method: 'POST', body: JSON.stringify(credentials) });
  }
  async login(credentials: LoginCredentials): Promise<User> {
    return this.request<User>('/login', { method: 'POST', body: JSON.stringify(credentials) });
  }
  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/logout', { method: 'POST' });
  }
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/me');
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>('/courses');
  }
  async getCourse(id: number): Promise<Course> {
    return this.request<Course>(`/courses/${id}`);
  }
  async createCourse(course: Partial<Course>): Promise<Course> {
    return this.request<Course>('/courses', { method: 'POST', body: JSON.stringify(course) });
  }
  async updateCourse(id: number, course: Partial<Course>): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(course) });
  }
  async deleteCourse(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/courses/${id}`, { method: 'DELETE' });
  }

  // Sections
  async getSections(courseId: number): Promise<Section[]> {
    return this.request<Section[]>(`/courses/${courseId}/sections`);
  }
  async createSection(courseId: number, section: Partial<Section>): Promise<Section> {
    return this.request<Section>(`/courses/${courseId}/sections`, { method: 'POST', body: JSON.stringify(section) });
  }
  async updateSection(id: number, section: Partial<Section>): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(section) });
  }
  async deleteSection(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/sections/${id}`, { method: 'DELETE' });
  }

  // Pages
  async getPages(sectionId: number): Promise<Page[]> {
    return this.request<Page[]>(`/sections/${sectionId}/pages`);
  }
  async createPage(sectionId: number, page: Partial<Page>): Promise<Page> {
    return this.request<Page>(`/sections/${sectionId}/pages`, { method: 'POST', body: JSON.stringify(page) });
  }
  async updatePage(id: number, page: Partial<Page>): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/pages/${id}`, { method: 'PUT', body: JSON.stringify(page) });
  }
  async deletePage(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/pages/${id}`, { method: 'DELETE' });
  }
  async getPage(id: number): Promise<Page> {
    return this.request<Page>(`/pages/${id}`);
  }

  // Blocks
  async getBlocks(pageId: number): Promise<Block[]> {
    return this.request<Block[]>(`/pages/${pageId}/blocks`);
  }
  async createBlock(pageId: number, type: BlockType, content: BlockContent, position?: number): Promise<Block> {
    return this.request<Block>(`/pages/${pageId}/blocks`, { method: 'POST', body: JSON.stringify({ type, content, position }) });
  }
  async updateBlock(id: number, content: BlockContent, position?: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/blocks/${id}`, { method: 'PUT', body: JSON.stringify({ content, position }) });
  }
  async deleteBlock(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/blocks/${id}`, { method: 'DELETE' });
  }
  async updateBlockPosition(id: number, position: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/blocks/${id}/position`, { method: 'PATCH', body: JSON.stringify({ position }) });
  }

  // Progress
  async getProgress(): Promise<UserProgress[]> {
    return this.request<UserProgress[]>('/progress');
  }
  async getCourseProgress(courseId: number): Promise<CourseProgress> {
    return this.request<CourseProgress>(`/courses/${courseId}/progress`);
  }
  async markPageComplete(pageId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/pages/${pageId}/complete`, { method: 'POST' });
  }
}

export const api = new ApiClient();
```

### Step 10: Build Frontend

```bash
cd /path/to/frontend
npm run build
```

### Step 11: Deploy Frontend

Copy the `dist/` folder contents to `C:\xampp\htdocs\coursecraft` or serve via any static server.

---

## File Placement Summary

| File/Folder | Location (XAMPP) | Purpose |
|------------|-------------------|---------|
| `backend/` | `htdocs/api/` | PHP REST API |
| `frontend/dist/` | `htdocs/coursecraft/` | React app |
| Database | phpMyAdmin → `course_platform` | MySQL database |

---

## Environment Configuration

### PHP Backend Config (`backend/config.php`)
- `DB_HOST`: Database server (usually `localhost`)
- `DB_NAME`: Database name (`course_platform`)
- `DB_USER`: Database user (`root` for XAMPP)
- `DB_PASS`: Database password (empty for default XAMPP)
- `CORS`: Set to your frontend URL

### Frontend API URL (`frontend/src/lib/api.ts`)
- Local dev: `http://localhost/api`
- Production: `https://yourdomain.com/api`

---

## Troubleshooting

### "404 Not Found" on API calls
- Check Apache is running
- Check files are in `htdocs/api/`
- Check `.htaccess` is present and mod_rewrite is enabled

### "CORS" errors
- Update `Access-Control-Allow-Origin` in `config.php` to match your frontend URL exactly

### "Database connection failed"
- Check MySQL is running in XAMPP
- Verify database name, username, password in `config.php`
- Check database exists in phpMyAdmin

### "Class 'PDO' not found"
- Enable PDO in PHP: edit `php.ini`, uncomment `extension=pdo_mysql`
- Restart Apache

### "Permission denied" on folders
- Windows: No special permissions needed
- Mac/Linux: `chmod -R 755 htdocs/api/`

---

## Quick Commands Reference

```bash
# Start XAMPP (Linux/Mac)
sudo /opt/lampp/lampp start

# Stop XAMPP
sudo /opt/lampp/lampp stop

# Restart Apache only
sudo /opt/lampp/lampp restartapache

# MySQL command line
/opt/lampp/bin/mysql -u root -p

# Check PHP version
php -v
```

---

## Production Deployment Notes

1. **Never use root user** in production. Create a dedicated MySQL user:
```sql
CREATE USER 'coursecraft'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON course_platform.* TO 'coursecraft'@'localhost';
FLUSH PRIVILEGES;
```

2. **Disable display_errors** in production
3. **Use HTTPS** for session security
4. **Set proper CORS** to your domain only
5. **Regular backups** of the database

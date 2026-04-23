# Concepts to Learn for Confident Presentation

This document lists every concept used in CourseCraft. Study these to confidently present your project and handle teacher questions or tweaks during presentation.

## 1. React Fundamentals

### Components
- **Functional Components**: All components are functions that return JSX
- **JSX**: HTML-like syntax inside JavaScript (`<div>`, `<Button>`, etc.)
- **Props**: How parent passes data to child (`{ children }: { children: React.ReactNode }`)
- **Children Prop**: Content between opening/closing tags

### Hooks
- **useState**: `const [count, setCount] = useState(0)` - stores reactive data
- **useEffect**: `useEffect(() => { ... }, [dependency])` - runs side effects (API calls, subscriptions)
- **useContext**: Access context data without prop drilling
- **useParams**: `const { id } = useParams()` - gets URL parameters
- **useNavigate**: Programmatic navigation (`navigate('/login')`)

### Conditional Rendering
```tsx
{isLoading ? <Spinner /> : <Content />}
{isAuthenticated && <PrivateButton />}
```

## 2. TypeScript

### Types & Interfaces
```ts
interface User {
  id: number;
  name: string;
  role?: string;  // optional
}

type BlockType = 'text' | 'quiz' | 'prediction';  // union type
```

### Generics
```ts
function getStorage<T>(key: string, defaultValue: T): T
```

### Type Aliases
```ts
type BlockContent = TextBlockContent | QuizBlockContent;
```

## 3. React Router

- **BrowserRouter**: Wraps app, enables routing
- **Routes/Route**: Defines URL paths
- **Navigate**: Redirects (`<Navigate to="/login" />`)
- **Link**: Client-side navigation without page reload
- **useParams**: Extracts `:id` from `/courses/:id`
- **Private Routes**: Conditional rendering based on auth state

## 4. State Management (Context API)

### Auth Context Pattern
```tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  // login, logout, register functions here
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);  // custom hook
}
```

## 5. API Communication

### Fetch / REST API
```ts
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  credentials: 'include',  // sends cookies for sessions
});
```

### CRUD Operations
- **Create**: POST
- **Read**: GET
- **Update**: PUT/PATCH
- **Delete**: DELETE

## 6. localStorage (Mock API)

```ts
// Save
localStorage.setItem('key', JSON.stringify(data));

// Read
const data = JSON.parse(localStorage.getItem('key') || '[]');

// Clear
localStorage.clear();
```

## 7. shadcn/ui Components

Learn to use and customize:
- **Button**: Variants (default, outline, ghost, destructive)
- **Card**: Card, CardHeader, CardContent, CardTitle
- **Dialog**: Modal popups with DialogContent, DialogHeader
- **Input/Textarea**: Form fields
- **Select**: Dropdown selection
- **Progress**: Progress bars
- **Badge**: Status indicators
- **Table**: Data tables
- **Tabs**: Tabbed interfaces
- **ScrollArea**: Custom scrollable containers
- **Slider**: Range input component
- **RadioGroup**: Single-choice selection

### All imported from:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
```

## 8. Tailwind CSS

### Utility Classes
```html
<div class="flex items-center justify-between bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700">
```

### Key Concepts
- **Flexbox**: `flex`, `items-center`, `justify-between`
- **Spacing**: `p-4` (padding), `m-2` (margin), `gap-4`
- **Colors**: `bg-indigo-600`, `text-gray-700`
- **Typography**: `font-bold`, `text-lg`, `text-center`
- **Responsive**: `md:grid-cols-2` (2 columns on medium+ screens)
- **Hover/Focus**: `hover:bg-indigo-700`, `focus:ring-2`
- **Transitions**: `transition-all`, `duration-300`

### Custom Colors in config
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#4F46E5',
    }
  }
}
```

## 9. Markdown Rendering

### marked Library
```ts
import { marked } from 'marked';
const html = marked.parse(markdownText, { async: false });
```

### Supported Markdown
- `# Heading`, `## Subheading`
- `**bold**`, `*italic*`
- `- list item`
- `[link](url)`
- `` `code` ``
- ``` ```code block``` ```

## 10. Form Validation

### Regex Patterns
```ts
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasUppercase = /[A-Z]/;
const hasNumber = /[0-9]/;
const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
```

### Validation Logic
```ts
function validatePassword(password: string): string | undefined {
  if (password.length < 8) return 'Must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Must contain uppercase letter';
  // etc.
}
```

## 11. PHP Backend (for real deployment)

### Key Concepts
- **index.php router**: Reads URL path, routes to correct file
- **PDO**: PHP Data Objects for database access
- **Prepared Statements**: Prevents SQL injection
```php
$stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);
```
- **Sessions**: `session_start()`, `$_SESSION['user_id']`
- **JSON Response**: `echo json_encode($data);`
- **CORS Headers**: Cross-Origin Resource Sharing

### .htaccess URL Rewriting
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

## 12. Database (MySQL)

### Key Tables
- **users**: id, username, email, password_hash, role, bio
- **courses**: id, title, description, creator_id, image_url
- **sections**: id, course_id, title, position
- **pages**: id, section_id, title, position
- **blocks**: id, page_id, type, content (JSON), position
- **user_progress**: id, user_id, page_id, completed

### Relationships
- Course has many Sections
- Section has many Pages
- Page has many Blocks
- User has many Courses (as creator)

### JSON Columns
```sql
content JSON NOT NULL
```
Used to store flexible block content (quiz questions, text, etc.)

## 13. User Roles & Authorization

### Three Roles
- **learner**: Can view courses, track progress
- **creator**: Can create/edit/delete own courses
- **admin**: Can delete any course/user, access admin panel

### Route Guards
```tsx
function CreatorRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'creator' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
}
```

## 14. Interactive Block Types

### How Each Works:
1. **Text (Markdown)**: Renders markdown to HTML using `marked`
2. **Prediction**: Radio buttons, shows correct/incorrect + explanation
3. **Quiz**: Same as prediction
4. **Fill-in-the-Blank**: Replaces `___` with `<input>`, checks on type
5. **YouTube**: Embeds iframe with videoId
6. **Slider**: Draggable range, checks if value is in correct range

## 15. Progress Tracking

```ts
// Mark page complete
await api.markPageComplete(pageId);

// Calculate percentage
const completed = completedPages.length;
const total = allPages.length;
const percentage = Math.round((completed / total) * 100);
```

## 16. Common Code Patterns

### Loading State
```tsx
const [isLoading, setIsLoading] = useState(true);
// ... fetch data ...
setIsLoading(false);

{isLoading ? <Spinner /> : <Content />}
```

### Error Handling with Toast
```tsx
try {
  await api.createCourse(data);
  toast.success('Created!');
} catch (error) {
  toast.error(error instanceof Error ? error.message : 'Failed');
}
```

### Confirm Dialog
```tsx
if (!confirm('Are you sure?')) return;
```

## 17. Quick Teacher Tweaks You Can Make

### Change Primary Color
Edit `tailwind.config.js` or use Tailwind classes directly.

### Add a New Block Type
1. Add to `BlockType` union in `types/index.ts`
2. Add content interface
3. Add to `BLOCK_TYPES` array in `CourseEditorPage.tsx`
4. Add case in `getDefaultBlockContent`
5. Create renderer component in `components/blocks/`
6. Add case in `CourseViewPage.tsx` `renderBlock`

### Add a New Page
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add link in `Navbar.tsx`

### Change Validation Rules
Edit `src/lib/validation.ts`

### Add Database Field
1. Add column in `database.sql`
2. Update PHP routes to handle it
3. Update types
4. Update forms and displays

---

## Presentation Tips

1. **Start with the homepage** - show the mission-driven design
2. **Register as a creator** - demonstrate role selection
3. **Create a course** - show sections, pages, blocks
4. **Add all block types** - text, prediction, quiz, fill-blank, YouTube, slider
5. **Preview the course** - show progress bar, sidebar navigation
6. **Show profile page** - editable bio
7. **If asked about backend** - show the PHP files, explain the API structure
8. **If asked about database** - show the schema, explain JSON columns
9. **If asked to make a tweak** - use the concepts above!

## Key Files to Know By Heart

| File | What It Does |
|------|-------------|
| `src/App.tsx` | Routes, layout, auth guards |
| `src/lib/mock-api.ts` | All API functions (data layer) |
| `src/lib/auth-context.tsx` | Login state, current user |
| `src/types/index.ts` | All TypeScript types |
| `src/pages/CourseEditorPage.tsx` | Most complex page - course builder |
| `src/pages/CourseViewPage.tsx` | Course viewer with sidebar |
| `backend/index.php` | API router |
| `backend/routes/*.php` | Individual API endpoints |
| `backend/database.sql` | Database schema |

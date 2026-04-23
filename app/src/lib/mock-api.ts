// Mock API - Simulates backend functionality using localStorage
import type {
  User, LoginCredentials, RegisterCredentials,
  Course, Section, Page, Block, BlockType, BlockContent,
  UserProgress, CourseProgress, QuizAttempt
} from '@/types';

// Generate unique IDs
let idCounter = parseInt(localStorage.getItem('mock_id_counter') || '100');
const generateId = () => {
  idCounter++;
  localStorage.setItem('mock_id_counter', idCounter.toString());
  return idCounter;
};

// Storage helpers
const getStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

class MockApiClient {
  private currentUser: User | null = null;

  constructor() {
    const session = localStorage.getItem('mock_session');
    if (session) {
      this.currentUser = JSON.parse(session);
    }
  }

  private async delay(ms = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth
  async register(credentials: RegisterCredentials): Promise<User> {
    await this.delay();

    const users = getStorage<(User & { password: string })[]>('mock_users', []);

    if (users.find(u => u.email === credentials.email)) {
      throw new Error('Email already exists');
    }
    if (users.find(u => u.username === credentials.username)) {
      throw new Error('Username already exists');
    }

    const newUser: User & { password: string } = {
      id: generateId(),
      username: credentials.username,
      email: credentials.email,
      role: credentials.role || 'learner',
      bio: '',
      password: credentials.password,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    setStorage('mock_users', users);

    const { password, ...userWithoutPassword } = newUser;
    this.currentUser = userWithoutPassword;
    localStorage.setItem('mock_session', JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    await this.delay();

    const users = getStorage<(User & { password: string })[]>('mock_users', []);
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;
    localStorage.setItem('mock_session', JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  }

  async logout(): Promise<{ message: string }> {
    await this.delay();
    this.currentUser = null;
    localStorage.removeItem('mock_session');
    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(): Promise<User> {
    await this.delay();
    if (!this.currentUser) {
      throw new Error('Unauthorized');
    }
    return this.currentUser;
  }

  async updateProfile(userId: number, updates: { bio?: string; username?: string }): Promise<User> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');
    if (this.currentUser.id !== userId && this.currentUser.role !== 'admin') {
      throw new Error('Forbidden');
    }

    const users = getStorage<(User & { password: string })[]>('mock_users', []);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');

    if (updates.bio !== undefined) users[index].bio = updates.bio;
    if (updates.username !== undefined) users[index].username = updates.username;

    setStorage('mock_users', users);

    const updated = { ...users[index] };
    delete (updated as { password?: string }).password;

    if (this.currentUser.id === userId) {
      this.currentUser = updated;
      localStorage.setItem('mock_session', JSON.stringify(updated));
    }

    return updated;
  }

  async getUserProfile(userId: number): Promise<User | null> {
    await this.delay();
    const users = getStorage<(User & { password: string })[]>('mock_users', []);
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    const { password, ...profile } = user;
    return profile;
  }

  async getAllUsers(): Promise<User[]> {
    await this.delay();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Admin access required');
    }
    const users = getStorage<(User & { password: string })[]>('mock_users', []);
    return users.map(({ password, ...u }) => u);
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    await this.delay();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Admin access required');
    }
    const users = getStorage<(User & { password: string })[]>('mock_users', []);
    setStorage('mock_users', users.filter(u => u.id !== userId));
    return { message: 'User deleted' };
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    await this.delay();
    const courses = getStorage<Course[]>('mock_courses', []);
    const users = getStorage<User[]>('mock_users', []);

    return courses.map(c => ({
      ...c,
      creator_name: users.find(u => u.id === c.creator_id)?.username || 'Unknown'
    }));
  }

  async getCourse(id: number): Promise<Course> {
    await this.delay();
    const courses = getStorage<Course[]>('mock_courses', []);
    const course = courses.find(c => c.id === id);

    if (!course) {
      throw new Error('Course not found');
    }

    const sections = getStorage<Section[]>('mock_sections', [])
      .filter(s => s.course_id === id)
      .sort((a, b) => a.position - b.position);

    const pages = getStorage<Page[]>('mock_pages', []);
    const blocks = getStorage<Block[]>('mock_blocks', []);

    const sectionsWithPages = sections.map(section => {
      const sectionPages = pages
        .filter(p => p.section_id === section.id)
        .sort((a, b) => a.position - b.position)
        .map(page => ({
          ...page,
          blocks: blocks.filter(b => b.page_id === page.id).sort((a, b) => a.position - b.position)
        }));

      return {
        ...section,
        pages: sectionPages
      };
    });

    return {
      ...course,
      sections: sectionsWithPages
    };
  }

  async createCourse(course: Partial<Course>): Promise<Course> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');

    const newCourse: Course = {
      id: generateId(),
      title: course.title || 'Untitled Course',
      description: course.description || '',
      creator_id: this.currentUser.id,
      image_url: course.image_url,
      created_at: new Date().toISOString()
    };

    const courses = getStorage<Course[]>('mock_courses', []);
    courses.push(newCourse);
    setStorage('mock_courses', courses);

    return newCourse;
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<{ message: string }> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');

    const courses = getStorage<Course[]>('mock_courses', []);
    const index = courses.findIndex(c => c.id === id);

    if (index === -1) throw new Error('Course not found');
    if (courses[index].creator_id !== this.currentUser.id && this.currentUser.role !== 'admin') {
      throw new Error('Forbidden');
    }

    courses[index] = { ...courses[index], ...course };
    setStorage('mock_courses', courses);

    return { message: 'Course updated' };
  }

  async deleteCourse(id: number): Promise<{ message: string }> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');

    const courses = getStorage<Course[]>('mock_courses', []);
    const course = courses.find(c => c.id === id);

    if (!course) throw new Error('Course not found');
    if (course.creator_id !== this.currentUser.id && this.currentUser.role !== 'admin') {
      throw new Error('Forbidden');
    }

    const sections = getStorage<Section[]>('mock_sections', []);
    const sectionIds = sections.filter(s => s.course_id === id).map(s => s.id);

    const pages = getStorage<Page[]>('mock_pages', []);
    const pageIds = pages.filter(p => sectionIds.includes(p.section_id)).map(p => p.id);

    setStorage('mock_courses', courses.filter(c => c.id !== id));
    setStorage('mock_sections', sections.filter(s => s.course_id !== id));
    setStorage('mock_pages', pages.filter(p => !sectionIds.includes(p.section_id)));
    setStorage('mock_blocks', getStorage<Block[]>('mock_blocks', []).filter(b => !pageIds.includes(b.page_id)));

    return { message: 'Course deleted' };
  }

  // Sections
  async getSections(courseId: number): Promise<Section[]> {
    await this.delay();
    const sections = getStorage<Section[]>('mock_sections', []);
    return sections.filter(s => s.course_id === courseId).sort((a, b) => a.position - b.position);
  }

  async createSection(courseId: number, section: Partial<Section>): Promise<Section> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');

    const newSection: Section = {
      id: generateId(),
      course_id: courseId,
      title: section.title || 'Untitled Section',
      position: section.position || 0,
      created_at: new Date().toISOString()
    };

    const sections = getStorage<Section[]>('mock_sections', []);
    sections.push(newSection);
    setStorage('mock_sections', sections);

    return newSection;
  }

  async updateSection(id: number, section: Partial<Section>): Promise<{ message: string }> {
    await this.delay();
    const sections = getStorage<Section[]>('mock_sections', []);
    const index = sections.findIndex(s => s.id === id);

    if (index === -1) throw new Error('Section not found');

    sections[index] = { ...sections[index], ...section };
    setStorage('mock_sections', sections);

    return { message: 'Section updated' };
  }

  async deleteSection(id: number): Promise<{ message: string }> {
    await this.delay();

    const pages = getStorage<Page[]>('mock_pages', []);
    const pageIds = pages.filter(p => p.section_id === id).map(p => p.id);

    setStorage('mock_sections', getStorage<Section[]>('mock_sections', []).filter(s => s.id !== id));
    setStorage('mock_pages', pages.filter(p => p.section_id !== id));
    setStorage('mock_blocks', getStorage<Block[]>('mock_blocks', []).filter(b => !pageIds.includes(b.page_id)));

    return { message: 'Section deleted' };
  }

  // Pages
  async getPages(sectionId: number): Promise<Page[]> {
    await this.delay();
    const pages = getStorage<Page[]>('mock_pages', []);
    return pages.filter(p => p.section_id === sectionId).sort((a, b) => a.position - b.position);
  }

  async createPage(sectionId: number, page: Partial<Page>): Promise<Page> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');

    const newPage: Page = {
      id: generateId(),
      section_id: sectionId,
      title: page.title || 'Untitled Page',
      position: page.position || 0,
      created_at: new Date().toISOString()
    };

    const pages = getStorage<Page[]>('mock_pages', []);
    pages.push(newPage);
    setStorage('mock_pages', pages);

    return newPage;
  }

  async updatePage(id: number, page: Partial<Page>): Promise<{ message: string }> {
    await this.delay();
    const pages = getStorage<Page[]>('mock_pages', []);
    const index = pages.findIndex(p => p.id === id);

    if (index === -1) throw new Error('Page not found');

    pages[index] = { ...pages[index], ...page };
    setStorage('mock_pages', pages);

    return { message: 'Page updated' };
  }

  async deletePage(id: number): Promise<{ message: string }> {
    await this.delay();

    setStorage('mock_pages', getStorage<Page[]>('mock_pages', []).filter(p => p.id !== id));
    setStorage('mock_blocks', getStorage<Block[]>('mock_blocks', []).filter(b => b.page_id !== id));

    return { message: 'Page deleted' };
  }

  async getPage(id: number): Promise<Page> {
    await this.delay();
    const pages = getStorage<Page[]>('mock_pages', []);
    const page = pages.find(p => p.id === id);

    if (!page) throw new Error('Page not found');

    const blocks = getStorage<Block[]>('mock_blocks', [])
      .filter(b => b.page_id === id)
      .sort((a, b) => a.position - b.position);

    return {
      ...page,
      blocks
    };
  }

  // Blocks
  async getBlocks(pageId: number): Promise<Block[]> {
    await this.delay();
    const blocks = getStorage<Block[]>('mock_blocks', []);
    return blocks.filter(b => b.page_id === pageId).sort((a, b) => a.position - b.position);
  }

  async createBlock(pageId: number, type: BlockType, content: BlockContent, position?: number): Promise<Block> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');

    const newBlock: Block = {
      id: generateId(),
      page_id: pageId,
      type,
      content,
      position: position ?? 0,
      created_at: new Date().toISOString()
    };

    const blocks = getStorage<Block[]>('mock_blocks', []);
    blocks.push(newBlock);
    setStorage('mock_blocks', blocks);

    return newBlock;
  }

  async updateBlock(id: number, content: BlockContent, position?: number): Promise<{ message: string }> {
    await this.delay();
    const blocks = getStorage<Block[]>('mock_blocks', []);
    const index = blocks.findIndex(b => b.id === id);

    if (index === -1) throw new Error('Block not found');

    blocks[index] = { ...blocks[index], content };
    if (position !== undefined) {
      blocks[index].position = position;
    }
    setStorage('mock_blocks', blocks);

    return { message: 'Block updated' };
  }

  async deleteBlock(id: number): Promise<{ message: string }> {
    await this.delay();
    setStorage('mock_blocks', getStorage<Block[]>('mock_blocks', []).filter(b => b.id !== id));
    return { message: 'Block deleted' };
  }

  async updateBlockPosition(id: number, position: number): Promise<{ message: string }> {
    await this.delay();
    const blocks = getStorage<Block[]>('mock_blocks', []);
    const index = blocks.findIndex(b => b.id === id);

    if (index === -1) throw new Error('Block not found');

    blocks[index].position = position;
    setStorage('mock_blocks', blocks);

    return { message: 'Position updated' };
  }

  async submitQuizAttempt(blockId: number, answers: unknown): Promise<QuizAttempt> {
    await this.delay();

    const blocks = getStorage<Block[]>('mock_blocks', []);
    const block = blocks.find(b => b.id === blockId);

    if (!block) throw new Error('Block not found');

    let score = 0;
    let correct = false;

    if (block.type === 'prediction' || block.type === 'quiz') {
      const content = block.content as { correct: number };
      correct = answers === content.correct;
      score = correct ? 1 : 0;
    } else if (block.type === 'fill_blank') {
      const content = block.content as { answers: string[] };
      const userAnswers = Array.isArray(answers) ? answers : [answers];
      const correctCount = content.answers.filter((ans, i) =>
        userAnswers[i]?.toString().trim().toLowerCase() === ans.toLowerCase()
      ).length;
      score = content.answers.length > 0 ? Math.round((correctCount / content.answers.length) * 100) : 0;
      correct = score === 100;
    } else if (block.type === 'slider') {
      const content = block.content as { correctMin: number; correctMax: number };
      const val = Number(answers);
      correct = val >= content.correctMin && val <= content.correctMax;
      score = correct ? 1 : 0;
    }

    return { score, correct };
  }

  // Progress
  async getProgress(): Promise<UserProgress[]> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');

    const progress = getStorage<UserProgress[]>('mock_progress', []);
    return progress.filter(p => p.user_id === this.currentUser!.id);
  }

  async getCourseProgress(courseId: number): Promise<CourseProgress> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');

    const course = await this.getCourse(courseId);
    const allPages: number[] = [];
    course.sections?.forEach(s => {
      s.pages?.forEach(p => allPages.push(p.id));
    });

    const progress = getStorage<UserProgress[]>('mock_progress', []);
    const completedPages = progress
      .filter(p => p.user_id === this.currentUser!.id && allPages.includes(p.page_id) && p.completed)
      .map(p => p.page_id);

    return {
      completed_pages: completedPages,
      total_pages: allPages.length,
      completed_count: completedPages.length,
      percentage: allPages.length > 0 ? Math.round((completedPages.length / allPages.length) * 100) : 0
    };
  }

  async markPageComplete(pageId: number): Promise<{ message: string }> {
    await this.delay();
    if (!this.currentUser) throw new Error('Unauthorized');

    const progress = getStorage<UserProgress[]>('mock_progress', []);
    const existingIndex = progress.findIndex(p =>
      p.user_id === this.currentUser!.id && p.page_id === pageId
    );

    if (existingIndex === -1) {
      progress.push({
        id: generateId(),
        user_id: this.currentUser.id,
        page_id: pageId,
        completed: true,
        completed_at: new Date().toISOString()
      });
    } else {
      progress[existingIndex].completed = true;
      progress[existingIndex].completed_at = new Date().toISOString();
    }

    setStorage('mock_progress', progress);

    // Store last visited page for "continue where you left off"
    const lastVisited = getStorage<Record<number, number>>('mock_last_visited', {});
    lastVisited[this.currentUser.id] = pageId;
    setStorage('mock_last_visited', lastVisited);

    return { message: 'Page marked as completed' };
  }

  async getLastVisitedPage(courseId: number): Promise<number | null> {
    await this.delay();
    if (!this.currentUser) return null;

    const course = await this.getCourse(courseId);
    const allPages: number[] = [];
    course.sections?.forEach(s => {
      s.pages?.forEach(p => allPages.push(p.id));
    });

    const progress = getStorage<UserProgress[]>('mock_progress', []);
    const completedPages = progress
      .filter(p => p.user_id === this.currentUser!.id && allPages.includes(p.page_id) && p.completed)
      .map(p => p.page_id);

    // Find first incomplete page
    const incomplete = allPages.find(p => !completedPages.includes(p));
    if (incomplete) return incomplete;

    // Or return last visited
    const lastVisited = getStorage<Record<number, number>>('mock_last_visited', {});
    return lastVisited[this.currentUser.id] || null;
  }
}

export const mockApi = new MockApiClient();

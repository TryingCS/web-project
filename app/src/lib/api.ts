// API Client - Uses Mock API for demo/testing
//import { mockApi } from './mock-api';

//export const api = mockApi;
//
import type {
  User, LoginCredentials, RegisterCredentials,
  Course, Section, Page, Block, BlockType, BlockContent,
  UserProgress, CourseProgress
} from '@/types';
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

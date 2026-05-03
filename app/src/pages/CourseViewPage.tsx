// CourseViewPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { isCreatorOrAdmin } from '@/lib/validation';
import type { Course, Section, Page, Block, TextBlockContent, PredictionBlockContent, QuizBlockContent, FillBlankBlockContent, YoutubeBlockContent, SliderBlockContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Check, ChevronRight, ChevronLeft, Puzzle, Menu, X, BookOpen, Edit, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { TextBlock } from '@/components/blocks/TextBlock';
import { QuizBlock } from '@/components/blocks/QuizBlock';
import { FillBlankBlock } from '@/components/blocks/FillBlankBlock';
import { YoutubeBlock } from '@/components/blocks/YoutubeBlock';
import { SliderBlock } from '@/components/blocks/SliderBlock';

export function CourseViewPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || '0');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [completedPages, setCompletedPages] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (isAuthenticated && courseId) {
      loadProgress();
    }
  }, [isAuthenticated, courseId]);

  const loadCourse = async () => {
    try {
      const data = await api.getCourse(courseId);
      setCourse(data);

      if (data.sections && data.sections.length > 0) {
        const allPages = data.sections.flatMap(s => s.pages || []);
        if (allPages.length > 0) {
          // Always load the first page for now
          await loadPage(allPages[0].id);
        }
      }
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const courseProgress = await api.getCourseProgress(courseId);
      setCompletedPages(courseProgress.completed_pages);
      setProgress(courseProgress.percentage);
    } catch {
      // Ignore
    }
  };

  const loadPage = async (pageId: number) => {
    try {
      const page = await api.getPage(pageId);
      setCurrentPage(page);
      if (isAuthenticated) {
        await api.markPageComplete(pageId);
        if (!completedPages.includes(pageId)) {
          setCompletedPages(prev => [...prev, pageId]);
          const totalPages = course?.sections?.flatMap(s => s.pages || []).length || 1;
          setProgress(Math.round((completedPages.length + 1) / totalPages * 100));
        }
      }
    } catch (error) {
      toast.error('Failed to load page');
    }
  };

  const goToNextPage = () => {
    if (!course || !currentPage) return;
    const allPages = course.sections?.flatMap(s => s.pages || []) || [];
    const currentIndex = allPages.findIndex(p => p.id === currentPage.id);
    if (currentIndex < allPages.length - 1) {
      loadPage(allPages[currentIndex + 1].id);
    }
  };

  const goToPrevPage = () => {
    if (!course || !currentPage) return;
    const allPages = course.sections?.flatMap(s => s.pages || []) || [];
    const currentIndex = allPages.findIndex(p => p.id === currentPage.id);
    if (currentIndex > 0) {
      loadPage(allPages[currentIndex - 1].id);
    }
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'text':
        return <TextBlock content={block.content as TextBlockContent} />;
      case 'prediction':
      case 'quiz':
        return <QuizBlock content={block.content as QuizBlockContent} />;
      case 'fill_blank':
        return <FillBlankBlock content={block.content as FillBlankBlockContent} />;
      case 'youtube':
        return <YoutubeBlock content={block.content as YoutubeBlockContent} />;
      case 'slider':
        return <SliderBlock content={block.content as SliderBlockContent} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Puzzle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Course not found.</p>
      </div>
    );
  }

  const allPages = course.sections?.flatMap(s => s.pages || []) || [];
  const currentPageIndex = currentPage ? allPages.findIndex(p => p.id === currentPage.id) : -1;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r bg-gray-50 overflow-hidden flex-shrink-0`}>
        <ScrollArea className="h-full">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-1">
              <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 text-gray-500" />
              </Button>
              <h2 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h2>
            </div>
            {isAuthenticated && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{progress}% complete</span>
                  <span className="text-xs text-gray-500">{completedPages.length}/{allPages.length} pages</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            {course.sections?.map((section: Section) => (
              <div key={section.id} className="mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-2">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.pages?.map((page: Page) => (
                    <button
                      key={page.id}
                      onClick={() => loadPage(page.id)}
                      className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg transition-colors ${
                        currentPage?.id === page.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'hover:bg-white text-gray-700'
                      }`}
                    >
                      {completedPages.includes(page.id) ? (
                        <Check className={`h-3.5 w-3.5 ${currentPage?.id === page.id ? 'text-white' : 'text-emerald-500'}`} />
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${currentPage?.id === page.id ? 'border-white' : 'border-gray-300'}`} />
                      )}
                      <span className="truncate">{page.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-4xl mx-auto p-6 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="ml-2">{sidebarOpen ? 'Hide' : 'Show'} Sidebar</span>
            </Button>
            {isAuthenticated && isCreatorOrAdmin(user?.role || 'learner') && user?.id === course.creator_id && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/courses/${course.id}/edit`)}>
                <Edit className="h-4 w-4 mr-1.5" />
                Edit Course
              </Button>
            )}
          </div>

          {currentPage ? (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{currentPage.title}</h1>
              <div className="space-y-8">
                {currentPage.blocks?.map((block: Block, index: number) => (
                  <div key={block.id}>
                    {index > 0 && <Separator className="my-8" />}
                    {renderBlock(block)}
                  </div>
                ))}
                {(!currentPage.blocks || currentPage.blocks.length === 0) && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <BookOpen className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">This page has no content yet.</p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={goToPrevPage}
                  disabled={currentPageIndex <= 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPageIndex + 1} of {allPages.length}
                </span>
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPageIndex >= allPages.length - 1}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Select a page to start learning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
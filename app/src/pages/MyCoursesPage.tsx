import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/validation';
import type { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Puzzle, Edit, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', image_url: '' });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const allCourses = await api.getCourses();
      const myCourses = isAdmin(user?.role || 'learner')
        ? allCourses
        : allCourses.filter(c => c.creator_id === user?.id);
      setCourses(myCourses);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      await api.createCourse(newCourse);
      toast.success('Course created successfully!');
      setIsCreateDialogOpen(false);
      setNewCourse({ title: '', description: '', image_url: '' });
      loadCourses();
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  const confirmDelete = async () => {
    if (!deleteCourseId) return;
    try {
      await api.deleteCourse(deleteCourseId);
      toast.success('Course deleted');
      setDeleteCourseId(null);
      loadCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">Manage your courses and create new content</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Puzzle className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first interactive course and start sharing knowledge with active learners.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:shadow-lg transition-all border-0 shadow-md overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Puzzle className="h-12 w-12 text-indigo-300" />
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-1 text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{course.description || 'No description'}</p>
                <div className="flex gap-2">
                  <Link to={`/courses/${course.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1.5" /> Edit
                    </Button>
                  </Link>
                  <Link to={`/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-1.5" /> View
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteCourseId(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Fill in the details below to create a new course.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="Course title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} rows={3} placeholder="What will learners gain?" />
            </div>
            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input value={newCourse.image_url} onChange={e => setNewCourse({ ...newCourse, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCourse} disabled={!newCourse.title.trim()} className="bg-indigo-600 hover:bg-indigo-700">Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!deleteCourseId} onOpenChange={() => setDeleteCourseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>Are you sure? This will permanently delete the course and all its content. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCourseId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

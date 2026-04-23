import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/validation';
import type { User, Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, UserIcon, Shield, Pencil, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const targetUserId = userId ? parseInt(userId) : currentUser?.id;
  const isOwnProfile = currentUser?.id === targetUserId;
  const isAdminUser = isAdmin(currentUser?.role || 'learner');

  const [profile, setProfile] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [targetUserId]);

  const loadProfile = async () => {
    try {
      if (!targetUserId) return;
      const profileData = await api.getUserProfile(targetUserId);
      setProfile(profileData);
      if (profileData) {
        setBio(profileData.bio || '');
        setUsername(profileData.username);
      }

      const allCourses = await api.getCourses();
      const userCourses = allCourses.filter(c => c.creator_id === targetUserId);
      setCourses(userCourses);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!targetUserId) return;
    try {
      await api.updateProfile(targetUserId, { bio, username });
      toast.success('Profile updated');
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">User not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
      </Link>

      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                <Badge variant={profile.role === 'admin' ? 'destructive' : profile.role === 'creator' ? 'default' : 'secondary'} className="capitalize">
                  {profile.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                  {profile.role}
                </Badge>
              </div>
              <p className="text-gray-500 mb-4">Member since {new Date(profile.created_at || '').toLocaleDateString()}</p>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Username</Label>
                    <Input value={username} onChange={e => setUsername(e.target.value)} />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell us about yourself..." />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                    <Button variant="outline" onClick={() => { setIsEditing(false); setBio(profile.bio || ''); setUsername(profile.username); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700">{profile.bio || 'No bio yet.'}</p>
                  {(isOwnProfile || isAdminUser) && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="mt-4">
                      <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Created Courses</h2>
      {courses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <BookOpen className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No courses created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <Link key={course.id} to={`/courses/${course.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.description || 'No description'}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Puzzle, BookOpen, User, ArrowRight, Pencil, MousePointer, Lightbulb, ShieldCheck, Zap, Eye, Brain } from 'lucide-react';

function FadeInSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
}

export function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 opacity-5" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              Active learning, not passive watching
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              Learn by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                doing
              </span>
              {', not just watching'}
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
              Every lesson lets you predict, click, fill, or explore — before you get the explanation.
            </p>
            <p className="text-sm text-gray-500 italic mb-10">
              Built for creators who believe that active thinking beats passive listening.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                  Start Exploring
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button size="lg" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-8">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <FadeInSection>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
              <p className="text-gray-600">Three simple steps to transform learning</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { icon: Pencil, title: 'Create', desc: 'Build courses with sections, pages, and interactive blocks.', color: 'bg-indigo-100 text-indigo-600' },
                { icon: MousePointer, title: 'Engage', desc: 'Learners predict, quiz, fill blanks, or tap hotspots.', color: 'bg-emerald-100 text-emerald-600' },
                { icon: Lightbulb, title: 'Understand', desc: 'Immediate feedback explains why — not just what.', color: 'bg-amber-100 text-amber-600' },
              ].map((step, i) => (
                <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Core Principle */}
      <FadeInSection>
        <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
          <div className="container mx-auto px-4 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Show, then tell.</h2>
            <p className="text-xl leading-relaxed opacity-90">
              Most courses tell you the answer first. We flip it. You try, you guess, you commit — then you learn.
              That's how memory sticks.
            </p>
          </div>
        </section>
      </FadeInSection>

      {/* Design Choices - No Gamification */}
      <FadeInSection>
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-8 w-8 text-indigo-600" />
                  <h2 className="text-2xl font-bold">No leaderboards, no streaks, no pressure.</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  We intentionally avoid badges, points, and competition. Learning should feel like discovery, not a race.
                </p>
                <p className="text-gray-500">
                  Our only "gamification" is the joy of getting an answer right and understanding why.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Brain className="h-24 w-24 text-indigo-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Available Courses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Courses</h2>
            <p className="text-gray-600">Start learning from our community of creators</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-6">Be the first to create an interactive course!</p>
              {isAuthenticated && isCreatorOrAdmin(user?.role || 'learner') ? (
                <Link to="/my-courses">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Pencil className="h-4 w-4 mr-2" />
                    Create a Course
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button variant="outline">Sign up to create courses</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 shadow-md overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Puzzle className="h-12 w-12 text-indigo-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <User className="h-3.5 w-3.5" />
                        {course.creator_name}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description || 'No description available.'}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Helper function
function isCreatorOrAdmin(role: string): boolean {
  return role === 'creator' || role === 'admin';
}

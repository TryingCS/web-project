import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { isAdmin, isCreatorOrAdmin } from '@/lib/validation';
import { Puzzle, User, LogOut, Plus, BookOpen, Shield, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-indigo-600 hover:text-indigo-700 transition-colors">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Puzzle className="h-5 w-5" />
          </div>
          <span className="tracking-tight">CourseCraft</span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {isCreatorOrAdmin(user?.role || 'learner') && (
                <Link to="/my-courses">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50">
                    <Plus className="h-4 w-4 mr-1.5" />
                    My Courses
                  </Button>
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                  {user?.role === 'admin' && <Shield className="h-3.5 w-3.5 text-amber-500" />}
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full capitalize">
                          {user?.role}
                        </span>
                      </div>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="h-4 w-4" /> Profile
                        </button>
                      </Link>
                      {isCreatorOrAdmin(user?.role || 'learner') && (
                        <Link to="/my-courses" onClick={() => setDropdownOpen(false)}>
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <BookOpen className="h-4 w-4" /> My Courses
                          </button>
                        </Link>
                      )}
                      {isAdmin(user?.role || 'learner') && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Shield className="h-4 w-4" /> Admin Panel
                          </button>
                        </Link>
                      )}
                      <div className="border-t mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

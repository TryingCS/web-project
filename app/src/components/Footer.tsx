import { Puzzle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                <Puzzle className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg text-white">CourseCraft</span>
            </div>
            <p className="text-sm text-gray-400">
              Learn by doing. Create interactive courses that engage learners with predictions, quizzes, and hands-on exercises.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/" className="block hover:text-indigo-400 transition-colors">Home</Link>
              <Link to="/login" className="block hover:text-indigo-400 transition-colors">Login</Link>
              <Link to="/register" className="block hover:text-indigo-400 transition-colors">Register</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">About</h4>
            <p className="text-sm text-gray-400">
              Built with React, TypeScript, and Tailwind CSS. Designed for creators who believe active thinking beats passive listening.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
             CourseCraft. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}

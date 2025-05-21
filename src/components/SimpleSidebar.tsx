import { Button } from '@/components/ui/button';
import { Home, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SimpleSidebar() {
  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
          <span className="text-white font-bold">AM</span>
        </div>
        <span className="font-semibold">AM GRAPHICS</span>
      </div>

      {/* Navigation */}
      <div className="flex-1">
        <div className="space-y-1">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link to="/ai-assistant">
            <Button variant="secondary" className="w-full justify-start">
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 
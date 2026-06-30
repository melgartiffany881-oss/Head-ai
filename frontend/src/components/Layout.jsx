import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  MessageSquare, 
  ClipboardCheck, 
  Mail, 
  FileCheck, 
  FileSearch, 
  Zap,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jd-generator', label: 'JD Generator', icon: FileText },
  { id: 'boolean-search', label: 'Boolean Search', icon: Search },
  { id: 'interview-questions', label: 'Interview Questions', icon: MessageSquare },
  { id: 'scorecard-generator', label: 'Scorecard Generator', icon: ClipboardCheck },
  { id: 'outreach-email', label: 'Outreach Email', icon: Mail },
  { id: 'offer-letter', label: 'Offer Letter', icon: FileCheck },
  { id: 'resume-analyzer', label: 'Resume Analyzer', icon: FileSearch },
  { id: 'ats-optimizer', label: 'ATS Optimizer', icon: Zap },
];

export default function Layout({ activeTab, setActiveTab, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={cn("min-h-screen bg-background text-foreground flex", isDarkMode && "dark")}>
      {/* Sidebar */}
      <aside className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-4 flex items-center justify-between border-b border-border">
          {isSidebarOpen && <h1 className="text-xl font-bold text-primary">HireStack AI</h1>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-accent"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center p-3 mb-1 transition-colors hover:bg-accent group",
                activeTab === item.id ? "bg-primary/10 text-primary border-r-4 border-primary" : "text-muted-foreground"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-primary" : "group-hover:text-foreground"
              )} />
              {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center p-3 rounded-md hover:bg-accent transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span className="ml-3 font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              JD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

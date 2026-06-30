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
  Sun,
  LogOut,
  User,
  ShieldCheck,
  Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

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
  const { user, logout } = useAuth();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getPlanIcon = (plan) => {
    if (plan === 'Enterprise') return <ShieldCheck className="text-purple-500" size={16} />;
    if (plan === 'Pro') return <Shield className="text-primary" size={16} />;
    return null;
  };

  return (
    <div className={cn("min-h-screen bg-background text-foreground flex", isDarkMode && "dark")}>
      {/* Sidebar */}
      <aside className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-4 flex items-center justify-between border-b border-border">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Zap size={18} className="text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">HireStack</h1>
            </div>
          )}
          {!isSidebarOpen && (
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center mx-auto">
              <Zap size={18} className="text-primary-foreground" />
            </div>
          )}
          {isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-accent"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {!isSidebarOpen && (
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-full flex justify-center p-3 mb-4 hover:bg-accent"
             >
               <Menu size={20} />
             </button>
          )}
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

        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center p-3 rounded-md hover:bg-accent transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span className="ml-3 font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center p-3 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center px-8 justify-between shadow-sm">
          <h2 className="text-lg font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold">{user?.name}</span>
              <div className="flex items-center space-x-1">
                {getPlanIcon(user?.plan)}
                <span className={cn(
                  "text-[10px] font-bold px-1.5 rounded uppercase",
                  user?.plan === 'Enterprise' ? "bg-purple-100 text-purple-700" : 
                  user?.plan === 'Pro' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                )}>
                  {user?.plan}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center border border-border">
              <User size={20} className="text-muted-foreground" />
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

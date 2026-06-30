import React from 'react';
import { 
  FileText, 
  Search, 
  MessageSquare, 
  ClipboardCheck, 
  Mail, 
  FileCheck, 
  FileSearch, 
  Zap 
} from 'lucide-react';

const stats = [
  { label: 'Total Jobs', value: '12', change: '+2 this week' },
  { label: 'Interviews Scheduled', value: '48', change: '+12% from last month' },
  { label: 'Time Saved', value: '142h', change: 'Est. this year' },
  { label: 'Success Rate', value: '94%', change: 'Top 5% of users' },
];

const quickActions = [
  { id: 'jd-generator', label: 'Create Job Description', icon: FileText, color: 'bg-blue-500' },
  { id: 'boolean-search', label: 'Generate Boolean String', icon: Search, color: 'bg-purple-500' },
  { id: 'interview-questions', label: 'Prep Interview Questions', icon: MessageSquare, color: 'bg-green-500' },
  { id: 'resume-analyzer', label: 'Analyze Resume', icon: FileSearch, color: 'bg-orange-500' },
];

export default function Dashboard({ setActiveTab }) {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Recruiter!</h1>
          <p className="text-muted-foreground">Here's what's happening with your hiring pipeline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            <p className="text-xs text-green-500 mt-1 font-medium">{stat.change}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveTab(action.id)}
              className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow text-left group"
            >
              <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon size={20} />
              </div>
              <h3 className="font-semibold">{action.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">Get started in seconds</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mr-4 text-accent-foreground">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="font-medium">JD Generated for "Senior Frontend Engineer"</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <button className="text-primary text-sm font-medium hover:underline">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

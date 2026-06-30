import React from 'react';
import { 
  FileText, 
  Search, 
  MessageSquare, 
  ClipboardCheck, 
  Mail, 
  FileCheck, 
  FileSearch, 
  Zap,
  Shield,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

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

const plans = [
  { 
    name: 'Starter', 
    price: '$29', 
    features: ['10 roles / month', 'JD Generator', 'Outreach Emails', 'Boolean Search'],
    icon: Zap
  },
  { 
    name: 'Pro', 
    price: '$79', 
    features: ['Unlimited roles', 'Resume Analysis', 'Candidate Scorecards', 'ATS Optimization'],
    icon: Shield,
    highlight: true
  },
  { 
    name: 'Enterprise', 
    price: 'Custom', 
    features: ['Team seats', 'API Access', 'Custom Templates', 'SSO Support'],
    icon: ShieldCheck
  }
];

export default function Dashboard({ setActiveTab }) {
  const { user, updatePlan } = useAuth();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your hiring workflow and AI assistant tools.</p>
        </div>
        <div className="flex items-center space-x-2 bg-accent/50 px-4 py-2 rounded-full border border-border">
          <span className="text-sm font-medium">Current Plan:</span>
          <span className="text-sm font-bold text-primary">{user?.plan}</span>
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

      <div>
        <h2 className="text-xl font-semibold mb-4">Manage Your Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={cn(
                "bg-card p-8 rounded-xl border-2 flex flex-col h-full relative",
                plan.highlight ? "border-primary shadow-lg" : "border-border shadow-sm",
                user?.plan === plan.name && "bg-primary/5"
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Recommended
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  plan.name === 'Enterprise' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                )}>
                  <plan.icon size={20} />
                </div>
                {user?.plan === plan.name && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase">Active</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.name !== 'Enterprise' && <span className="ml-1 text-muted-foreground text-sm">/mo</span>}
              </div>
              
              <ul className="mt-6 space-y-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm">
                    <CheckCircle2 className="text-green-500 mr-2 shrink-0" size={14} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                disabled={user?.plan === plan.name}
                onClick={() => updatePlan(plan.name)}
                className={cn(
                  "mt-8 w-full py-2 rounded-lg font-bold transition-all",
                  user?.plan === plan.name 
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                      : "bg-accent text-accent-foreground hover:bg-accent/80"
                )}
              >
                {user?.plan === plan.name ? 'Current Plan' : 'Switch to ' + plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

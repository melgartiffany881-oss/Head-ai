import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Loader2 } from 'lucide-react';

export function Login({ onToggleAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="text-primary-foreground" size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">HireStack AI</h2>
          <p className="mt-2 text-muted-foreground text-sm">Sign in to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                className="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Sign in'}
          </button>
          
          <div className="text-center text-sm">
            <button 
              type="button"
              onClick={onToggleAuth}
              className="text-primary hover:underline font-medium"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Signup({ onToggleAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('Starter');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    signup(name, email, password, plan);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="text-primary-foreground" size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="mt-2 text-muted-foreground text-sm">Join HireStack AI today</p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                className="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                className="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="plan">Choose a Plan</label>
              <select
                id="plan"
                className="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary outline-none"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              >
                <option value="Starter">Starter ($29/mo)</option>
                <option value="Pro">Pro ($79/mo)</option>
                <option value="Enterprise">Enterprise (Custom)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Create account'}
          </button>
          
          <div className="text-center text-sm">
            <button 
              type="button"
              onClick={onToggleAuth}
              className="text-primary hover:underline font-medium"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

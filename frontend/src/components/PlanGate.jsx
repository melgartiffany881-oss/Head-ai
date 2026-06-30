import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowUpCircle } from 'lucide-react';

const PlanGate = ({ children }) => {
  const { user } = useAuth();

  if (!user) return null;

  const rolesLimit = user.rolesLimit || 0;
  const rolesUsed = user.rolesUsed || 0;
  const isOverLimit = rolesLimit > 0 && rolesUsed >= rolesLimit;

  if (isOverLimit) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm">
        <div className="bg-indigo-600/20 p-4 rounded-full mb-6">
          <Zap className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Usage Limit Reached</h2>
        <p className="text-slate-400 max-w-md mb-8">
          You have used {rolesUsed} of your {rolesLimit} monthly roles on the {user.plan} plan. 
          Upgrade to a higher tier to continue generating content.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="https://buy.stripe.com/4gMcN5eYa4Li3is4Xc28801" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <ArrowUpCircle className="w-5 h-5" />
            Upgrade to Pro
          </a>
          <button 
            onClick={() => window.location.reload()}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-8 rounded-xl transition-all"
          >
            Check Status
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default PlanGate;

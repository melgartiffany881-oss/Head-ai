import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ToolSection from './components/ToolSection';
import PlanGate from './components/PlanGate';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppContent() {
  const { incrementUsage } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTool = (id, props) => (
    <PlanGate>
      <ToolSection 
        {...props} 
        onGenerated={incrementUsage}
      />
    </PlanGate>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      
      case 'jd-generator':
        return renderTool('jd', {
          title: "Job Description Generator",
          description: "Generate a professional, polished job description in seconds.",
          endpoint: "generate-jd",
          fields: [
            { name: 'title', label: 'Role Title', placeholder: 'e.g. Senior Frontend Engineer', fullWidth: false },
            { name: 'seniority', placeholder: 'e.g. Senior, Mid, Lead', fullWidth: false },
            { name: 'industry', placeholder: 'e.g. FinTech, Healthcare, SaaS', fullWidth: false },
            { name: 'companyCulture', label: 'Company Culture', placeholder: 'e.g. Collaborative, Fast-paced, Remote-first', fullWidth: false },
            { name: 'keyResponsibilities', label: 'Key Responsibilities', placeholder: 'List main duties (comma separated)...', type: 'textarea', fullWidth: true },
            { name: 'requirements', placeholder: 'List key skills and qualifications (comma separated)...', type: 'textarea', fullWidth: true },
          ]
        });

      case 'boolean-search':
        return renderTool('boolean', {
          title: "Boolean Search Generator",
          description: "Create ready-to-use Boolean strings for LinkedIn, Indeed, and more.",
          endpoint: "generate-boolean-search",
          fields: [
            { name: 'role', label: 'Role Title', placeholder: 'e.g. Java Developer', fullWidth: false },
            { name: 'requiredSkills', label: 'Required Skills', placeholder: 'e.g. Spring Boot, AWS, Microservices', fullWidth: false },
            { name: 'location', placeholder: 'e.g. San Francisco or Remote', fullWidth: true },
          ]
        });

      case 'interview-questions':
        return renderTool('questions', {
          title: "Interview Question Generator",
          description: "Generate tailored technical and behavioral interview questions.",
          endpoint: "generate-questions",
          fields: [
            { name: 'role', label: 'Role Title', placeholder: 'e.g. Product Manager', fullWidth: false },
            { name: 'seniority', placeholder: 'e.g. Senior', fullWidth: false },
            { name: 'skills', placeholder: 'e.g. Agile, Roadmap, Stakeholder Management', fullWidth: true },
          ]
        });

      case 'scorecard-generator':
        return renderTool('scorecard', {
          title: "Scorecard Generator",
          description: "Create candidate evaluation scorecards based on role criteria.",
          endpoint: "generate-scorecard",
          fields: [
            { name: 'role', label: 'Role Title', placeholder: 'e.g. Sales Account Executive', fullWidth: false },
            { name: 'criteria', placeholder: 'e.g. Communication, Technical Skill, Cultural Fit', type: 'textarea', fullWidth: true },
          ]
        });

      case 'outreach-email':
        return renderTool('email', {
          title: "Outreach Email Generator",
          description: "Generate personalized outreach emails that get responses.",
          endpoint: "generate-email",
          fields: [
            { name: 'candidateName', placeholder: 'e.g. Jane Doe', fullWidth: false },
            { name: 'candidateRole', label: 'Candidate Role', placeholder: 'e.g. UX Designer', fullWidth: false },
            { name: 'companyName', placeholder: 'e.g. HireStack AI', fullWidth: false },
            { name: 'yourRole', label: 'Your Role', placeholder: 'e.g. Head of Talent', fullWidth: false },
            { name: 'keyPoints', label: 'Key Points/Personalization', placeholder: 'e.g. Loved your portfolio on Behance...', type: 'textarea', fullWidth: true },
          ]
        });

      case 'offer-letter':
        return renderTool('offer', {
          title: "Offer Letter Generator",
          description: "Generate professional offer letters with all the necessary details.",
          endpoint: "generate-offer-letter",
          fields: [
            { name: 'candidateName', placeholder: 'e.g. John Smith', fullWidth: false },
            { name: 'role', label: 'Role Title', placeholder: 'e.g. Backend Engineer', fullWidth: false },
            { name: 'companyName', label: 'Company Name', placeholder: 'e.g. HireStack AI', fullWidth: false },
            { name: 'salary', placeholder: 'e.g. $120,000', fullWidth: false },
            { name: 'startDate', placeholder: 'e.g. August 1st, 2026', fullWidth: false },
            { name: 'benefits', placeholder: 'e.g. 401k, Health, Unlimited PTO', type: 'textarea', fullWidth: true },
          ]
        });

      case 'resume-analyzer':
        return renderTool('resume', {
          title: "Resume Analyzer",
          description: "Analyze a resume and get instant feedback on fit and improvements.",
          endpoint: "analyze-resume",
          buttonText: "Analyze Resume",
          fields: [
            { name: 'role', label: 'Role Title', placeholder: 'e.g. Marketing Manager', fullWidth: true },
            { name: 'resumeText', placeholder: 'Paste the resume text here...', type: 'textarea', fullWidth: true },
          ]
        });

      case 'ats-optimizer':
        return renderTool('ats', {
          title: "ATS Optimizer",
          description: "Compare a JD with a resume and get optimization tips.",
          endpoint: "ats-optimize",
          buttonText: "Get Tips",
          fields: [
            { name: 'jdText', label: 'Job Description', placeholder: 'Paste the job description here...', type: 'textarea', fullWidth: true },
            { name: 'resumeText', placeholder: 'Paste the resume text here...', type: 'textarea', fullWidth: true },
          ]
        });

      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <AppContent />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

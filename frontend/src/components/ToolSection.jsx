import React, { useState } from 'react';
import axios from 'axios';
import { Copy, Loader2, Check } from 'lucide-react';

export default function ToolSection({ 
  title, 
  description, 
  endpoint, 
  fields, 
  buttonText = "Generate" 
}) {
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatResponse = (data) => {
    // Handle different response shapes from the backend
    if (typeof data === 'string') return data;

    // JD Generator: { jd: string }
    if (data.jd) return data.jd;

    // Offer Letter: { offerLetter: string }
    if (data.offerLetter) return data.offerLetter;

    // Boolean Search: { linkedin: string, indeed: string, general: string }
    if (data.linkedin && data.indeed) {
      return `🔍 LinkedIn Search:\n${data.linkedin}\n\n🔍 Indeed Search:\n${data.indeed}\n\n🔍 General Search:\n${data.general}`;
    }

    // Outreach Email: { subject: string, body: string }
    if (data.subject && data.body) {
      return `📧 Subject: ${data.subject}\n\n${data.body}`;
    }

    // Interview Questions: { technical: string[], behavioral: string[], situational: string[] }
    if (data.technical || data.behavioral || data.situational) {
      let qText = '';
      if (data.technical && data.technical.length > 0) {
        qText += `💻 Technical Questions:\n${data.technical.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
      }
      if (data.behavioral && data.behavioral.length > 0) {
        qText += `👥 Behavioral Questions:\n${data.behavioral.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
      }
      if (data.situational && data.situational.length > 0) {
        qText += `🎯 Situational Questions:\n${data.situational.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
      }
      return qText.trim();
    }

    // Scorecard: { scorecard: object[], scale: string, instructions: string }
    if (data.scorecard && Array.isArray(data.scorecard)) {
      let sText = `📊 Scorecard (${data.scale || '1-5'} scale)\n\nInstructions: ${data.instructions || ''}\n\n`;
      data.scorecard.forEach((item, i) => {
        sText += `${i + 1}. ${item.criteria || item.name} (${item.weight || 0}%)\n   ${item.description || item.desc || ''}\n`;
      });
      return sText.trim();
    }

    // Resume Analyzer: { summary: object, strengths: string[], improvements: string[], matchScore: number }
    if (data.matchScore !== undefined && data.strengths) {
      let rText = `📄 Resume Analysis\n\nMatch Score: ${data.matchScore}/100\n\n`;
      if (data.summary) {
        rText += `Summary:\n`;
        Object.entries(data.summary).forEach(([key, val]) => {
          if (val && !Array.isArray(val)) {
            rText += `  ${key.replace(/([A-Z])/g, ' $1')}: ${val}\n`;
          }
        });
        if (data.summary.skills && data.summary.skills.length > 0) {
          rText += `  Skills: ${data.summary.skills.join(', ')}\n`;
        }
      }
      if (data.strengths.length > 0) {
        rText += `\n✅ Strengths:\n${data.strengths.map(s => `  • ${s}`).join('\n')}\n`;
      }
      if (data.improvements.length > 0) {
        rText += `\n💡 Improvements:\n${data.improvements.map(s => `  • ${s}`).join('\n')}`;
      }
      return rText.trim();
    }

    // ATS Optimizer: { matchScore, missingKeywords, suggestions, optimizedSections }
    if (data.matchScore !== undefined && data.suggestions) {
      let aText = `⚡ ATS Optimization Report\n\nMatch Score: ${data.matchScore}/100\n\n`;
      if (data.missingKeywords && data.missingKeywords.length > 0) {
        aText += `Missing Keywords: ${data.missingKeywords.join(', ')}\n\n`;
      }
      if (data.suggestions.length > 0) {
        aText += `Suggestions:\n${data.suggestions.map(s => `  • ${s}`).join('\n')}\n`;
      }
      if (data.optimizedSections && Object.keys(data.optimizedSections).length > 0) {
        aText += `\nOptimization Tips:\n`;
        Object.values(data.optimizedSections).forEach(v => {
          if (typeof v === 'string') aText += `  • ${v}\n`;
        });
      }
      return aText.trim();
    }

    // Fallback: JSON pretty-print
    return JSON.stringify(data, null, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await axios.post(`http://localhost:3001/api/${endpoint}`, formData);
      setResult(formatResponse(response.data));
    } catch (err) {
      console.error(err);
      setError('Failed to generate. Please ensure the backend is running at localhost:3001.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = (data) => {
    if (typeof data === 'string') {
      return <div className="whitespace-pre-wrap">{data}</div>;
    }

    if (Array.isArray(data)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {data.map((item, i) => (
            <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
          ))}
        </ul>
      );
    }

    if (typeof data === 'object' && data !== null) {
      const entries = Object.entries(data);
      
      // If single key object with string value, just show the value
      if (entries.length === 1 && typeof entries[0][1] === 'string') {
        return <div className="whitespace-pre-wrap">{entries[0][1]}</div>;
      }

      return (
        <div className="space-y-6">
          {entries.map(([key, value]) => (
            <div key={key} className="border-b border-border last:border-0 pb-4 last:pb-0">
              <h5 className="font-bold text-sm uppercase tracking-wider text-primary mb-2">{key.replace(/([A-Z])/g, ' $1')}</h5>
              <div className="text-sm leading-relaxed">
                {Array.isArray(value) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          {Object.keys(value[0] || {}).map(h => (
                            <th key={h} className="p-2 border border-border capitalize">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {value.map((item, i) => (
                          <tr key={i}>
                            {Object.values(item).map((v, j) => (
                              <td key={j} className="p-2 border border-border">
                                {typeof v === 'object' ? JSON.stringify(v) : v}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : typeof value === 'object' ? (
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <div className="whitespace-pre-wrap">{value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const copyToClipboard = () => {
    const textToCopy = typeof result === 'string' 
      ? result 
      : typeof result === 'object' 
        ? Object.values(result).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('\n\n')
        : '';
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {field.label || field.name.replace(/([A-Z])/g, ' $1')}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    onChange={handleChange}
                    className="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                    placeholder={field.placeholder}
                    required
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    onChange={handleChange}
                    className="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary outline-none"
                    placeholder={field.placeholder}
                    required
                  />
                )}
              </div>
            ))}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            {buttonText}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-lg">Generated Result</h4>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-accent rounded-md transition-colors flex items-center text-sm font-medium"
            >
              {copied ? <Check size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            {renderResult(result)}
          </div>
        </div>
      )}
    </div>
  );
}

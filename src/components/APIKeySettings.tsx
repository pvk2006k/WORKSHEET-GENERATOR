import { useState, useEffect } from 'react';
import { Key, Save, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { initializeOpenAI, isAPIConfigured } from '../utils/openAIService';

interface APIKeySettingsProps {
  onKeySaved: () => void;
}

export default function APIKeySettings({ onKeySaved }: APIKeySettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const saved = localStorage.getItem('openai_api_key');
    if (saved) {
      setSavedKey(saved);
      setApiKey(saved);
      initializeOpenAI(saved);
      setIsConfigured(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    
    localStorage.setItem('openai_api_key', apiKey.trim());
    initializeOpenAI(apiKey.trim());
    setSavedKey(apiKey.trim());
    setIsConfigured(true);
    setIsSaved(true);
    onKeySaved();
    
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDelete = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setSavedKey('');
    setIsConfigured(false);
    onKeySaved();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">OpenAI API Key</h3>
          <p className="text-xs text-gray-500">Required for AI-powered worksheet generation</p>
        </div>
        {isConfigured && (
          <div className="ml-auto flex items-center gap-1 text-green-600 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            Connected
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-... (Enter your OpenAI API key)"
            className="w-full px-4 py-3 pr-20 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm font-mono"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded bg-gray-100"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaved ? 'Saved!' : 'Save Key'}
          </button>
          
          {savedKey && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Don't have an API key?{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-medium hover:text-blue-900"
            >
              Get one from OpenAI
            </a>
            . Your key is stored locally and never sent to any server except OpenAI.
          </p>
        </div>
      </div>
    </div>
  );
}

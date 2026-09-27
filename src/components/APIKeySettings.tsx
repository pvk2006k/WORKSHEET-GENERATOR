import { useState, useEffect } from 'react';
import { Key, Save, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { initializeOpenAI, isAPIConfigured as isOpenAIConfigured } from '../utils/openAIService';
import { initializeGroq, isGroqConfigured } from '../utils/groqService';

interface APIKeySettingsProps {
  onKeySaved: () => void;
}

export default function APIKeySettings({ onKeySaved }: APIKeySettingsProps) {
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'groq'>('groq');
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Load saved API keys from localStorage
    const savedOpenAI = localStorage.getItem('openai_api_key');
    const savedGroq = localStorage.getItem('groq_api_key');
    
    if (savedGroq) {
      setSelectedProvider('groq');
      setApiKey(savedGroq);
      setSavedKey(savedGroq);
      initializeGroq(savedGroq);
      setIsConfigured(true);
    } else if (savedOpenAI) {
      setSelectedProvider('openai');
      setApiKey(savedOpenAI);
      setSavedKey(savedOpenAI);
      initializeOpenAI(savedOpenAI);
      setIsConfigured(true);
    }
  }, []);

  const handleProviderChange = (provider: 'openai' | 'groq') => {
    setSelectedProvider(provider);
    const saved = localStorage.getItem(`${provider}_api_key`);
    if (saved) {
      setApiKey(saved);
      setSavedKey(saved);
      setIsConfigured(true);
    } else {
      setApiKey('');
      setSavedKey('');
      setIsConfigured(false);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) return;
    
    const storageKey = `${selectedProvider}_api_key`;
    localStorage.setItem(storageKey, apiKey.trim());
    
    if (selectedProvider === 'openai') {
      initializeOpenAI(apiKey.trim());
    } else {
      initializeGroq(apiKey.trim());
    }
    
    setSavedKey(apiKey.trim());
    setIsConfigured(true);
    setIsSaved(true);
    onKeySaved();
    
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDelete = () => {
    const storageKey = `${selectedProvider}_api_key`;
    localStorage.removeItem(storageKey);
    setApiKey('');
    setSavedKey('');
    setIsConfigured(false);
    onKeySaved();
  };

  const providerInfo = {
    openai: {
      name: 'OpenAI',
      placeholder: 'sk-... (Enter your OpenAI API key)',
      color: 'from-green-500 to-emerald-600',
      link: 'https://platform.openai.com/api-keys',
      description: 'GPT-4o-mini - High quality, paid API'
    },
    groq: {
      name: 'Groq',
      placeholder: 'gsk_... (Enter your Groq API key)',
      color: 'from-orange-500 to-red-500',
      link: 'https://console.groq.com/keys',
      description: 'Llama 3.3 - Fast & free tier available'
    }
  };

  const currentProvider = providerInfo[selectedProvider];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">AI API Key</h3>
          <p className="text-xs text-gray-500">Choose your AI provider for worksheet generation</p>
        </div>
        {isConfigured && (
          <div className="ml-auto flex items-center gap-1 text-green-600 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            Connected
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Provider Selection */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleProviderChange('groq')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
              selectedProvider === 'groq'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">⚡</span>
              <div className="text-left">
                <div className="font-semibold">Groq</div>
                <div className="text-xs opacity-75">Fast & Free</div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleProviderChange('openai')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
              selectedProvider === 'openai'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">🤖</span>
              <div className="text-left">
                <div className="font-semibold">OpenAI</div>
                <div className="text-xs opacity-75">Premium</div>
              </div>
            </div>
          </button>
        </div>

        {/* API Key Input */}
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={currentProvider.placeholder}
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

        {/* Provider Description */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
          <span className="font-medium">{currentProvider.name}:</span> {currentProvider.description}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${currentProvider.color} text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
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

        {/* Help Link */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Don't have an API key?{' '}
            <a 
              href={currentProvider.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-medium hover:text-blue-900"
            >
              Get one from {currentProvider.name}
            </a>
            . Your key is stored locally and never sent to any server except {currentProvider.name}.
          </p>
        </div>
      </div>
    </div>
  );
}

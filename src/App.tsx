import { useState, useRef } from 'react';
import { WorksheetData } from './types';
import { generateWorksheet } from './utils/aiGenerator';
import WorksheetForm from './components/WorksheetForm';
import WorksheetPreview from './components/WorksheetPreview';
import { FileText, Loader2, Sparkles } from 'lucide-react';

function App() {
  const [worksheet, setWorksheet] = useState<WorksheetData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studentName, setStudentName] = useState('');
  const worksheetRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (className: string, topic: string, numQuestions: number, name: string) => {
    setIsGenerating(true);
    setStudentName(name);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const data = generateWorksheet(className, topic, numQuestions);
    setWorksheet(data);
    setIsGenerating(false);
  };

  const handleReset = () => {
    setWorksheet(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">Kids Knowledge Nest</h1>
              <p className="text-xs text-gray-500">AI Worksheet Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">www.kidsknowledgenest.com</span>
            {worksheet && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                ← Create New Worksheet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!worksheet && !isGenerating && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                AI-Powered Worksheet Generator
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Create Beautiful Worksheets
              </h2>
              <p className="text-gray-600">
                Generate professionally designed practice worksheets for any class and topic. 
                Perfect for teachers, parents, and students!
              </p>
            </div>
            <WorksheetForm onGenerate={handleGenerate} />
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-purple-100 text-center">
                <div className="text-3xl mb-2">🎨</div>
                <h4 className="font-semibold text-gray-700 text-sm">Beautiful Design</h4>
                <p className="text-xs text-gray-500 mt-1">Professional layout with borders & watermarks</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-purple-100 text-center">
                <div className="text-3xl mb-2">🤖</div>
                <h4 className="font-semibold text-gray-700 text-sm">AI Generated</h4>
                <p className="text-xs text-gray-500 mt-1">Smart questions with detailed explanations</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-purple-100 text-center">
                <div className="text-3xl mb-2">📄</div>
                <h4 className="font-semibold text-gray-700 text-sm">Print Ready</h4>
                <p className="text-xs text-gray-500 mt-1">Download as PDF or print directly</p>
              </div>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
              <Loader2 className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mt-6">Generating Your Worksheet...</h3>
            <p className="text-gray-500 mt-2">AI is crafting questions just for you</p>
            <div className="flex gap-1 mt-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {worksheet && !isGenerating && (
          <WorksheetPreview 
            worksheet={worksheet} 
            studentName={studentName}
            worksheetRef={worksheetRef}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 border-t border-purple-100 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2024 Kids Knowledge Nest | www.kidsknowledgenest.com</p>
          <p className="mt-1">AI-Powered Educational Content Generator</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

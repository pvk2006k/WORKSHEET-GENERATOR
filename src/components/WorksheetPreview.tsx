import { WorksheetData } from '../types';
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface WorksheetPreviewProps {
  worksheet: WorksheetData;
  studentName: string;
  worksheetRef: React.RefObject<HTMLDivElement>;
}

export default function WorksheetPreview({ worksheet, studentName, worksheetRef }: WorksheetPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!worksheetRef.current) return;
    
    const pages = worksheetRef.current.querySelectorAll('.worksheet-page');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i] as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
    }
    
    pdf.save(`${worksheet.practiceSetId}.pdf`);
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print Worksheet
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Worksheet Content */}
      <div ref={worksheetRef} className="worksheet-container">
        {/* Page 1 - Cover/Header Page */}
        <WorksheetCoverPage worksheet={worksheet} studentName={studentName} />
        
        {/* Question Pages */}
        <WorksheetQuestionsPage worksheet={worksheet} />
        
        {/* Answer Key Page */}
        <WorksheetAnswerPage worksheet={worksheet} />
      </div>
    </div>
  );
}

function WorksheetCoverPage({ worksheet, studentName }: { worksheet: WorksheetData; studentName: string }) {
  return (
    <div className="worksheet-page">
      {/* Watermark */}
      <div className="watermark">www.kidsknowledgenest.com</div>
      
      {/* Decorative Border */}
      <div className="page-border">
        <div className="corner-decoration top-left"></div>
        <div className="corner-decoration top-right"></div>
        <div className="corner-decoration bottom-left"></div>
        <div className="corner-decoration bottom-right"></div>
        
        {/* Decorative top pattern */}
        <div className="page-top-decoration">
          <svg viewBox="0 0 800 40" className="w-full h-8 opacity-20">
            <path d="M0,20 Q100,0 200,20 Q300,40 400,20 Q500,0 600,20 Q700,40 800,20" fill="none" stroke="#7c3aed" strokeWidth="2"/>
            <circle cx="100" cy="10" r="3" fill="#7c3aed"/>
            <circle cx="300" cy="30" r="3" fill="#4f46e5"/>
            <circle cx="500" cy="10" r="3" fill="#7c3aed"/>
            <circle cx="700" cy="30" r="3" fill="#4f46e5"/>
          </svg>
        </div>
        
        {/* Header Section */}
        <div className="worksheet-header">
          <div className="header-logo">
            <div className="logo-icon">📚</div>
            <div>
              <h1 className="logo-text">Kids Knowledge Nest</h1>
              <p className="logo-subtitle">www.kidsknowledgenest.com</p>
            </div>
          </div>
          
          <div className="header-divider"></div>
          
          {/* Worksheet Title Banner */}
          <div className="worksheet-title-banner">
            <h2 className="worksheet-title-text">{worksheet.topic}</h2>
            <p className="worksheet-title-sub">Practice Worksheet</p>
          </div>
          
          <div className="header-info-grid">
            <div className="info-item">
              <span className="info-label">Student Name</span>
              <span className="info-value">{studentName || '________________'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Class</span>
              <span className="info-value">{worksheet.className}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Practice Set ID</span>
              <span className="info-value">{worksheet.practiceSetId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Subject</span>
              <span className="info-value">{worksheet.subject}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Marks</span>
              <span className="info-value">{worksheet.totalMarks}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Time Allowed</span>
              <span className="info-value">{worksheet.timeAllowed}</span>
            </div>
            <div className="info-item">
              <span className="info-label">No. of Questions</span>
              <span className="info-value">{worksheet.questions.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date</span>
              <span className="info-value">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions-section">
          <h3 className="instructions-title">📋 General Instructions</h3>
          <ol className="instructions-list">
            {worksheet.instructions.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ol>
        </div>

        {/* Questions Start */}
        <div className="questions-start">
          <div className="questions-start-badge">
            ✏️ QUESTIONS BEGIN BELOW ✏️
          </div>
        </div>
        
        {/* Bottom decoration */}
        <div className="page-bottom-decoration">
          <svg viewBox="0 0 800 30" className="w-full h-6 opacity-15">
            <path d="M0,15 Q200,0 400,15 Q600,30 800,15" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function WorksheetQuestionsPage({ worksheet }: { worksheet: WorksheetData }) {
  return (
    <div className="worksheet-page">
      <div className="watermark">www.kidsknowledgenest.com</div>
      
      <div className="page-border">
        <div className="corner-decoration top-left"></div>
        <div className="corner-decoration top-right"></div>
        <div className="corner-decoration bottom-left"></div>
        <div className="corner-decoration bottom-right"></div>
        
        {/* Page Header */}
        <div className="page-header">
          <span className="page-header-left">{worksheet.topic} - Practice Set</span>
          <span className="page-header-right">{worksheet.practiceSetId}</span>
        </div>

        {/* Section Divider */}
        <div className="section-divider">
          <div className="section-divider-line"></div>
          <span className="section-divider-text">Practice Questions</span>
          <div className="section-divider-line"></div>
        </div>

        {/* Questions */}
        <div className="questions-container">
          {worksheet.questions.map((q, idx) => (
            <div key={q.id} className="question-block">
              <div className="question-header">
                <span className="question-number">Q{idx + 1}.</span>
                <span className="question-marks">[{q.points} marks]</span>
              </div>
              <p className="question-text">{q.question}</p>
              
              {q.type === 'multiple-choice' && q.options && (
                <div className="options-grid">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="option-item">
                      <span className="option-letter">{String.fromCharCode(97 + optIdx)})</span>
                      <span className="option-text">{opt}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="answer-space">
                {q.type === 'fill-in-blank' && (
                  <div className="blank-line"></div>
                )}
                {q.type === 'short-answer' && (
                  <>
                    <div className="blank-line"></div>
                    <div className="blank-line"></div>
                    <div className="blank-line"></div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Page Footer */}
        <div className="page-footer">
          <span>*** End of Questions ***</span>
          <span>Good Luck! 🍀</span>
        </div>
      </div>
    </div>
  );
}

function WorksheetAnswerPage({ worksheet }: { worksheet: WorksheetData }) {
  return (
    <div className="worksheet-page answer-page">
      <div className="watermark">www.kidsknowledgenest.com</div>
      
      <div className="page-border">
        <div className="corner-decoration top-left"></div>
        <div className="corner-decoration top-right"></div>
        <div className="corner-decoration bottom-left"></div>
        <div className="corner-decoration bottom-right"></div>
        
        {/* Answer Page Header */}
        <div className="answer-page-header">
          <div className="answer-badge">📝 ANSWER KEY & EXPLANATIONS</div>
          <p className="answer-subtitle">{worksheet.title}</p>
          <p className="answer-id">{worksheet.practiceSetId}</p>
        </div>

        {/* Answers */}
        <div className="answers-container">
          {worksheet.questions.map((q, idx) => (
            <div key={q.id} className="answer-block">
              <div className="answer-header">
                <span className="answer-number">Q{idx + 1}.</span>
                <span className="answer-correct">✓ Correct Answer: <strong>{q.correctAnswer}</strong></span>
              </div>
              <div className="answer-explanation">
                <span className="explanation-label">💡 Explanation:</span>
                <p>{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="answer-page-footer">
          <div className="footer-divider"></div>
          <p className="footer-text">© Kids Knowledge Nest | www.kidsknowledgenest.com</p>
          <p className="footer-note">This worksheet is computer-generated. For educational purposes only.</p>
        </div>
      </div>
    </div>
  );
}

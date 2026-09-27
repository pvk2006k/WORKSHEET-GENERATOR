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
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Capture the entire worksheet as one tall image
    const canvas = await html2canvas(worksheetRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    const totalWidth = canvas.width;
    const totalHeight = canvas.height;
    
    // Calculate A4 page height in pixels
    const a4PageHeight = (297 / 210) * totalWidth;
    const numPages = Math.ceil(totalHeight / a4PageHeight);
    
    // Slice the canvas into A4-sized pages
    for (let i = 0; i < numPages; i++) {
      const startY = i * a4PageHeight;
      const sliceHeight = Math.min(a4PageHeight, totalHeight - startY);
      
      // Create a canvas for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = totalWidth;
      pageCanvas.height = a4PageHeight;
      const ctx = pageCanvas.getContext('2d');
      
      if (ctx) {
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, totalWidth, a4PageHeight);
        
        // Draw the slice from the original canvas
        ctx.drawImage(
          canvas,
          0, startY, totalWidth, sliceHeight,
          0, 0, totalWidth, sliceHeight
        );
        
        // Add header to this page
        ctx.fillStyle = '#f3e8ff';
        ctx.fillRect(0, 0, totalWidth, 40);
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('www.kidsknowledgenest.com', 30, 28);
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`${worksheet.practiceSetId} | Page ${i + 1}`, totalWidth - 400, 28);
        
        // Add footer to this page
        ctx.fillStyle = '#f3e8ff';
        ctx.fillRect(0, a4PageHeight - 40, totalWidth, 40);
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('© Kids Knowledge Nest', 30, a4PageHeight - 15);
        ctx.fillText(`Page ${i + 1}`, totalWidth - 200, a4PageHeight - 15);
        
        // Convert to image data
        const pageImgData = pageCanvas.toDataURL('image/png');
        
        // Add to PDF
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add image to fill the entire A4 page
        pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
    }
    
    pdf.save(`${worksheet.practiceSetId}.pdf`);
  };

  const handleDownloadImage = async () => {
    if (!worksheetRef.current) return;
    
    // Capture the entire worksheet as one tall image
    const canvas = await html2canvas(worksheetRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    const totalWidth = canvas.width;
    const totalHeight = canvas.height;
    
    // Calculate A4 page height
    const a4PageHeight = (297 / 210) * totalWidth;
    const numPages = Math.ceil(totalHeight / a4PageHeight);
    
    // Slice and download each page
    for (let i = 0; i < numPages; i++) {
      const startY = i * a4PageHeight;
      const sliceHeight = Math.min(a4PageHeight, totalHeight - startY);
      
      // Create a canvas for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = totalWidth;
      pageCanvas.height = a4PageHeight;
      const ctx = pageCanvas.getContext('2d');
      
      if (ctx) {
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, totalWidth, a4PageHeight);
        
        // Draw the slice from the original canvas
        ctx.drawImage(
          canvas,
          0, startY, totalWidth, sliceHeight,
          0, 0, totalWidth, sliceHeight
        );
        
        // Add header
        ctx.fillStyle = '#f3e8ff';
        ctx.fillRect(0, 0, totalWidth, 40);
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('www.kidsknowledgenest.com', 30, 28);
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`${worksheet.practiceSetId} | Page ${i + 1}`, totalWidth - 400, 28);
        
        // Add footer
        ctx.fillStyle = '#f3e8ff';
        ctx.fillRect(0, a4PageHeight - 40, totalWidth, 40);
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('© Kids Knowledge Nest', 30, a4PageHeight - 15);
        ctx.fillText(`Page ${i + 1}`, totalWidth - 200, a4PageHeight - 15);
        
        // Download this page
        const link = document.createElement('a');
        link.download = `${worksheet.practiceSetId}_page_${i + 1}.png`;
        link.href = pageCanvas.toDataURL('image/png');
        link.click();
        
        // Delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  // Group questions by type
  const trueFalseQuestions = worksheet.questions.filter(q => q.type === 'true-false');
  const mcqQuestions = worksheet.questions.filter(q => q.type === 'multiple-choice');
  const oneLinerQuestions = worksheet.questions.filter(q => q.type === 'one-liner');
  const matchingQuestions = worksheet.questions.filter(q => q.type === 'match');
  const fillBlanksQuestions = worksheet.questions.filter(q => q.type === 'fill-in-blank');

  let globalQuestionNumber = 1;

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all shadow-sm text-sm font-medium"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button
          onClick={handleDownloadImage}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-md text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Download Images
        </button>
      </div>

      {/* Worksheet Content - ONE CONTINUOUS FLOW */}
      <div ref={worksheetRef} className="worksheet-continuous">
        {/* Watermark */}
        <div className="watermark">www.kidsknowledgenest.com</div>
        
        {/* COVER SECTION */}
        <div className="worksheet-header">
          <div className="header-logo">
            <div className="logo-icon">📚</div>
            <div>
              <h1 className="logo-text">Kids Knowledge Nest</h1>
              <p className="logo-subtitle">www.kidsknowledgenest.com</p>
            </div>
          </div>
          
          <div className="header-divider"></div>
          
          <div className="worksheet-title-banner">
            <h2 className="worksheet-title-text">{worksheet.topic}</h2>
            <p className="worksheet-title-sub">Practice Worksheet</p>
          </div>
          
          <div className="header-info-grid">
            <div className="info-item">
              <span className="info-label">Student Name</span>
              <span className="info-value-blank">________________________</span>
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
              <span className="info-value-blank">________</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date</span>
              <span className="info-value-blank">____________</span>
            </div>
            <div className="info-item">
              <span className="info-label">Time Allowed</span>
              <span className="info-value">{worksheet.timeAllowed}</span>
            </div>
            <div className="info-item">
              <span className="info-label">No. of Questions</span>
              <span className="info-value">{worksheet.questions.length}</span>
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

        {/* QUESTIONS - CONTINUOUS FLOW */}
        <div className="questions-container">
          
          {/* Section A: True/False */}
          {trueFalseQuestions.length > 0 && (
            <div className="question-section">
              <div className="section-header">
                <span className="section-icon">✅</span>
                <h3 className="section-title">Section A: True or False</h3>
                <span className="section-count">({trueFalseQuestions.length} Questions)</span>
              </div>
              <p className="section-instruction">State whether the following statements are True or False.</p>
              {trueFalseQuestions.map((q) => {
                const qNum = globalQuestionNumber++;
                return (
                  <div key={q.id} className="question-block">
                    <div className="question-header">
                      <span className="question-number">Q{qNum}.</span>
                      <span className="question-marks">[{q.points} mark{q.points > 1 ? 's' : ''}]</span>
                    </div>
                    <p className="question-text">{q.question}</p>
                    <div className="true-false-options">
                      <div className="tf-option">
                        <div className="tf-circle"></div>
                        <span>True</span>
                      </div>
                      <div className="tf-option">
                        <div className="tf-circle"></div>
                        <span>False</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section B: MCQs */}
          {mcqQuestions.length > 0 && (
            <div className="question-section">
              <div className="section-header">
                <span className="section-icon">🔘</span>
                <h3 className="section-title">Section B: Multiple Choice Questions</h3>
                <span className="section-count">({mcqQuestions.length} Questions)</span>
              </div>
              <p className="section-instruction">Choose the correct option from the given choices.</p>
              {mcqQuestions.map((q) => {
                const qNum = globalQuestionNumber++;
                return (
                  <div key={q.id} className="question-block">
                    <div className="question-header">
                      <span className="question-number">Q{qNum}.</span>
                      <span className="question-marks">[{q.points} mark{q.points > 1 ? 's' : ''}]</span>
                    </div>
                    <p className="question-text">{q.question}</p>
                    {q.imageUrl && (
                      <div className="question-image">
                        <img src={q.imageUrl} alt={`Illustration for question ${qNum}`} className="max-w-full h-auto rounded-lg border border-gray-200" style={{ maxHeight: '180px', objectFit: 'contain' }} />
                      </div>
                    )}
                    {q.options && (
                      <div className="options-grid">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="option-item">
                            <span className="option-letter">{String.fromCharCode(97 + optIdx)})</span>
                            <span className="option-text">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Section C: Fill in the Blanks */}
          {fillBlanksQuestions.length > 0 && (
            <div className="question-section">
              <div className="section-header">
                <span className="section-icon">✍️</span>
                <h3 className="section-title">Section C: Fill in the Blanks</h3>
                <span className="section-count">({fillBlanksQuestions.length} Questions)</span>
              </div>
              <p className="section-instruction">Fill in the blanks with the correct answer.</p>
              {fillBlanksQuestions.map((q) => {
                const qNum = globalQuestionNumber++;
                return (
                  <div key={q.id} className="question-block">
                    <div className="question-header">
                      <span className="question-number">Q{qNum}.</span>
                      <span className="question-marks">[{q.points} mark{q.points > 1 ? 's' : ''}]</span>
                    </div>
                    <p className="question-text">{q.question}</p>
                    <div className="answer-space">
                      <div className="blank-line"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section D: One Liner */}
          {oneLinerQuestions.length > 0 && (
            <div className="question-section">
              <div className="section-header">
                <span className="section-icon">💬</span>
                <h3 className="section-title">Section D: One Word / One Line Answer</h3>
                <span className="section-count">({oneLinerQuestions.length} Questions)</span>
              </div>
              <p className="section-instruction">Answer the following questions in one word or one line.</p>
              {oneLinerQuestions.map((q) => {
                const qNum = globalQuestionNumber++;
                return (
                  <div key={q.id} className="question-block">
                    <div className="question-header">
                      <span className="question-number">Q{qNum}.</span>
                      <span className="question-marks">[{q.points} mark{q.points > 1 ? 's' : ''}]</span>
                    </div>
                    <p className="question-text">{q.question}</p>
                    {q.imageUrl && (
                      <div className="question-image">
                        <img src={q.imageUrl} alt={`Illustration for question ${qNum}`} className="max-w-full h-auto rounded-lg border border-gray-200" style={{ maxHeight: '180px', objectFit: 'contain' }} />
                      </div>
                    )}
                    <div className="answer-space">
                      <div className="blank-line"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section E: Matching */}
          {matchingQuestions.length > 0 && (
            <div className="question-section">
              <div className="section-header">
                <span className="section-icon">🔗</span>
                <h3 className="section-title">Section E: Match the Following</h3>
                <span className="section-count">({matchingQuestions.length} Questions)</span>
              </div>
              <p className="section-instruction">Match the items in Column A with the correct items in Column B.</p>
              {matchingQuestions.map((q) => {
                const qNum = globalQuestionNumber++;
                return (
                  <div key={q.id} className="question-block">
                    <div className="question-header">
                      <span className="question-number">Q{qNum}.</span>
                      <span className="question-marks">[{q.points} mark{q.points > 1 ? 's' : ''}]</span>
                    </div>
                    {q.question && <p className="question-text">{q.question}</p>}
                    <div className="matching-table">
                      <div className="matching-columns">
                        <div className="matching-column">
                          <div className="column-header">Column A</div>
                          {q.matchColumnA?.map((item, idx) => (
                            <div key={idx} className="matching-item">
                              <span className="matching-label">{idx + 1}.</span>
                              <span className="matching-text">{item}</span>
                            </div>
                          ))}
                        </div>
                        <div className="matching-column">
                          <div className="column-header">Column B</div>
                          {q.matchColumnB?.map((item, idx) => (
                            <div key={idx} className="matching-item">
                              <span className="matching-label">{String.fromCharCode(97 + idx)})</span>
                              <span className="matching-text">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="matching-answers">
                        <p className="answers-label">Answers:</p>
                        <div className="answers-grid">
                          {q.matchColumnA?.map((_, idx) => (
                            <div key={idx} className="answer-slot">
                              <span>{idx + 1} → </span>
                              <div className="answer-blank"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Page Footer for Questions */}
        <div className="page-footer">
          <span>*** End of Questions ***</span>
          <span>Good Luck! 🍀</span>
        </div>

        {/* ANSWER KEY SECTION */}
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
                <span className="answer-type-badge">{q.type.replace('-', ' ').toUpperCase()}</span>
                <span className="answer-correct">✓ Answer: <strong>{q.correctAnswer}</strong></span>
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

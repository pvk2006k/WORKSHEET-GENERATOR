// Sample JavaScript code to send worksheet JSON to ASPX backend
// This can be integrated into your frontend application

/**
 * Send worksheet data to ASPX backend for database storage
 * @param {Object} worksheetData - The worksheet data in JSON format
 * @param {string} backendUrl - The URL of the ASPX endpoint
 * @returns {Promise<Object>} - Response from the server
 */
async function sendWorksheetToDatabase(worksheetData, backendUrl = '/SaveWorksheet.aspx') {
    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(worksheetData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Worksheet saved successfully!', result);
            return {
                success: true,
                worksheetId: result.worksheetId,
                practiceSetCode: result.practiceSetCode,
                message: result.message
            };
        } else {
            console.error('Error saving worksheet:', result);
            return {
                success: false,
                message: result.message || 'Unknown error occurred'
            };
        }
    } catch (error) {
        console.error('Network error:', error);
        return {
            success: false,
            message: 'Network error: ' + error.message
        };
    }
}

/**
 * Example usage in your React component
 */
// In your WorksheetPreview.tsx component, you can add this function:

/*
const handleSaveToDatabase = async () => {
    // Convert worksheet data to JSON format
    const jsonData = {
        practiceSetCode: worksheet.practiceSetId,
        title: worksheet.title,
        className: worksheet.className,
        subject: worksheet.subject,
        topic: worksheet.topic,
        totalMarks: worksheet.totalMarks,
        timeAllowed: worksheet.timeAllowed,
        instructions: worksheet.instructions,
        createdAt: new Date().toISOString(),
        questions: worksheet.questions.map((q, index) => {
            const baseQuestion = {
                questionNumber: index + 1,
                questionType: q.type,
                questionText: q.question,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                marks: q.points,
                imageUrl: q.imageUrl || null
            };

            // Add type-specific fields
            switch (q.type) {
                case 'multiple-choice':
                    return {
                        ...baseQuestion,
                        options: q.options || []
                    };
                
                case 'true-false':
                    return {
                        ...baseQuestion,
                        options: ['True', 'False']
                    };
                
                case 'fill-in-blank':
                    return {
                        ...baseQuestion,
                        blankCount: (q.question.match(/_/g) || []).length || 1
                    };
                
                case 'one-liner':
                    return {
                        ...baseQuestion,
                        expectedAnswerLength: 'short'
                    };
                
                case 'match':
                    return {
                        ...baseQuestion,
                        columnA: q.matchColumnA || [],
                        columnB: q.matchColumnB || [],
                        correctMatches: q.correctAnswer
                    };
                
                default:
                    return baseQuestion;
            }
        })
    };

    // Show loading state
    setIsSaving(true);

    // Send to backend
    const result = await sendWorksheetToDatabase(jsonData, 'https://yourserver.com/SaveWorksheet.aspx');

    setIsSaving(false);

    if (result.success) {
        alert(`Worksheet saved successfully! ID: ${result.worksheetId}`);
    } else {
        alert(`Error saving worksheet: ${result.message}`);
    }
};
*/

/**
 * Sample JSON structure that will be sent to the backend
 */
const sampleJsonStructure = {
    "practiceSetCode": "PSET-CLASS5-ABC123",
    "title": "Mathematics - Addition Practice Worksheet",
    "className": "Class 5",
    "subject": "Mathematics",
    "topic": "Addition",
    "totalMarks": 20,
    "timeAllowed": "30 minutes",
    "instructions": [
        "Read each question carefully before answering.",
        "Write your answers neatly in the space provided.",
        "Each question carries equal marks as indicated.",
        "Attempt all questions.",
        "Check your answers before submitting."
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "questions": [
        {
            "questionNumber": 1,
            "questionType": "multiple-choice",
            "questionText": "What is 25 + 37?",
            "options": ["62", "52", "72", "42"],
            "correctAnswer": "62",
            "explanation": "25 + 37 = 62. Add the ones place first (5+7=12), carry over 1, then add tens (2+3+1=6).",
            "marks": 2,
            "imageUrl": null
        },
        {
            "questionNumber": 2,
            "questionType": "true-false",
            "questionText": "The sum of two even numbers is always even.",
            "options": ["True", "False"],
            "correctAnswer": "True",
            "explanation": "Even + Even = Even. For example: 2 + 4 = 6, which is even.",
            "marks": 2,
            "imageUrl": null
        },
        {
            "questionNumber": 3,
            "questionType": "fill-in-blank",
            "questionText": "15 + ___ = 40",
            "blankCount": 1,
            "correctAnswer": "25",
            "explanation": "40 - 15 = 25. To find the missing number, subtract 15 from 40.",
            "marks": 2,
            "imageUrl": null
        },
        {
            "questionNumber": 4,
            "questionType": "one-liner",
            "questionText": "What is the result of adding zero to any number?",
            "expectedAnswerLength": "short",
            "correctAnswer": "The same number",
            "explanation": "Adding zero to any number gives the same number. This is called the identity property of addition.",
            "marks": 2,
            "imageUrl": null
        },
        {
            "questionNumber": 5,
            "questionType": "match",
            "questionText": "Match the addition problems with their answers:",
            "columnA": ["10 + 5", "20 + 30", "15 + 15", "25 + 25"],
            "columnB": ["50", "30", "40", "15"],
            "correctMatches": "10+5→15, 20+30→50, 15+15→30, 25+25→50",
            "explanation": "Match each addition problem with its correct sum by calculating each one.",
            "marks": 4,
            "imageUrl": null
        }
    ]
};

/**
 * SQL Insert statements that correspond to the JSON structure
 */
const sqlExamples = {
    insertWorksheet: `
        INSERT INTO Worksheets (PracticeSetCode, Title, ClassName, Subject, Topic, TotalMarks, TimeAllowed, Instructions)
        VALUES ('PSET-CLASS5-ABC123', 'Mathematics - Addition Practice Worksheet', 'Class 5', 'Mathematics', 'Addition', 20, '30 minutes', 'Read each question...');
    `,
    
    insertQuestion: `
        INSERT INTO Questions (WorksheetID, QuestionNumber, QuestionType, QuestionText, CorrectAnswer, Explanation, Marks)
        VALUES (1, 1, 'multiple-choice', 'What is 25 + 37?', '62', '25 + 37 = 62...', 2);
    `,
    
    insertOptions: `
        INSERT INTO QuestionOptions (QuestionID, OptionText, OptionOrder, IsCorrect)
        VALUES 
        (1, '62', 1, 1),
        (1, '52', 2, 0),
        (1, '72', 3, 0),
        (1, '42', 4, 0);
    `,
    
    insertMatchingItems: `
        INSERT INTO MatchingItems (QuestionID, ColumnName, ItemText, ItemOrder)
        VALUES 
        (5, 'A', '10 + 5', 1),
        (5, 'A', '20 + 30', 2),
        (5, 'B', '50', 1),
        (5, 'B', '30', 2);
    `
};

/**
 * API Response examples
 */
const apiResponses = {
    success: {
        status: "success",
        message: "Worksheet saved successfully",
        worksheetId: 123,
        practiceSetCode: "PSET-CLASS5-ABC123"
    },
    
    error: {
        status: "error",
        message: "Invalid JSON format",
        details: "Missing required field: practiceSetCode"
    }
};

export { sendWorksheetToDatabase, sampleJsonStructure, sqlExamples, apiResponses };

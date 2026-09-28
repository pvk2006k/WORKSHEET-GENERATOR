# Backend Integration Guide - ASPX & SQL Server

## Overview

This guide explains how to integrate the worksheet generator with your ASPX backend and SQL Server database. The frontend now exports worksheet data as structured JSON that can be easily saved to your database.

## 📦 What's Included

### Frontend (Already Implemented)
- ✅ JSON export functionality
- ✅ Structured data format for all question types
- ✅ Download JSON file
- ✅ Copy to clipboard

### Backend Files (Provided)
1. **`database/SQL_Schema.sql`** - Complete database schema with tables, indexes, and stored procedures
2. **`backend/SaveWorksheet.aspx`** - ASPX page to receive JSON data
3. **`backend/SaveWorksheet.aspx.cs`** - C# code-behind with database logic
4. **`backend/web.config.sample`** - Sample web.config with connection string
5. **`backend/sample-api-integration.js`** - JavaScript examples for API calls

## 🗄️ Database Schema

### Tables Created

1. **Worksheets** - Main worksheet information
   - PracticeSetCode (unique identifier)
   - Title, ClassName, Subject, Topic
   - TotalMarks, TimeAllowed
   - Instructions, CreatedAt

2. **Questions** - All questions
   - QuestionType (multiple-choice, true-false, fill-in-blank, one-liner, match)
   - QuestionText, CorrectAnswer, Explanation
   - Marks, ImageUrl

3. **QuestionOptions** - For MCQs and True/False
   - OptionText, OptionOrder, IsCorrect

4. **MatchingItems** - For Match questions
   - ColumnName (A or B), ItemText, ItemOrder

5. **FillBlankDetails** - For Fill in the Blanks
   - BlankNumber, BlankPosition, CorrectAnswer

### Stored Procedures

- **`sp_InsertWorksheetFromJSON`** - Insert complete worksheet from JSON in one call
- **`sp_GetWorksheetDetails`** - Retrieve complete worksheet with all questions

## 🚀 Setup Instructions

### Step 1: Create Database

```sql
-- Run the SQL schema script
-- File: database/SQL_Schema.sql
```

### Step 2: Configure Connection String

Edit `backend/web.config.sample` and update:

```xml
<connectionStrings>
  <add name="WorksheetDB" 
       connectionString="Server=YOUR_SERVER;Database=YOUR_DB;User Id=YOUR_USER;Password=YOUR_PASS;" 
       providerName="System.Data.SqlClient" />
</connectionStrings>
```

Rename to `web.config` and deploy to your server.

### Step 3: Deploy ASPX Files

Copy these files to your ASP.NET application:
- `SaveWorksheet.aspx`
- `SaveWorksheet.aspx.cs`

### Step 4: Test the Endpoint

```bash
curl -X POST https://yourserver.com/SaveWorksheet.aspx \
  -H "Content-Type: application/json" \
  -d @sample_data.json
```

## 📤 JSON Structure

### Complete JSON Format

```json
{
  "practiceSetCode": "PSET-CLASS5-ABC123",
  "title": "Mathematics - Addition Practice Worksheet",
  "className": "Class 5",
  "subject": "Mathematics",
  "topic": "Addition",
  "totalMarks": 20,
  "timeAllowed": "30 minutes",
  "instructions": [
    "Read each question carefully",
    "Write your answers neatly"
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "questions": [
    {
      "questionNumber": 1,
      "questionType": "multiple-choice",
      "questionText": "What is 25 + 37?",
      "options": ["62", "52", "72", "42"],
      "correctAnswer": "62",
      "explanation": "25 + 37 = 62...",
      "marks": 2,
      "imageUrl": null
    },
    {
      "questionNumber": 2,
      "questionType": "true-false",
      "questionText": "The sum of two even numbers is always even.",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Even + Even = Even...",
      "marks": 2,
      "imageUrl": null
    },
    {
      "questionNumber": 3,
      "questionType": "fill-in-blank",
      "questionText": "15 + ___ = 40",
      "blankCount": 1,
      "correctAnswer": "25",
      "explanation": "40 - 15 = 25...",
      "marks": 2,
      "imageUrl": null
    },
    {
      "questionNumber": 4,
      "questionType": "one-liner",
      "questionText": "What is the result of adding zero to any number?",
      "expectedAnswerLength": "short",
      "correctAnswer": "The same number",
      "explanation": "Identity property...",
      "marks": 2,
      "imageUrl": null
    },
    {
      "questionNumber": 5,
      "questionType": "match",
      "questionText": "Match the addition problems with their answers:",
      "columnA": ["10 + 5", "20 + 30", "15 + 15"],
      "columnB": ["50", "30", "40"],
      "correctMatches": "10+5→15, 20+30→50, 15+15→30",
      "explanation": "Calculate each sum...",
      "marks": 4,
      "imageUrl": null
    }
  ]
}
```

### Question Type Specific Fields

#### Multiple Choice
```json
{
  "questionType": "multiple-choice",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A"
}
```

#### True/False
```json
{
  "questionType": "true-false",
  "options": ["True", "False"],
  "correctAnswer": "True"
}
```

#### Fill in the Blanks
```json
{
  "questionType": "fill-in-blank",
  "blankCount": 1,
  "correctAnswer": "25"
}
```

#### One Liner
```json
{
  "questionType": "one-liner",
  "expectedAnswerLength": "short",
  "correctAnswer": "The same number"
}
```

#### Matching
```json
{
  "questionType": "match",
  "columnA": ["Item 1", "Item 2", "Item 3"],
  "columnB": ["Match A", "Match B", "Match C"],
  "correctMatches": "Item 1→Match A, Item 2→Match B, Item 3→Match C"
}
```

## 💻 Frontend Integration

### Add Save to Database Button

In your `WorksheetPreview.tsx`, add this button:

```tsx
<button
  onClick={handleSaveToDatabase}
  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md text-sm font-medium"
>
  <Database className="w-4 h-4" />
  Save to Database
</button>
```

### Add Save Function

```tsx
const handleSaveToDatabase = async () => {
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

      switch (q.type) {
        case 'multiple-choice':
          return { ...baseQuestion, options: q.options || [] };
        case 'true-false':
          return { ...baseQuestion, options: ['True', 'False'] };
        case 'fill-in-blank':
          return { ...baseQuestion, blankCount: (q.question.match(/_/g) || []).length || 1 };
        case 'one-liner':
          return { ...baseQuestion, expectedAnswerLength: 'short' };
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

  try {
    const response = await fetch('https://yourserver.com/SaveWorksheet.aspx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData)
    });

    const result = await response.json();
    
    if (response.ok) {
      alert(`Worksheet saved! ID: ${result.worksheetId}`);
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    alert(`Network error: ${error.message}`);
  }
};
```

## 🔌 API Endpoints

### Save Worksheet

**Endpoint:** `POST /SaveWorksheet.aspx`

**Request:**
```json
{
  "practiceSetCode": "PSET-CLASS5-ABC123",
  "title": "...",
  "questions": [...]
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Worksheet saved successfully",
  "worksheetId": 123,
  "practiceSetCode": "PSET-CLASS5-ABC123"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Invalid JSON format",
  "details": "Missing required field: practiceSetCode"
}
```

### Retrieve Worksheet

**Endpoint:** `GET /GetWorksheet.aspx?code=PSET-CLASS5-ABC123`

**Response:**
```json
{
  "worksheet": {
    "worksheetId": 123,
    "practiceSetCode": "PSET-CLASS5-ABC123",
    "title": "...",
    "questions": [...]
  }
}
```

## 🧪 Testing

### Test with Sample Data

1. Generate a worksheet in the frontend
2. Click "Export JSON for DB"
3. Copy the JSON
4. Send to backend using curl or Postman:

```bash
curl -X POST https://yourserver.com/SaveWorksheet.aspx \
  -H "Content-Type: application/json" \
  -d '{"practiceSetCode":"TEST-001","title":"Test Worksheet",...}'
```

### Verify Database

```sql
-- Check if worksheet was saved
SELECT * FROM Worksheets WHERE PracticeSetCode = 'TEST-001';

-- Check questions
SELECT * FROM Questions WHERE WorksheetID = (SELECT WorksheetID FROM Worksheets WHERE PracticeSetCode = 'TEST-001');

-- Check options
SELECT * FROM QuestionOptions WHERE QuestionID IN (SELECT QuestionID FROM Questions WHERE WorksheetID = (SELECT WorksheetID FROM Worksheets WHERE PracticeSetCode = 'TEST-001'));
```

## 🔒 Security Considerations

1. **Validate Input** - Always validate JSON structure before processing
2. **SQL Injection** - Use parameterized queries (already implemented)
3. **Authentication** - Add authentication to protect the endpoint
4. **Rate Limiting** - Implement rate limiting to prevent abuse
5. **Input Sanitization** - Sanitize all user inputs before storing

## 📊 Database Queries

### Get All Worksheets
```sql
SELECT * FROM vw_WorksheetDetails ORDER BY CreatedAt DESC;
```

### Get Worksheet by Class
```sql
SELECT * FROM vw_WorksheetDetails WHERE ClassName = 'Class 5';
```

### Get Worksheet by Subject
```sql
SELECT * FROM vw_WorksheetDetails WHERE Subject = 'Mathematics';
```

### Count Questions by Type
```sql
SELECT QuestionType, COUNT(*) as Count
FROM Questions
WHERE WorksheetID = @WorksheetID
GROUP BY QuestionType;
```

## 🐛 Troubleshooting

### Issue: JSON not saving
- Check connection string in web.config
- Verify database tables exist
- Check SQL Server logs for errors

### Issue: Options not saving
- Ensure question type is 'multiple-choice' or 'true-false'
- Check if options array is not empty

### Issue: Matching items not saving
- Ensure question type is 'match'
- Check if columnA and columnB arrays are populated

### Issue: Large JSON fails
- Increase `maxRequestLength` in web.config
- Increase `maxAllowedContentLength` in web.config

## 📝 Notes

- All timestamps are in ISO 8601 format
- PracticeSetCode must be unique
- Questions are ordered by QuestionNumber
- Options are ordered by OptionOrder
- Matching items are separated by ColumnName (A or B)

## 🎯 Next Steps

1. Deploy SQL schema to your database
2. Configure connection string
3. Deploy ASPX files to your server
4. Test with sample data
5. Integrate save button in frontend
6. Add authentication if needed
7. Implement retrieval endpoints

## 📞 Support

For issues or questions:
- Check SQL Server logs
- Review ASPX error messages
- Verify JSON structure matches schema
- Test with sample data first

---

**Your worksheet data is now ready to be saved to SQL Server!** 🎉

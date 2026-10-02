# Backend Integration Guide - ASPX & SQL Server (Single Table Layout)

## Overview

This guide explains how to integrate the worksheet generator with your ASPX backend and SQL Server database using a **simplified single-table layout** for all question types.

## 🎯 Single Table Architecture

### Why Single Table?
- ✅ **Simpler** - Only 2 tables (Worksheets + Questions)
- ✅ **Easier to query** - All questions in one place
- ✅ **Flexible** - JSON columns handle type-specific data
- ✅ **Maintainable** - No complex joins needed
- ✅ **Scalable** - Easy to add new question types

## 🗄️ Database Schema (Simplified)

### Table 1: Worksheets
Stores main worksheet information:
```sql
- WorksheetID (Primary Key)
- PracticeSetCode (Unique)
- Title, ClassName, Subject, Topic
- TotalMarks, TimeAllowed
- Instructions (JSON array)
- CreatedAt, IsActive
```

### Table 2: Questions (SINGLE TABLE for ALL types)
Stores all question types with JSON for type-specific data:
```sql
- QuestionID (Primary Key)
- WorksheetID (Foreign Key)
- QuestionNumber
- QuestionType ('multiple-choice', 'true-false', 'fill-in-blank', 'one-liner', 'match')
- QuestionText
- CorrectAnswer
- Explanation
- Marks
- ImageUrl
- TypeSpecificData (JSON - stores type-specific fields)
```

## 📦 TypeSpecificData JSON Examples

### Multiple Choice
```json
{
  "options": ["62", "52", "72", "42"]
}
```

### True/False
```json
{
  "options": ["True", "False"]
}
```

### Fill in the Blank
```json
{
  "blankCount": 2,
  "blanks": ["25", "40"]
}
```

### One Liner
```json
{
  "expectedLength": "short"
}
```

### Matching
```json
{
  "columnA": ["10 + 5", "20 + 30", "15 + 15"],
  "columnB": ["50", "30", "15"],
  "correctMatches": "10+5→15, 20+30→50, 15+15→30"
}
```

## 🚀 Setup Instructions

### Step 1: Create Database
```sql
-- Run this script in SQL Server Management Studio
-- File: database/SQL_Schema.sql
```

This creates:
- 2 tables (Worksheets, Questions)
- Indexes for performance
- Stored procedures for CRUD operations
- Sample data for testing

### Step 2: Configure Connection String
Edit `backend/web.config.sample`:
```xml
<connectionStrings>
  <add name="WorksheetDB" 
       connectionString="Server=YOUR_SERVER;Database=YOUR_DB;User Id=YOUR_USER;Password=YOUR_PASS;" 
       providerName="System.Data.SqlClient" />
</connectionStrings>
```

Rename to `web.config` and deploy.

### Step 3: Deploy ASPX Files
Copy to your ASP.NET application:
- `SaveWorksheet.aspx`
- `SaveWorksheet.aspx.cs`

### Step 4: Test
```bash
curl -X POST https://yourserver.com/SaveWorksheet.aspx \
  -H "Content-Type: application/json" \
  -d @sample-worksheet-data.json
```

## 📤 Complete JSON Structure

```json
{
  "practiceSetCode": "PSET-CLASS5-MATH-001",
  "title": "Mathematics - Addition Practice",
  "className": "Class 5",
  "subject": "Mathematics",
  "topic": "Addition",
  "totalMarks": 20,
  "timeAllowed": "30 minutes",
  "instructions": [
    "Read each question carefully",
    "Write answers neatly",
    "Attempt all questions"
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
      "questionText": "Match the problems with answers:",
      "columnA": ["10 + 5", "20 + 30"],
      "columnB": ["50", "15"],
      "correctMatches": "10+5→15, 20+30→50",
      "explanation": "Calculate each sum...",
      "marks": 4,
      "imageUrl": null
    }
  ]
}
```

## 🔌 API Endpoints

### Save Worksheet
**POST** `/SaveWorksheet.aspx`

**Request:** JSON payload (see above)

**Response (Success):**
```json
{
  "status": "success",
  "message": "Worksheet saved successfully",
  "worksheetId": 123,
  "practiceSetCode": "PSET-CLASS5-MATH-001"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Invalid JSON format"
}
```

## 📊 Database Queries

### Get All Worksheets
```sql
SELECT * FROM vw_WorksheetDetails 
ORDER BY CreatedAt DESC;
```

### Get Worksheet with Questions
```sql
EXEC sp_GetWorksheetDetails 'PSET-CLASS5-MATH-001';
```

### Get Questions by Type
```sql
-- Get only MCQs
EXEC sp_GetQuestionsByType @WorksheetID = 1, @QuestionType = 'multiple-choice';

-- Get only True/False
EXEC sp_GetQuestionsByType @WorksheetID = 1, @QuestionType = 'true-false';
```

### Parse JSON to Get Options (MCQ)
```sql
SELECT 
    QuestionNumber,
    QuestionText,
    JSON_VALUE(TypeSpecificData, '$.options[0]') AS Option1,
    JSON_VALUE(TypeSpecificData, '$.options[1]') AS Option2,
    JSON_VALUE(TypeSpecificData, '$.options[2]') AS Option3,
    JSON_VALUE(TypeSpecificData, '$.options[3]') AS Option4,
    CorrectAnswer
FROM Questions
WHERE WorksheetID = 1 
  AND QuestionType = 'multiple-choice';
```

### Parse JSON to Get Matching Columns
```sql
SELECT 
    QuestionNumber,
    QuestionText,
    JSON_QUERY(TypeSpecificData, '$.columnA') AS ColumnA,
    JSON_QUERY(TypeSpecificData, '$.columnB') AS ColumnB,
    JSON_VALUE(TypeSpecificData, '$.correctMatches') AS CorrectMatches
FROM Questions
WHERE WorksheetID = 1 
  AND QuestionType = 'match';
```

### Count Questions by Type
```sql
SELECT 
    QuestionType,
    COUNT(*) AS Count
FROM Questions
WHERE WorksheetID = 1
GROUP BY QuestionType;
```

## 💻 Frontend Integration

### Add Save Button to WorksheetPreview.tsx

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

## 📁 Files Provided

### Database
- 📄 `database/SQL_Schema.sql` - Complete schema with 2 tables

### Backend
- 📄 `backend/SaveWorksheet.aspx` - ASPX endpoint
- 📄 `backend/SaveWorksheet.aspx.cs` - C# code (simplified for single table)
- 📄 `backend/web.config.sample` - Configuration
- 📄 `backend/sample-worksheet-data.json` - Sample JSON
- 📄 `backend/sample-api-integration.js` - JavaScript examples

### Documentation
- 📄 `backend/README.md` - This guide
- 📄 `JSON_EXPORT_GUIDE.md` - JSON export documentation

## 🔒 Security

- ✅ Parameterized SQL queries (no SQL injection)
- ✅ JSON validation
- ✅ Database transactions
- ✅ Error handling
- ⚠️ Add authentication before production
- ⚠️ Implement rate limiting
- ⚠️ Validate all inputs

## 🐛 Troubleshooting

### Issue: JSON not saving
- Check connection string
- Verify tables exist
- Check SQL Server logs

### Issue: TypeSpecificData is NULL
- Ensure question type is correct
- Check JSON structure matches expected format

### Issue: Large JSON fails
- Increase `maxRequestLength` in web.config
- Increase `maxAllowedContentLength`

## 📝 Comparison: Old vs New Schema

### Old Schema (Multiple Tables)
```
Worksheets
Questions
QuestionOptions      ← Separate table for MCQ options
MatchingItems        ← Separate table for matching
FillBlankDetails     ← Separate table for fill-in-blank
```
**Problems:**
- Complex joins needed
- Multiple INSERT statements
- Harder to maintain
- More storage overhead

### New Schema (Single Table)
```
Worksheets
Questions            ← All question types in one table
                     ← TypeSpecificData (JSON) stores type-specific fields
```
**Benefits:**
- Simple queries
- Single INSERT per question
- Easy to maintain
- Flexible for new question types

## 🎯 Key Advantages

1. **Simplicity** - Only 2 tables instead of 5
2. **Flexibility** - JSON columns handle any question type
3. **Performance** - Fewer joins, faster queries
4. **Maintainability** - Easier to understand and modify
5. **Scalability** - Easy to add new question types without schema changes

## 📞 Support

For issues:
- Check SQL Server logs
- Review ASPX error messages
- Verify JSON structure
- Test with sample data first

---

**Your worksheet data is now ready to be saved with a simplified single-table schema!** 🎉

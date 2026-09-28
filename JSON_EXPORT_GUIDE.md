# JSON Export & Database Integration - Complete Guide

## ✅ What's Been Added

### 1. Frontend JSON Export (Already Working!)
- ✅ **"Export JSON for DB"** button added to worksheet preview
- ✅ Downloads worksheet data as structured JSON file
- ✅ Automatically copies JSON to clipboard
- ✅ Includes all required fields for database storage

### 2. Backend Files (Ready to Deploy!)
- ✅ **SQL Schema** - Complete database structure with tables, indexes, stored procedures
- ✅ **ASPX Endpoint** - SaveWorksheet.aspx to receive and save JSON data
- ✅ **C# Code-Behind** - Complete database insertion logic
- ✅ **Web.config Sample** - Connection string configuration
- ✅ **Sample Integration** - JavaScript examples for API calls

## 📦 JSON Structure

### Main Worksheet Object
```json
{
  "practiceSetCode": "PSET-CLASS5-ABC123",
  "title": "Mathematics - Addition Practice Worksheet",
  "className": "Class 5",
  "subject": "Mathematics",
  "topic": "Addition",
  "totalMarks": 20,
  "timeAllowed": "30 minutes",
  "instructions": ["instruction 1", "instruction 2"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "questions": [...]
}
```

### Question Types

#### 1. Multiple Choice (MCQ)
```json
{
  "questionNumber": 1,
  "questionType": "multiple-choice",
  "questionText": "What is 25 + 37?",
  "options": ["62", "52", "72", "42"],
  "correctAnswer": "62",
  "explanation": "25 + 37 = 62...",
  "marks": 2,
  "imageUrl": null
}
```

#### 2. True/False
```json
{
  "questionNumber": 2,
  "questionType": "true-false",
  "questionText": "The sum of two even numbers is always even.",
  "options": ["True", "False"],
  "correctAnswer": "True",
  "explanation": "Even + Even = Even...",
  "marks": 2,
  "imageUrl": null
}
```

#### 3. Fill in the Blanks
```json
{
  "questionNumber": 3,
  "questionType": "fill-in-blank",
  "questionText": "15 + ___ = 40",
  "blankCount": 1,
  "correctAnswer": "25",
  "explanation": "40 - 15 = 25...",
  "marks": 2,
  "imageUrl": null
}
```

#### 4. One Liner
```json
{
  "questionNumber": 4,
  "questionType": "one-liner",
  "questionText": "What is the result of adding zero to any number?",
  "expectedAnswerLength": "short",
  "correctAnswer": "The same number",
  "explanation": "Identity property...",
  "marks": 2,
  "imageUrl": null
}
```

#### 5. Matching
```json
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
```

## 🗄️ Database Tables

### 1. Worksheets
Stores main worksheet information:
- PracticeSetCode (unique)
- Title, ClassName, Subject, Topic
- TotalMarks, TimeAllowed
- Instructions, CreatedAt

### 2. Questions
Stores all questions:
- QuestionNumber, QuestionType
- QuestionText, CorrectAnswer, Explanation
- Marks, ImageUrl

### 3. QuestionOptions
For MCQs and True/False:
- OptionText, OptionOrder, IsCorrect

### 4. MatchingItems
For Match questions:
- ColumnName (A or B), ItemText, ItemOrder

### 5. FillBlankDetails
For Fill in the Blanks:
- BlankNumber, BlankPosition, CorrectAnswer

## 🚀 How to Use

### Step 1: Generate Worksheet
1. Use the worksheet generator as normal
2. Click "Generate Worksheet with AI"
3. Review the generated worksheet

### Step 2: Export JSON
1. Click **"Export JSON for DB"** button
2. JSON file downloads automatically
3. JSON is also copied to clipboard
4. You'll see confirmation message

### Step 3: Send to Backend
**Option A: Manual (for testing)**
```bash
curl -X POST https://yourserver.com/SaveWorksheet.aspx \
  -H "Content-Type: application/json" \
  -d @PSET-CLASS5-ABC123_data.json
```

**Option B: Automatic (add button to frontend)**
```tsx
<button onClick={handleSaveToDatabase}>
  Save to Database
</button>
```

### Step 4: Verify in Database
```sql
SELECT * FROM Worksheets WHERE PracticeSetCode = 'PSET-CLASS5-ABC123';
SELECT * FROM Questions WHERE WorksheetID = 1;
SELECT * FROM QuestionOptions WHERE QuestionID = 1;
```

## 📁 Files Provided

### Frontend (Already Integrated)
- ✅ `src/components/WorksheetPreview.tsx` - JSON export functionality

### Backend (Ready to Deploy)
- 📄 `database/SQL_Schema.sql` - Complete database schema
- 📄 `backend/SaveWorksheet.aspx` - ASPX endpoint
- 📄 `backend/SaveWorksheet.aspx.cs` - C# code-behind
- 📄 `backend/web.config.sample` - Configuration sample
- 📄 `backend/sample-api-integration.js` - JavaScript examples
- 📄 `backend/README.md` - Complete integration guide

## 🔧 Deployment Steps

### 1. Setup Database
```sql
-- Run this script in SQL Server Management Studio
-- File: database/SQL_Schema.sql
```

### 2. Configure Connection String
Edit `backend/web.config.sample`:
```xml
<add name="WorksheetDB" 
     connectionString="Server=YOUR_SERVER;Database=YOUR_DB;User Id=YOUR_USER;Password=YOUR_PASS;" />
```

### 3. Deploy ASPX Files
Copy to your ASP.NET application:
- `SaveWorksheet.aspx`
- `SaveWorksheet.aspx.cs`
- `web.config` (renamed from sample)

### 4. Test
```bash
curl -X POST https://yourserver.com/SaveWorksheet.aspx \
  -H "Content-Type: application/json" \
  -d '{"practiceSetCode":"TEST-001",...}'
```

## 🎯 Key Features

### ✅ All Required Fields Included
- Practice Set Code
- Title, Class, Subject/Topic
- Question Type (all 5 types supported)
- Options (for MCQs and True/False)
- Answer & Explanation
- Marks for each question
- Image URLs (if any)
- Matching columns (Column A & B)
- Blank count (for fill-in-blanks)

### ✅ Database-Ready Structure
- Normalized tables
- Proper relationships
- Indexes for performance
- Stored procedures for easy insertion
- Views for easy retrieval

### ✅ Type-Specific Handling
- **MCQs**: Options array with correct answer flag
- **True/False**: Fixed options ["True", "False"]
- **Fill-in-Blank**: Blank count and positions
- **One-Liner**: Expected answer length
- **Matching**: Two columns with correct matches

### ✅ Error Handling
- JSON validation
- Database transaction support
- Proper error messages
- Success confirmation

## 📊 Sample Data Flow

```
Frontend (React)
    ↓
Generate Worksheet
    ↓
Click "Export JSON for DB"
    ↓
JSON Created:
{
  practiceSetCode: "PSET-001",
  title: "Math Practice",
  className: "Class 5",
  questions: [...]
}
    ↓
Send to Backend (POST /SaveWorksheet.aspx)
    ↓
ASPX Receives JSON
    ↓
Parse & Validate
    ↓
Insert into SQL Server:
- Worksheets table
- Questions table
- QuestionOptions table (if MCQ/T-F)
- MatchingItems table (if Match)
- FillBlankDetails table (if Fill-in-blank)
    ↓
Return Success Response
{
  status: "success",
  worksheetId: 123,
  practiceSetCode: "PSET-001"
}
```

## 🔍 Verification Queries

### Check Worksheet
```sql
SELECT * FROM Worksheets 
WHERE PracticeSetCode = 'PSET-CLASS5-ABC123';
```

### Check Questions
```sql
SELECT q.QuestionNumber, q.QuestionType, q.QuestionText
FROM Questions q
INNER JOIN Worksheets w ON q.WorksheetID = w.WorksheetID
WHERE w.PracticeSetCode = 'PSET-CLASS5-ABC123'
ORDER BY q.QuestionNumber;
```

### Check MCQ Options
```sql
SELECT q.QuestionNumber, o.OptionText, o.IsCorrect
FROM QuestionOptions o
INNER JOIN Questions q ON o.QuestionID = q.QuestionID
INNER JOIN Worksheets w ON q.WorksheetID = w.WorksheetID
WHERE w.PracticeSetCode = 'PSET-CLASS5-ABC123'
  AND q.QuestionType = 'multiple-choice'
ORDER BY q.QuestionNumber, o.OptionOrder;
```

### Check Matching Items
```sql
SELECT q.QuestionNumber, m.ColumnName, m.ItemText
FROM MatchingItems m
INNER JOIN Questions q ON m.QuestionID = q.QuestionID
INNER JOIN Worksheets w ON q.WorksheetID = w.WorksheetID
WHERE w.PracticeSetCode = 'PSET-CLASS5-ABC123'
  AND q.QuestionType = 'match'
ORDER BY q.QuestionNumber, m.ColumnName, m.ItemOrder;
```

## 🎨 API Response Examples

### Success Response
```json
{
  "status": "success",
  "message": "Worksheet saved successfully",
  "worksheetId": 123,
  "practiceSetCode": "PSET-CLASS5-ABC123"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Invalid JSON format",
  "details": "Missing required field: practiceSetCode"
}
```

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- PracticeSetCode must be unique across all worksheets
- Questions are automatically numbered
- Options are ordered (1, 2, 3, 4 for MCQs)
- Matching items are separated by column (A or B)
- All text fields support Unicode
- Image URLs are optional (can be null)

## 🔒 Security

- ✅ Parameterized SQL queries (no SQL injection)
- ✅ JSON validation before processing
- ✅ Database transactions (atomic operations)
- ✅ Error handling with proper messages
- ⚠️ Add authentication before production use
- ⚠️ Implement rate limiting
- ⚠️ Validate all inputs

## 🎉 Summary

Your worksheet generator now has:
1. ✅ Beautiful PDF/Image download (working perfectly)
2. ✅ JSON export for database (new!)
3. ✅ Complete backend integration (ready to deploy)
4. ✅ SQL Server schema (normalized & optimized)
5. ✅ ASPX endpoint (C# code-behind)
6. ✅ All question types supported
7. ✅ Full documentation

**Everything is ready to save worksheets to your SQL Server database!** 🚀

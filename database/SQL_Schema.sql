-- =============================================
-- SQL Server Database Schema
-- Single Table Layout for All Question Types
-- =============================================

-- Drop existing tables if they exist (for clean re-run)
IF OBJECT_ID('dbo.Questions', 'U') IS NOT NULL DROP TABLE dbo.Questions;
IF OBJECT_ID('dbo.Worksheets', 'U') IS NOT NULL DROP TABLE dbo.Worksheets;
GO

-- =============================================
-- Table 1: Worksheets (Main worksheet information)
-- =============================================
CREATE TABLE Worksheets (
    WorksheetID INT IDENTITY(1,1) PRIMARY KEY,
    PracticeSetCode NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    ClassName NVARCHAR(20) NOT NULL,
    Subject NVARCHAR(100) NOT NULL,
    Topic NVARCHAR(200) NOT NULL,
    TotalMarks INT NOT NULL,
    TimeAllowed NVARCHAR(50) NOT NULL,
    Instructions NVARCHAR(MAX), -- Store as JSON array
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- =============================================
-- Table 2: Questions (SINGLE TABLE for ALL question types)
-- Uses JSON columns for type-specific data
-- =============================================
CREATE TABLE Questions (
    QuestionID INT IDENTITY(1,1) PRIMARY KEY,
    WorksheetID INT NOT NULL,
    QuestionNumber INT NOT NULL,
    
    -- Common fields for all question types
    QuestionType NVARCHAR(50) NOT NULL, 
    -- Values: 'multiple-choice', 'true-false', 'fill-in-blank', 'one-liner', 'match'
    
    QuestionText NVARCHAR(MAX) NOT NULL,
    CorrectAnswer NVARCHAR(MAX) NOT NULL,
    Explanation NVARCHAR(MAX),
    Marks INT NOT NULL DEFAULT 1,
    ImageUrl NVARCHAR(MAX) NULL,
    
    -- JSON column for type-specific data
    -- Stores different data based on QuestionType:
    -- 
    -- For 'multiple-choice':
    --   {"options": ["Option A", "Option B", "Option C", "Option D"]}
    --
    -- For 'true-false':
    --   {"options": ["True", "False"]}
    --
    -- For 'fill-in-blank':
    --   {"blankCount": 2, "blanks": ["answer1", "answer2"]}
    --
    -- For 'one-liner':
    --   {"expectedLength": "short"}
    --
    -- For 'match':
    --   {"columnA": ["Item 1", "Item 2"], "columnB": ["Match A", "Match B"], "correctMatches": "1-A, 2-B"}
    --
    TypeSpecificData NVARCHAR(MAX) NULL,
    
    -- Foreign key constraint
    CONSTRAINT FK_Questions_Worksheets 
        FOREIGN KEY (WorksheetID) REFERENCES Worksheets(WorksheetID) 
        ON DELETE CASCADE
);
GO

-- =============================================
-- Indexes for better performance
-- =============================================
CREATE INDEX IX_Worksheets_PracticeSetCode ON Worksheets(PracticeSetCode);
CREATE INDEX IX_Worksheets_ClassName ON Worksheets(ClassName);
CREATE INDEX IX_Worksheets_Subject ON Worksheets(Subject);
CREATE INDEX IX_Worksheets_Topic ON Worksheets(Topic);
CREATE INDEX IX_Worksheets_CreatedAt ON Worksheets(CreatedAt DESC);

CREATE INDEX IX_Questions_WorksheetID ON Questions(WorksheetID);
CREATE INDEX IX_Questions_QuestionType ON Questions(QuestionType);
CREATE INDEX IX_Questions_QuestionNumber ON Questions(QuestionNumber);
GO

-- =============================================
-- View: Complete worksheet details
-- =============================================
CREATE VIEW vw_WorksheetDetails AS
SELECT 
    w.WorksheetID,
    w.PracticeSetCode,
    w.Title,
    w.ClassName,
    w.Subject,
    w.Topic,
    w.TotalMarks,
    w.TimeAllowed,
    w.CreatedAt,
    w.IsActive,
    COUNT(q.QuestionID) AS TotalQuestions,
    SUM(CASE WHEN q.QuestionType = 'multiple-choice' THEN 1 ELSE 0 END) AS MCQCount,
    SUM(CASE WHEN q.QuestionType = 'true-false' THEN 1 ELSE 0 END) AS TrueFalseCount,
    SUM(CASE WHEN q.QuestionType = 'fill-in-blank' THEN 1 ELSE 0 END) AS FillBlankCount,
    SUM(CASE WHEN q.QuestionType = 'one-liner' THEN 1 ELSE 0 END) AS OneLinerCount,
    SUM(CASE WHEN q.QuestionType = 'match' THEN 1 ELSE 0 END) AS MatchCount
FROM Worksheets w
LEFT JOIN Questions q ON w.WorksheetID = q.WorksheetID
GROUP BY 
    w.WorksheetID, w.PracticeSetCode, w.Title, w.ClassName, 
    w.Subject, w.Topic, w.TotalMarks, w.TimeAllowed, w.CreatedAt, w.IsActive;
GO

-- =============================================
-- Stored Procedure: Insert Complete Worksheet from JSON
-- =============================================
CREATE PROCEDURE sp_InsertWorksheetFromJSON
    @JSONData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @WorksheetID INT;
        
        -- Step 1: Insert worksheet
        INSERT INTO Worksheets (
            PracticeSetCode, Title, ClassName, Subject, Topic, 
            TotalMarks, TimeAllowed, Instructions, CreatedAt
        )
        SELECT 
            practiceSetCode,
            title,
            className,
            subject,
            topic,
            totalMarks,
            timeAllowed,
            instructions, -- Store as JSON string
            GETDATE()
        FROM OPENJSON(@JSONData)
        WITH (
            practiceSetCode NVARCHAR(50) '$.practiceSetCode',
            title NVARCHAR(200) '$.title',
            className NVARCHAR(20) '$.className',
            subject NVARCHAR(100) '$.subject',
            topic NVARCHAR(200) '$.topic',
            totalMarks INT '$.totalMarks',
            timeAllowed NVARCHAR(50) '$.timeAllowed',
            instructions NVARCHAR(MAX) '$.instructions' AS JSON
        );
        
        SET @WorksheetID = SCOPE_IDENTITY();
        
        -- Step 2: Insert all questions (SINGLE INSERT for all types)
        INSERT INTO Questions (
            WorksheetID, QuestionNumber, QuestionType, QuestionText,
            CorrectAnswer, Explanation, Marks, ImageUrl, TypeSpecificData
        )
        SELECT 
            @WorksheetID,
            questionNumber,
            questionType,
            questionText,
            correctAnswer,
            explanation,
            marks,
            imageUrl,
            -- Build TypeSpecificData JSON based on question type
            CASE 
                WHEN questionType = 'multiple-choice' THEN
                    (SELECT options FROM OPENJSON(@JSONData, '$.questions') 
                     WITH (questionNumber INT '$.questionNumber', options NVARCHAR(MAX) '$.options' AS JSON) AS jq
                     WHERE jq.questionNumber = q.questionNumber
                     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
                
                WHEN questionType = 'true-false' THEN
                    N'{"options": ["True", "False"]}'
                
                WHEN questionType = 'fill-in-blank' THEN
                    (SELECT blankCount FROM OPENJSON(@JSONData, '$.questions')
                     WITH (questionNumber INT '$.questionNumber', blankCount INT '$.blankCount') AS jq
                     WHERE jq.questionNumber = q.questionNumber
                     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
                
                WHEN questionType = 'one-liner' THEN
                    (SELECT expectedAnswerLength FROM OPENJSON(@JSONData, '$.questions')
                     WITH (questionNumber INT '$.questionNumber', expectedAnswerLength NVARCHAR(50) '$.expectedAnswerLength') AS jq
                     WHERE jq.questionNumber = q.questionNumber
                     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
                
                WHEN questionType = 'match' THEN
                    (SELECT columnA, columnB, correctMatches 
                     FROM OPENJSON(@JSONData, '$.questions')
                     WITH (
                         questionNumber INT '$.questionNumber',
                         columnA NVARCHAR(MAX) '$.columnA' AS JSON,
                         columnB NVARCHAR(MAX) '$.columnB' AS JSON,
                         correctMatches NVARCHAR(MAX) '$.correctMatches'
                     ) AS jq
                     WHERE jq.questionNumber = q.questionNumber
                     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
                
                ELSE NULL
            END AS TypeSpecificData
        FROM OPENJSON(@JSONData, '$.questions')
        WITH (
            questionNumber INT '$.questionNumber',
            questionType NVARCHAR(50) '$.questionType',
            questionText NVARCHAR(MAX) '$.questionText',
            correctAnswer NVARCHAR(MAX) '$.correctAnswer',
            explanation NVARCHAR(MAX) '$.explanation',
            marks INT '$.marks',
            imageUrl NVARCHAR(MAX) '$.imageUrl'
        ) AS q;
        
        COMMIT TRANSACTION;
        
        SELECT 
            @WorksheetID AS WorksheetID, 
            'Success' AS Status,
            'Worksheet saved successfully' AS Message;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SELECT 
            0 AS WorksheetID,
            'Error' AS Status,
            ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO

-- =============================================
-- Stored Procedure: Get Complete Worksheet with Questions
-- =============================================
CREATE PROCEDURE sp_GetWorksheetDetails
    @PracticeSetCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get worksheet info
    SELECT 
        WorksheetID,
        PracticeSetCode,
        Title,
        ClassName,
        Subject,
        Topic,
        TotalMarks,
        TimeAllowed,
        Instructions,
        CreatedAt,
        IsActive
    FROM Worksheets
    WHERE PracticeSetCode = @PracticeSetCode;
    
    -- Get all questions (single query for all types)
    SELECT 
        QuestionID,
        QuestionNumber,
        QuestionType,
        QuestionText,
        CorrectAnswer,
        Explanation,
        Marks,
        ImageUrl,
        TypeSpecificData
    FROM Questions
    WHERE WorksheetID = (
        SELECT WorksheetID FROM Worksheets WHERE PracticeSetCode = @PracticeSetCode
    )
    ORDER BY QuestionNumber;
END;
GO

-- =============================================
-- Stored Procedure: Get Questions by Type
-- =============================================
CREATE PROCEDURE sp_GetQuestionsByType
    @WorksheetID INT,
    @QuestionType NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        QuestionID,
        QuestionNumber,
        QuestionType,
        QuestionText,
        CorrectAnswer,
        Explanation,
        Marks,
        ImageUrl,
        TypeSpecificData
    FROM Questions
    WHERE WorksheetID = @WorksheetID 
      AND QuestionType = @QuestionType
    ORDER BY QuestionNumber;
END;
GO

-- =============================================
-- Stored Procedure: Delete Worksheet (Cascade deletes questions)
-- =============================================
CREATE PROCEDURE sp_DeleteWorksheet
    @PracticeSetCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM Worksheets 
    WHERE PracticeSetCode = @PracticeSetCode;
    
    SELECT 
        CASE 
            WHEN @@ROWCOUNT > 0 THEN 'Success'
            ELSE 'NotFound'
        END AS Status,
        'Worksheet deleted successfully' AS Message;
END;
GO

-- =============================================
-- Stored Procedure: List All Worksheets
-- =============================================
CREATE PROCEDURE sp_ListAllWorksheets
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM vw_WorksheetDetails
    ORDER BY CreatedAt DESC;
END;
GO

-- =============================================
-- Stored Procedure: Update Worksheet
-- =============================================
CREATE PROCEDURE sp_UpdateWorksheet
    @PracticeSetCode NVARCHAR(50),
    @Title NVARCHAR(200),
    @ClassName NVARCHAR(20),
    @Subject NVARCHAR(100),
    @Topic NVARCHAR(200),
    @TotalMarks INT,
    @TimeAllowed NVARCHAR(50),
    @Instructions NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Worksheets
    SET 
        Title = @Title,
        ClassName = @ClassName,
        Subject = @Subject,
        Topic = @Topic,
        TotalMarks = @TotalMarks,
        TimeAllowed = @TimeAllowed,
        Instructions = @Instructions
    WHERE PracticeSetCode = @PracticeSetCode;
    
    SELECT 
        CASE 
            WHEN @@ROWCOUNT > 0 THEN 'Success'
            ELSE 'NotFound'
        END AS Status;
END;
GO

-- =============================================
-- SAMPLE DATA INSERTION (For Testing)
-- =============================================

-- Insert sample worksheet
INSERT INTO Worksheets (PracticeSetCode, Title, ClassName, Subject, Topic, TotalMarks, TimeAllowed, Instructions)
VALUES (
    'SAMPLE-001',
    'Mathematics - Addition Practice',
    'Class 5',
    'Mathematics',
    'Addition',
    20,
    '30 minutes',
    '["Read each question carefully","Write answers neatly","Attempt all questions"]'
);
GO

-- Insert sample questions of different types
DECLARE @SampleWorksheetID INT = (SELECT WorksheetID FROM Worksheets WHERE PracticeSetCode = 'SAMPLE-001');

-- 1. Multiple Choice Question
INSERT INTO Questions (WorksheetID, QuestionNumber, QuestionType, QuestionText, CorrectAnswer, Explanation, Marks, TypeSpecificData)
VALUES (
    @SampleWorksheetID, 1, 'multiple-choice',
    'What is 25 + 37?',
    '62',
    '25 + 37 = 62. Add ones (5+7=12), carry 1, add tens (2+3+1=6).',
    2,
    '{"options": ["62", "52", "72", "42"]}'
);

-- 2. True/False Question
INSERT INTO Questions (WorksheetID, QuestionNumber, QuestionType, QuestionText, CorrectAnswer, Explanation, Marks, TypeSpecificData)
VALUES (
    @SampleWorksheetID, 2, 'true-false',
    'The sum of two even numbers is always even.',
    'True',
    'Even + Even = Even. Example: 2 + 4 = 6.',
    2,
    '{"options": ["True", "False"]}'
);

-- 3. Fill in the Blank Question
INSERT INTO Questions (WorksheetID, QuestionNumber, QuestionType, QuestionText, CorrectAnswer, Explanation, Marks, TypeSpecificData)
VALUES (
    @SampleWorksheetID, 3, 'fill-in-blank',
    '15 + ___ = 40',
    '25',
    '40 - 15 = 25. Subtract to find missing number.',
    2,
    '{"blankCount": 1, "blanks": ["25"]}'
);

-- 4. One Liner Question
INSERT INTO Questions (WorksheetID, QuestionNumber, QuestionType, QuestionText, CorrectAnswer, Explanation, Marks, TypeSpecificData)
VALUES (
    @SampleWorksheetID, 4, 'one-liner',
    'What do we call the result of addition?',
    'Sum',
    'The result of adding numbers is called the sum.',
    2,
    '{"expectedLength": "short"}'
);

-- 5. Matching Question
INSERT INTO Questions (WorksheetID, QuestionNumber, QuestionType, QuestionText, CorrectAnswer, Explanation, Marks, TypeSpecificData)
VALUES (
    @SampleWorksheetID, 5, 'match',
    'Match the addition problems with their answers:',
    '10+5=15, 20+30=50, 15+15=30',
    'Calculate each sum to match correctly.',
    4,
    '{"columnA": ["10 + 5", "20 + 30", "15 + 15"], "columnB": ["50", "30", "15"], "correctMatches": "10+5→15, 20+30→50, 15+15→30"}'
);
GO

-- =============================================
-- SAMPLE QUERIES (For Testing)
-- =============================================

-- Query 1: Get all worksheets
-- SELECT * FROM vw_WorksheetDetails;

-- Query 2: Get specific worksheet with questions
-- EXEC sp_GetWorksheetDetails 'SAMPLE-001';

-- Query 3: Get only MCQ questions
-- EXEC sp_GetQuestionsByType @SampleWorksheetID, 'multiple-choice';

-- Query 4: Get only True/False questions
-- EXEC sp_GetQuestionsByType @SampleWorksheetID, 'true-false';

-- Query 5: Parse JSON to get options for MCQ
-- SELECT 
--     QuestionNumber,
--     QuestionText,
--     JSON_VALUE(TypeSpecificData, '$.options[0]') AS Option1,
--     JSON_VALUE(TypeSpecificData, '$.options[1]') AS Option2,
--     JSON_VALUE(TypeSpecificData, '$.options[2]') AS Option3,
--     JSON_VALUE(TypeSpecificData, '$.options[3]') AS Option4,
--     CorrectAnswer
-- FROM Questions
-- WHERE WorksheetID = @SampleWorksheetID 
--   AND QuestionType = 'multiple-choice';

-- Query 6: Parse JSON to get matching columns
-- SELECT 
--     QuestionNumber,
--     QuestionText,
--     TypeSpecificData,
--     JSON_QUERY(TypeSpecificData, '$.columnA') AS ColumnA,
--     JSON_QUERY(TypeSpecificData, '$.columnB') AS ColumnB
-- FROM Questions
-- WHERE WorksheetID = @SampleWorksheetID 
--   AND QuestionType = 'match';

PRINT 'Database schema created successfully!';
PRINT 'Tables: Worksheets, Questions';
PRINT 'Sample data inserted with PracticeSetCode: SAMPLE-001';
GO

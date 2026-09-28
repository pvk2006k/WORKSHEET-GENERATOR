-- SQL Database Schema for Worksheet Storage
-- Run this script to create the necessary tables

-- Main Worksheet Table
CREATE TABLE Worksheets (
    WorksheetID INT IDENTITY(1,1) PRIMARY KEY,
    PracticeSetCode NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    ClassName NVARCHAR(20) NOT NULL,
    Subject NVARCHAR(100) NOT NULL,
    Topic NVARCHAR(200) NOT NULL,
    TotalMarks INT NOT NULL,
    TimeAllowed NVARCHAR(50) NOT NULL,
    Instructions NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- Questions Table
CREATE TABLE Questions (
    QuestionID INT IDENTITY(1,1) PRIMARY KEY,
    WorksheetID INT NOT NULL,
    QuestionNumber INT NOT NULL,
    QuestionType NVARCHAR(50) NOT NULL, -- 'multiple-choice', 'true-false', 'fill-in-blank', 'one-liner', 'match'
    QuestionText NVARCHAR(MAX) NOT NULL,
    CorrectAnswer NVARCHAR(MAX) NOT NULL,
    Explanation NVARCHAR(MAX),
    Marks INT NOT NULL DEFAULT 1,
    ImageUrl NVARCHAR(500) NULL,
    FOREIGN KEY (WorksheetID) REFERENCES Worksheets(WorksheetID) ON DELETE CASCADE
);

-- Options Table (for MCQs and True/False)
CREATE TABLE QuestionOptions (
    OptionID INT IDENTITY(1,1) PRIMARY KEY,
    QuestionID INT NOT NULL,
    OptionText NVARCHAR(MAX) NOT NULL,
    OptionOrder INT NOT NULL, -- 1, 2, 3, 4 for MCQs; 1=True, 2=False for T/F
    IsCorrect BIT DEFAULT 0,
    FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID) ON DELETE CASCADE
);

-- Matching Columns Table (for Match questions)
CREATE TABLE MatchingItems (
    MatchingItemID INT IDENTITY(1,1) PRIMARY KEY,
    QuestionID INT NOT NULL,
    ColumnName NVARCHAR(10) NOT NULL, -- 'A' or 'B'
    ItemText NVARCHAR(MAX) NOT NULL,
    ItemOrder INT NOT NULL,
    CorrectMatch NVARCHAR(MAX) NULL, -- For Column A, stores the matching item from Column B
    FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID) ON DELETE CASCADE
);

-- Fill in the Blanks Details
CREATE TABLE FillBlankDetails (
    FillBlankID INT IDENTITY(1,1) PRIMARY KEY,
    QuestionID INT NOT NULL,
    BlankNumber INT NOT NULL,
    BlankPosition INT NOT NULL, -- Character position in question text
    CorrectAnswer NVARCHAR(MAX) NOT NULL,
    FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IX_Worksheets_PracticeSetCode ON Worksheets(PracticeSetCode);
CREATE INDEX IX_Worksheets_ClassName ON Worksheets(ClassName);
CREATE INDEX IX_Worksheets_Subject ON Worksheets(Subject);
CREATE INDEX IX_Questions_WorksheetID ON Questions(WorksheetID);
CREATE INDEX IX_QuestionOptions_QuestionID ON QuestionOptions(QuestionID);
CREATE INDEX IX_MatchingItems_QuestionID ON MatchingItems(QuestionID);

-- Sample View to get complete worksheet with questions
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
    COUNT(q.QuestionID) AS TotalQuestions
FROM Worksheets w
LEFT JOIN Questions q ON w.WorksheetID = q.WorksheetID
GROUP BY 
    w.WorksheetID,
    w.PracticeSetCode,
    w.Title,
    w.ClassName,
    w.Subject,
    w.Topic,
    w.TotalMarks,
    w.TimeAllowed,
    w.CreatedAt;

-- Stored Procedure to Insert Complete Worksheet from JSON
CREATE PROCEDURE sp_InsertWorksheetFromJSON
    @JSONData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Parse JSON and insert worksheet
        DECLARE @WorksheetID INT;
        
        INSERT INTO Worksheets (
            PracticeSetCode,
            Title,
            ClassName,
            Subject,
            Topic,
            TotalMarks,
            TimeAllowed,
            Instructions,
            CreatedAt
        )
        SELECT 
            practiceSetCode,
            title,
            className,
            subject,
            topic,
            totalMarks,
            timeAllowed,
            (SELECT STRING_AGG(value, '|') FROM OPENJSON(instructions)),
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
        
        -- Insert questions
        INSERT INTO Questions (
            WorksheetID,
            QuestionNumber,
            QuestionType,
            QuestionText,
            CorrectAnswer,
            Explanation,
            Marks,
            ImageUrl
        )
        SELECT 
            @WorksheetID,
            questionNumber,
            questionType,
            questionText,
            correctAnswer,
            explanation,
            marks,
            imageUrl
        FROM OPENJSON(@JSONData, '$.questions')
        WITH (
            questionNumber INT '$.questionNumber',
            questionType NVARCHAR(50) '$.questionType',
            questionText NVARCHAR(MAX) '$.questionText',
            correctAnswer NVARCHAR(MAX) '$.correctAnswer',
            explanation NVARCHAR(MAX) '$.explanation',
            marks INT '$.marks',
            imageUrl NVARCHAR(500) '$.imageUrl'
        );
        
        -- Insert MCQ options
        INSERT INTO QuestionOptions (QuestionID, OptionText, OptionOrder, IsCorrect)
        SELECT 
            q.QuestionID,
            opt.value,
            opt.[key] + 1,
            CASE WHEN opt.value = q.CorrectAnswer THEN 1 ELSE 0 END
        FROM Questions q
        CROSS APPLY OPENJSON(@JSONData, '$.questions')
        WITH (
            questionNumber INT '$.questionNumber',
            questionType NVARCHAR(50) '$.questionType',
            options NVARCHAR(MAX) '$.options' AS JSON
        ) AS jq
        CROSS APPLY OPENJSON(jq.options) AS opt
        WHERE q.WorksheetID = @WorksheetID 
          AND q.QuestionNumber = jq.questionNumber
          AND jq.questionType IN ('multiple-choice', 'true-false');
        
        -- Insert matching items
        INSERT INTO MatchingItems (QuestionID, ColumnName, ItemText, ItemOrder)
        SELECT 
            q.QuestionID,
            'A',
            colA.value,
            colA.[key] + 1
        FROM Questions q
        CROSS APPLY OPENJSON(@JSONData, '$.questions')
        WITH (
            questionNumber INT '$.questionNumber',
            questionType NVARCHAR(50) '$.questionType',
            columnA NVARCHAR(MAX) '$.columnA' AS JSON
        ) AS jq
        CROSS APPLY OPENJSON(jq.columnA) AS colA
        WHERE q.WorksheetID = @WorksheetID 
          AND q.QuestionNumber = jq.questionNumber
          AND jq.questionType = 'match';
        
        INSERT INTO MatchingItems (QuestionID, ColumnName, ItemText, ItemOrder)
        SELECT 
            q.QuestionID,
            'B',
            colB.value,
            colB.[key] + 1
        FROM Questions q
        CROSS APPLY OPENJSON(@JSONData, '$.questions')
        WITH (
            questionNumber INT '$.questionNumber',
            questionType NVARCHAR(50) '$.questionType',
            columnB NVARCHAR(MAX) '$.columnB' AS JSON
        ) AS jq
        CROSS APPLY OPENJSON(jq.columnB) AS colB
        WHERE q.WorksheetID = @WorksheetID 
          AND q.QuestionNumber = jq.questionNumber
          AND jq.questionType = 'match';
        
        COMMIT TRANSACTION;
        
        SELECT @WorksheetID AS WorksheetID, 'Success' AS Status;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_MESSAGE() AS ErrorMessage,
            'Error' AS Status;
    END CATCH
END;

-- Sample query to retrieve complete worksheet with all questions and options
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
        CreatedAt
    FROM Worksheets
    WHERE PracticeSetCode = @PracticeSetCode;
    
    -- Get questions
    SELECT 
        QuestionID,
        QuestionNumber,
        QuestionType,
        QuestionText,
        CorrectAnswer,
        Explanation,
        Marks,
        ImageUrl
    FROM Questions
    WHERE WorksheetID = (SELECT WorksheetID FROM Worksheets WHERE PracticeSetCode = @PracticeSetCode)
    ORDER BY QuestionNumber;
    
    -- Get options for each question
    SELECT 
        q.QuestionNumber,
        qo.OptionID,
        qo.OptionText,
        qo.OptionOrder,
        qo.IsCorrect
    FROM QuestionOptions qo
    INNER JOIN Questions q ON qo.QuestionID = q.QuestionID
    WHERE q.WorksheetID = (SELECT WorksheetID FROM Worksheets WHERE PracticeSetCode = @PracticeSetCode)
    ORDER BY q.QuestionNumber, qo.OptionOrder;
    
    -- Get matching items
    SELECT 
        q.QuestionNumber,
        mi.ColumnName,
        mi.ItemText,
        mi.ItemOrder,
        mi.CorrectMatch
    FROM MatchingItems mi
    INNER JOIN Questions q ON mi.QuestionID = q.QuestionID
    WHERE q.WorksheetID = (SELECT WorksheetID FROM Worksheets WHERE PracticeSetCode = @PracticeSetCode)
    ORDER BY q.QuestionNumber, mi.ColumnName, mi.ItemOrder;
END;

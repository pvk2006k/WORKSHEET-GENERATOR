using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;

public partial class SaveWorksheet : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        // Only accept POST requests
        if (Request.HttpMethod != "POST")
        {
            Response.StatusCode = 405;
            Response.Write("{\"status\": \"error\", \"message\": \"Method not allowed\"}");
            return;
        }

        try
        {
            // Read JSON from request body
            string jsonData;
            using (StreamReader reader = new StreamReader(Request.InputStream))
            {
                jsonData = reader.ReadToEnd();
            }

            if (string.IsNullOrEmpty(jsonData))
            {
                Response.StatusCode = 400;
                Response.Write("{\"status\": \"error\", \"message\": \"No data received\"}");
                return;
            }

            // Parse JSON
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = int.MaxValue;
            WorksheetData worksheetData = serializer.Deserialize<WorksheetData>(jsonData);

            if (worksheetData == null)
            {
                Response.StatusCode = 400;
                Response.Write("{\"status\": \"error\", \"message\": \"Invalid JSON format\"}");
                return;
            }

            // Save to database
            int worksheetId = SaveWorksheetToDatabase(worksheetData);

            // Return success response
            Response.ContentType = "application/json";
            Response.Write(serializer.Serialize(new
            {
                status = "success",
                message = "Worksheet saved successfully",
                worksheetId = worksheetId,
                practiceSetCode = worksheetData.PracticeSetCode
            }));
        }
        catch (Exception ex)
        {
            Response.StatusCode = 500;
            Response.ContentType = "application/json";
            Response.Write(new JavaScriptSerializer().Serialize(new
            {
                status = "error",
                message = ex.Message,
                stackTrace = ex.StackTrace
            }));
        }
    }

    private int SaveWorksheetToDatabase(WorksheetData data)
    {
        string connectionString = ConfigurationManager.ConnectionStrings["WorksheetDB"].ConnectionString;
        
        using (SqlConnection conn = new SqlConnection(connectionString))
        {
            conn.Open();
            
            using (SqlTransaction transaction = conn.BeginTransaction())
            {
                try
                {
                    // Insert worksheet
                    int worksheetId = InsertWorksheet(conn, transaction, data);
                    
                    // Insert questions
                    foreach (var question in data.Questions)
                    {
                        int questionId = InsertQuestion(conn, transaction, worksheetId, question);
                        
                        // Insert type-specific data
                        if (question.QuestionType == "multiple-choice" || question.QuestionType == "true-false")
                        {
                            InsertOptions(conn, transaction, questionId, question);
                        }
                        else if (question.QuestionType == "match")
                        {
                            InsertMatchingItems(conn, transaction, questionId, question);
                        }
                        else if (question.QuestionType == "fill-in-blank")
                        {
                            InsertFillBlankDetails(conn, transaction, questionId, question);
                        }
                    }
                    
                    transaction.Commit();
                    return worksheetId;
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            }
        }
    }

    private int InsertWorksheet(SqlConnection conn, SqlTransaction transaction, WorksheetData data)
    {
        string query = @"
            INSERT INTO Worksheets (
                PracticeSetCode, Title, ClassName, Subject, Topic, 
                TotalMarks, TimeAllowed, Instructions, CreatedAt
            )
            VALUES (
                @PracticeSetCode, @Title, @ClassName, @Subject, @Topic,
                @TotalMarks, @TimeAllowed, @Instructions, GETDATE()
            );
            SELECT SCOPE_IDENTITY();";

        using (SqlCommand cmd = new SqlCommand(query, conn, transaction))
        {
            cmd.Parameters.AddWithValue("@PracticeSetCode", data.PracticeSetCode);
            cmd.Parameters.AddWithValue("@Title", data.Title);
            cmd.Parameters.AddWithValue("@ClassName", data.ClassName);
            cmd.Parameters.AddWithValue("@Subject", data.Subject);
            cmd.Parameters.AddWithValue("@Topic", data.Topic);
            cmd.Parameters.AddWithValue("@TotalMarks", data.TotalMarks);
            cmd.Parameters.AddWithValue("@TimeAllowed", data.TimeAllowed);
            cmd.Parameters.AddWithValue("@Instructions", string.Join("|", data.Instructions));
            
            return Convert.ToInt32(cmd.ExecuteScalar());
        }
    }

    private int InsertQuestion(SqlConnection conn, SqlTransaction transaction, int worksheetId, QuestionData question)
    {
        string query = @"
            INSERT INTO Questions (
                WorksheetID, QuestionNumber, QuestionType, QuestionText,
                CorrectAnswer, Explanation, Marks, ImageUrl
            )
            VALUES (
                @WorksheetID, @QuestionNumber, @QuestionType, @QuestionText,
                @CorrectAnswer, @Explanation, @Marks, @ImageUrl
            );
            SELECT SCOPE_IDENTITY();";

        using (SqlCommand cmd = new SqlCommand(query, conn, transaction))
        {
            cmd.Parameters.AddWithValue("@WorksheetID", worksheetId);
            cmd.Parameters.AddWithValue("@QuestionNumber", question.QuestionNumber);
            cmd.Parameters.AddWithValue("@QuestionType", question.QuestionType);
            cmd.Parameters.AddWithValue("@QuestionText", question.QuestionText);
            cmd.Parameters.AddWithValue("@CorrectAnswer", question.CorrectAnswer);
            cmd.Parameters.AddWithValue("@Explanation", (object)question.Explanation ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Marks", question.Marks);
            cmd.Parameters.AddWithValue("@ImageUrl", (object)question.ImageUrl ?? DBNull.Value);
            
            return Convert.ToInt32(cmd.ExecuteScalar());
        }
    }

    private void InsertOptions(SqlConnection conn, SqlTransaction transaction, int questionId, QuestionData question)
    {
        if (question.Options == null || question.Options.Count == 0)
            return;

        string query = @"
            INSERT INTO QuestionOptions (QuestionID, OptionText, OptionOrder, IsCorrect)
            VALUES (@QuestionID, @OptionText, @OptionOrder, @IsCorrect);";

        using (SqlCommand cmd = new SqlCommand(query, conn, transaction))
        {
            for (int i = 0; i < question.Options.Count; i++)
            {
                cmd.Parameters.Clear();
                cmd.Parameters.AddWithValue("@QuestionID", questionId);
                cmd.Parameters.AddWithValue("@OptionText", question.Options[i]);
                cmd.Parameters.AddWithValue("@OptionOrder", i + 1);
                cmd.Parameters.AddWithValue("@IsCorrect", question.Options[i] == question.CorrectAnswer);
                cmd.ExecuteNonQuery();
            }
        }
    }

    private void InsertMatchingItems(SqlConnection conn, SqlTransaction transaction, int questionId, QuestionData question)
    {
        string query = @"
            INSERT INTO MatchingItems (QuestionID, ColumnName, ItemText, ItemOrder, CorrectMatch)
            VALUES (@QuestionID, @ColumnName, @ItemText, @ItemOrder, @CorrectMatch);";

        using (SqlCommand cmd = new SqlCommand(query, conn, transaction))
        {
            // Insert Column A items
            if (question.ColumnA != null)
            {
                for (int i = 0; i < question.ColumnA.Count; i++)
                {
                    cmd.Parameters.Clear();
                    cmd.Parameters.AddWithValue("@QuestionID", questionId);
                    cmd.Parameters.AddWithValue("@ColumnName", "A");
                    cmd.Parameters.AddWithValue("@ItemText", question.ColumnA[i]);
                    cmd.Parameters.AddWithValue("@ItemOrder", i + 1);
                    cmd.Parameters.AddWithValue("@CorrectMatch", DBNull.Value);
                    cmd.ExecuteNonQuery();
                }
            }

            // Insert Column B items
            if (question.ColumnB != null)
            {
                for (int i = 0; i < question.ColumnB.Count; i++)
                {
                    cmd.Parameters.Clear();
                    cmd.Parameters.AddWithValue("@QuestionID", questionId);
                    cmd.Parameters.AddWithValue("@ColumnName", "B");
                    cmd.Parameters.AddWithValue("@ItemText", question.ColumnB[i]);
                    cmd.Parameters.AddWithValue("@ItemOrder", i + 1);
                    cmd.Parameters.AddWithValue("@CorrectMatch", DBNull.Value);
                    cmd.ExecuteNonQuery();
                }
            }
        }
    }

    private void InsertFillBlankDetails(SqlConnection conn, SqlTransaction transaction, int questionId, QuestionData question)
    {
        if (question.BlankCount <= 0)
            return;

        string query = @"
            INSERT INTO FillBlankDetails (QuestionID, BlankNumber, BlankPosition, CorrectAnswer)
            VALUES (@QuestionID, @BlankNumber, @BlankPosition, @CorrectAnswer);";

        using (SqlCommand cmd = new SqlCommand(query, conn, transaction))
        {
            // For simplicity, we'll just store the correct answer for each blank
            // In a real scenario, you'd parse the question text to find blank positions
            for (int i = 1; i <= question.BlankCount; i++)
            {
                cmd.Parameters.Clear();
                cmd.Parameters.AddWithValue("@QuestionID", questionId);
                cmd.Parameters.AddWithValue("@BlankNumber", i);
                cmd.Parameters.AddWithValue("@BlankPosition", 0); // Would need to parse question text
                cmd.Parameters.AddWithValue("@CorrectAnswer", question.CorrectAnswer);
                cmd.ExecuteNonQuery();
            }
        }
    }
}

// Data models for JSON deserialization
public class WorksheetData
{
    public string PracticeSetCode { get; set; }
    public string Title { get; set; }
    public string ClassName { get; set; }
    public string Subject { get; set; }
    public string Topic { get; set; }
    public int TotalMarks { get; set; }
    public string TimeAllowed { get; set; }
    public List<string> Instructions { get; set; }
    public string CreatedAt { get; set; }
    public List<QuestionData> Questions { get; set; }
}

public class QuestionData
{
    public int QuestionNumber { get; set; }
    public string QuestionType { get; set; }
    public string QuestionText { get; set; }
    public string CorrectAnswer { get; set; }
    public string Explanation { get; set; }
    public int Marks { get; set; }
    public string ImageUrl { get; set; }
    
    // For MCQs and True/False
    public List<string> Options { get; set; }
    
    // For Matching
    public List<string> ColumnA { get; set; }
    public List<string> ColumnB { get; set; }
    public string CorrectMatches { get; set; }
    
    // For Fill in the Blanks
    public int BlankCount { get; set; }
    
    // For One Liner
    public string ExpectedAnswerLength { get; set; }
}

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
        // Enable CORS
        Response.AppendHeader("Access-Control-Allow-Origin", "*");
        Response.AppendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        Response.AppendHeader("Access-Control-Allow-Headers", "Content-Type");

        // Handle preflight OPTIONS request
        if (Request.HttpMethod == "OPTIONS")
        {
            Response.StatusCode = 200;
            Response.End();
            return;
        }

        // Only accept POST requests
        if (Request.HttpMethod != "POST")
        {
            Response.StatusCode = 405;
            Response.ContentType = "application/json";
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
                Response.ContentType = "application/json";
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
                Response.ContentType = "application/json";
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
                message = ex.Message
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
                    // Step 1: Insert worksheet
                    int worksheetId = InsertWorksheet(conn, transaction, data);

                    // Step 2: Insert all questions into SINGLE table
                    foreach (var question in data.Questions)
                    {
                        InsertQuestion(conn, transaction, worksheetId, question);
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

            // Convert instructions list to JSON string
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            string instructionsJson = serializer.Serialize(data.Instructions);
            cmd.Parameters.AddWithValue("@Instructions", instructionsJson);

            return Convert.ToInt32(cmd.ExecuteScalar());
        }
    }

    private int InsertQuestion(SqlConnection conn, SqlTransaction transaction, int worksheetId, QuestionData question)
    {
        // Build TypeSpecificData JSON based on question type
        string typeSpecificData = BuildTypeSpecificData(question);

        string query = @"
            INSERT INTO Questions (
                WorksheetID, QuestionNumber, QuestionType, QuestionText,
                CorrectAnswer, Explanation, Marks, ImageUrl, TypeSpecificData
            )
            VALUES (
                @WorksheetID, @QuestionNumber, @QuestionType, @QuestionText,
                @CorrectAnswer, @Explanation, @Marks, @ImageUrl, @TypeSpecificData
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
            cmd.Parameters.AddWithValue("@TypeSpecificData", (object)typeSpecificData ?? DBNull.Value);

            return Convert.ToInt32(cmd.ExecuteScalar());
        }
    }

    private string BuildTypeSpecificData(QuestionData question)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        Dictionary<string, object> data = new Dictionary<string, object>();

        switch (question.QuestionType.ToLower())
        {
            case "multiple-choice":
                data["options"] = question.Options ?? new List<string>();
                break;

            case "true-false":
                data["options"] = new List<string> { "True", "False" };
                break;

            case "fill-in-blank":
                data["blankCount"] = question.BlankCount;
                if (question.Blanks != null && question.Blanks.Count > 0)
                {
                    data["blanks"] = question.Blanks;
                }
                break;

            case "one-liner":
                data["expectedLength"] = question.ExpectedAnswerLength ?? "short";
                break;

            case "match":
                data["columnA"] = question.ColumnA ?? new List<string>();
                data["columnB"] = question.ColumnB ?? new List<string>();
                data["correctMatches"] = question.CorrectMatches ?? "";
                break;

            default:
                return null;
        }

        return serializer.Serialize(data);
    }
}

// =============================================
// Data models for JSON deserialization
// =============================================

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
    public List<string> Blanks { get; set; }

    // For One Liner
    public string ExpectedAnswerLength { get; set; }
}

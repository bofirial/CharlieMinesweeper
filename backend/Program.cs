using Backend.Models;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS for local frontend development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Storage Service based on Azure Connection String presence
var connectionString = builder.Configuration.GetConnectionString("AzureStorage");
if (string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddSingleton<IStorageService, LocalFileStorageService>();
}
else
{
    builder.Services.AddSingleton<IStorageService>(new AzureBlobStorageService(connectionString));
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

// Feedback API Endpoints
app.MapGet("/api/feedbacks", async (IStorageService storageService) =>
{
    var feedbacks = await storageService.GetFeedbacksAsync();
    return Results.Ok(feedbacks);
});

app.MapPost("/api/feedbacks", async (FeedbackItem feedback, IStorageService storageService) =>
{
    if (feedback == null || string.IsNullOrWhiteSpace(feedback.Content))
    {
        return Results.BadRequest("Feedback content cannot be empty.");
    }
    
    if (string.IsNullOrEmpty(feedback.Id))
    {
        feedback.Id = Guid.NewGuid().ToString();
    }
    
    if (string.IsNullOrEmpty(feedback.Timestamp))
    {
        feedback.Timestamp = DateTime.UtcNow.ToString("o");
    }

    await storageService.SaveFeedbackAsync(feedback);
    return Results.Created($"/api/feedbacks/{feedback.Id}", feedback);
});

app.MapDelete("/api/feedbacks/{id}", async (string id, IStorageService storageService) =>
{
    await storageService.DeleteFeedbackAsync(id);
    return Results.NoContent();
});

// High Scores API Endpoints
app.MapGet("/api/highscores", async (IStorageService storageService) =>
{
    var scores = await storageService.GetHighScoresAsync();
    return Results.Ok(scores);
});

app.MapPost("/api/highscores", async (HighScoreSubmission submission, IStorageService storageService) =>
{
    if (submission == null || string.IsNullOrWhiteSpace(submission.Difficulty) || submission.Time < 0)
    {
        return Results.BadRequest("Invalid high score submission.");
    }

    var updated = await storageService.SaveHighScoreAsync(submission.PlayerName, submission.Difficulty, submission.Time);
    return Results.Ok(updated);
});

app.MapDelete("/api/highscores", async (IStorageService storageService) =>
{
    await storageService.ClearHighScoresAsync();
    return Results.NoContent();
});

// Weather API Endpoint (kept from template)
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.MapFallbackToFile("index.html");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}


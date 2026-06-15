using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Services
{
    public class LocalFileStorageService : IStorageService
    {
        private readonly string _filePath;
        private readonly string _highScoresPath;
        private static readonly List<FeedbackItem> Presets = new()
        {
            new FeedbackItem { Id = "preset-1", Name = "Charlie", Type = "praise", Rating = 5, Content = "Love the new Magenta paint! It makes identifying 3s and 4s so much easier.", Timestamp = "2026-06-15T09:00:00.000Z" },
            new FeedbackItem { Id = "preset-2", Name = "MinesweeperPro", Type = "feature", Rating = 4, Content = "The Deluxe Teal paint 5x5 area of effect is awesome. Keep it up!", Timestamp = "2026-06-14T18:30:00.000Z" }
        };

        public LocalFileStorageService(string folderPath = "data")
        {
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            _filePath = Path.Combine(folderPath, "feedbacks.json");
            _highScoresPath = Path.Combine(folderPath, "highscores.json");
        }

        public async Task<List<FeedbackItem>> GetFeedbacksAsync()
        {
            if (!File.Exists(_filePath))
            {
                await SaveAllAsync(Presets);
                return Presets;
            }

            try
            {
                var json = await File.ReadAllTextAsync(_filePath);
                return JsonSerializer.Deserialize<List<FeedbackItem>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<FeedbackItem>();
            }
            catch
            {
                return new List<FeedbackItem>();
            }
        }

        public async Task SaveFeedbackAsync(FeedbackItem feedback)
        {
            var feedbacks = await GetFeedbacksAsync();
            feedbacks.Insert(0, feedback);
            await SaveAllAsync(feedbacks);
        }

        public async Task DeleteFeedbackAsync(string id)
        {
            var feedbacks = await GetFeedbacksAsync();
            var updated = feedbacks.Where(x => x.Id != id).ToList();
            await SaveAllAsync(updated);
        }

        private async Task SaveAllAsync(List<FeedbackItem> feedbacks)
        {
            var json = JsonSerializer.Serialize(feedbacks, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_filePath, json);
        }

        public async Task<Dictionary<string, List<HighScoreEntry>>> GetHighScoresAsync()
        {
            if (!File.Exists(_highScoresPath))
            {
                return new Dictionary<string, List<HighScoreEntry>>();
            }

            try
            {
                var json = await File.ReadAllTextAsync(_highScoresPath);
                try
                {
                    return JsonSerializer.Deserialize<Dictionary<string, List<HighScoreEntry>>>(json) ?? new Dictionary<string, List<HighScoreEntry>>();
                }
                catch
                {
                    // Fallback to legacy format Dictionary<string, int>
                    var legacy = JsonSerializer.Deserialize<Dictionary<string, int>>(json);
                    var migrated = new Dictionary<string, List<HighScoreEntry>>();
                    if (legacy != null)
                    {
                        foreach (var kvp in legacy)
                        {
                            migrated[kvp.Key] = new List<HighScoreEntry>
                            {
                                new HighScoreEntry { PlayerName = "Anonymous Raider", Time = kvp.Value, Timestamp = System.DateTime.UtcNow.ToString("o") }
                            };
                        }
                    }
                    return migrated;
                }
            }
            catch
            {
                return new Dictionary<string, List<HighScoreEntry>>();
            }
        }

        public async Task<Dictionary<string, List<HighScoreEntry>>> SaveHighScoreAsync(string playerName, string difficulty, int time)
        {
            var scores = await GetHighScoresAsync();
            if (!scores.TryGetValue(difficulty, out var list))
            {
                list = new List<HighScoreEntry>();
            }

            var newEntry = new HighScoreEntry
            {
                PlayerName = string.IsNullOrWhiteSpace(playerName) ? "Anonymous Raider" : playerName.Trim(),
                Time = time,
                Timestamp = System.DateTime.UtcNow.ToString("o")
            };

            list.Add(newEntry);
            var updatedList = list.OrderBy(x => x.Time).Take(10).ToList();
            scores[difficulty] = updatedList;

            var json = JsonSerializer.Serialize(scores, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_highScoresPath, json);
            return scores;
        }

        public async Task ClearHighScoresAsync()
        {
            if (File.Exists(_highScoresPath))
            {
                File.Delete(_highScoresPath);
            }
            await Task.CompletedTask;
        }
    }
}

using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Backend.Models;

namespace Backend.Services
{
    public class AzureBlobStorageService : IStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName = "feedback";
        private readonly string _blobName = "feedbacks.json";
        private readonly string _highScoresBlobName = "highscores.json";

        private static readonly List<FeedbackItem> Presets = new()
        {
            new FeedbackItem { Id = "preset-1", Name = "Charlie", Type = "praise", Rating = 5, Content = "Love the new Magenta paint! It makes identifying 3s and 4s so much easier.", Timestamp = "2026-06-15T09:00:00.000Z" },
            new FeedbackItem { Id = "preset-2", Name = "MinesweeperPro", Type = "feature", Rating = 4, Content = "The Deluxe Teal paint 5x5 area of effect is awesome. Keep it up!", Timestamp = "2026-06-14T18:30:00.000Z" }
        };

        public AzureBlobStorageService(string connectionString)
        {
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        private async Task<BlobClient> GetBlobClientAsync()
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync();
            return containerClient.GetBlobClient(_blobName);
        }

        private async Task<BlobClient> GetHighScoresBlobClientAsync()
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync();
            return containerClient.GetBlobClient(_highScoresBlobName);
        }

        public async Task<List<FeedbackItem>> GetFeedbacksAsync()
        {
            try
            {
                var blobClient = await GetBlobClientAsync();
                if (!await blobClient.ExistsAsync())
                {
                    await SaveAllAsync(Presets);
                    return Presets;
                }

                var downloadInfo = await blobClient.DownloadContentAsync();
                var json = downloadInfo.Value.Content.ToString();
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
            var blobClient = await GetBlobClientAsync();
            var json = JsonSerializer.Serialize(feedbacks, new JsonSerializerOptions { WriteIndented = true });
            using var ms = new MemoryStream(Encoding.UTF8.GetBytes(json));
            await blobClient.UploadAsync(ms, overwrite: true);
        }

        public async Task<Dictionary<string, List<HighScoreEntry>>> GetHighScoresAsync()
        {
            try
            {
                var blobClient = await GetHighScoresBlobClientAsync();
                if (!await blobClient.ExistsAsync())
                {
                    return new Dictionary<string, List<HighScoreEntry>>();
                }

                var downloadInfo = await blobClient.DownloadContentAsync();
                var json = downloadInfo.Value.Content.ToString();
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

            var blobClient = await GetHighScoresBlobClientAsync();
            var json = JsonSerializer.Serialize(scores, new JsonSerializerOptions { WriteIndented = true });
            using var ms = new MemoryStream(Encoding.UTF8.GetBytes(json));
            await blobClient.UploadAsync(ms, overwrite: true);

            return scores;
        }

        public async Task ClearHighScoresAsync()
        {
            var blobClient = await GetHighScoresBlobClientAsync();
            await blobClient.DeleteIfExistsAsync();
        }
    }
}

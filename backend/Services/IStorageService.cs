using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Services
{
    public interface IStorageService
    {
        Task<List<FeedbackItem>> GetFeedbacksAsync();
        Task SaveFeedbackAsync(FeedbackItem feedback);
        Task DeleteFeedbackAsync(string id);

        Task<Dictionary<string, List<HighScoreEntry>>> GetHighScoresAsync();
        Task<Dictionary<string, List<HighScoreEntry>>> SaveHighScoreAsync(string playerName, string difficulty, int time);
        Task ClearHighScoresAsync();
    }
}

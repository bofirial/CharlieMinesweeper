namespace Backend.Models
{
    public class HighScoreEntry
    {
        public string PlayerName { get; set; } = string.Empty;
        public int Time { get; set; }
        public string Timestamp { get; set; } = string.Empty;
    }
}

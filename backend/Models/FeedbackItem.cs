namespace Backend.Models
{
    public class FeedbackItem
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // bug, feature, praise, other
        public int Rating { get; set; }
        public string Content { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
    }
}

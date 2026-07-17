using System.Text.Json.Serialization;

namespace CineCatalog.Models;

public enum ItemType
{
    Movie,
    Series
}

public enum ItemStatus
{
    New,
    Favorite,
    ToWatch
}

public class CatalogItem
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

    [JsonPropertyName("type")]
    public ItemType Type { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("year")]
    public int? Year { get; set; }

    [JsonPropertyName("rating")]
    public int Rating { get; set; }

    [JsonPropertyName("status")]
    public ItemStatus Status { get; set; } = ItemStatus.New;

    [JsonPropertyName("watched")]
    public bool Watched { get; set; }

    [JsonPropertyName("imagePath")]
    public string ImagePath { get; set; } = string.Empty;

    [JsonPropertyName("mediaPath")]
    public string MediaPath { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = new();

    public bool HasMedia => !string.IsNullOrEmpty(MediaPath) && File.Exists(MediaPath);
    public bool HasImage => !string.IsNullOrEmpty(ImagePath) && File.Exists(ImagePath);
    public string DisplayYear => Year?.ToString() ?? "----";
    public string RatingStars => new string('\u2605', Rating) + new string('\u2606', 5 - Rating);
}

using System.Text.Json.Serialization;

namespace CineCatalog.Models;

public class MovieItem : CatalogItem
{
    [JsonPropertyName("duration")]
    public TimeSpan? Duration { get; set; }

    [JsonPropertyName("director")]
    public string Director { get; set; } = string.Empty;

    [JsonPropertyName("genre")]
    public string Genre { get; set; } = string.Empty;

    public string DisplayDuration => Duration.HasValue
        ? $"{(int)Duration.Value.TotalMinutes} min"
        : string.Empty;
}

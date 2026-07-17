using System.Text.Json.Serialization;

namespace CineCatalog.Models;

public class AppSettings
{
    [JsonPropertyName("theme")]
    public string Theme { get; set; } = "Dark";

    [JsonPropertyName("zoomLevel")]
    public int ZoomLevel { get; set; } = 3;

    [JsonPropertyName("cardsPerRow")]
    public int CardsPerRow => ZoomLevel switch
    {
        1 => 8,
        2 => 6,
        3 => 5,
        4 => 4,
        _ => 5
    };

    [JsonPropertyName("lastView")]
    public string LastView { get; set; } = "Movies";

    [JsonPropertyName("autoSaveInterval")]
    public int AutoSaveIntervalSeconds { get; set; } = 60;
}

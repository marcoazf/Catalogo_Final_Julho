using System.Text.Json.Serialization;

namespace CineCatalog.Models;

public class SeriesItem : CatalogItem
{
    [JsonPropertyName("seasons")]
    public int Seasons { get; set; }

    [JsonPropertyName("episodes")]
    public int Episodes { get; set; }

    [JsonPropertyName("creator")]
    public string Creator { get; set; } = string.Empty;

    [JsonPropertyName("genre")]
    public string Genre { get; set; } = string.Empty;

    public string DisplayEpisodes => $"{Seasons}T {Episodes}E";
}

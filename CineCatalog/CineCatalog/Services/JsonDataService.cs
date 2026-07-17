using System.Text.Json;
using CineCatalog.Models;

namespace CineCatalog.Services;

public class JsonDataService : IDataService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    private readonly string _catalogPath;
    private readonly string _settingsPath;
    private readonly string _dataDirectory;

    private readonly SemaphoreSlim _lock = new(1, 1);

    public JsonDataService()
    {
        _dataDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "CineCatalog");

        Directory.CreateDirectory(_dataDirectory);

        _catalogPath = Path.Combine(_dataDirectory, "catalog.json");
        _settingsPath = Path.Combine(_dataDirectory, "settings.json");
    }

    public string DataDirectory => _dataDirectory;

    public async Task<List<CatalogItem>> LoadCatalogAsync()
    {
        await _lock.WaitAsync();
        try
        {
            if (!File.Exists(_catalogPath))
                return new List<CatalogItem>();

            await using var stream = new FileStream(_catalogPath, FileMode.Open, FileAccess.Read, FileShare.Read, 65536, true);
            var items = await JsonSerializer.DeserializeAsync<List<CatalogItem>>(stream, JsonOptions);
            return items ?? new List<CatalogItem>();
        }
        catch (JsonException ex)
        {
            System.Diagnostics.Debug.WriteLine($"Erro ao ler catálogo: {ex.Message}");
            return new List<CatalogItem>();
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task SaveCatalogAsync(List<CatalogItem> items)
    {
        await _lock.WaitAsync();
        try
        {
            var tempPath = _catalogPath + ".tmp";
            await using var stream = new FileStream(tempPath, FileMode.Create, FileAccess.Write, FileShare.None, 65536, true);
            await JsonSerializer.SerializeAsync(stream, items, JsonOptions);
            await stream.FlushAsync();

            if (File.Exists(_catalogPath))
                File.Replace(tempPath, _catalogPath, null);
            else
                File.Move(tempPath, _catalogPath);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<AppSettings> LoadSettingsAsync()
    {
        if (!File.Exists(_settingsPath))
            return new AppSettings();

        try
        {
            var json = await File.ReadAllTextAsync(_settingsPath);
            return JsonSerializer.Deserialize<AppSettings>(json, JsonOptions) ?? new AppSettings();
        }
        catch
        {
            return new AppSettings();
        }
    }

    public async Task SaveSettingsAsync(AppSettings settings)
    {
        var json = JsonSerializer.Serialize(settings, JsonOptions);
        await File.WriteAllTextAsync(_settingsPath, json);
    }
}

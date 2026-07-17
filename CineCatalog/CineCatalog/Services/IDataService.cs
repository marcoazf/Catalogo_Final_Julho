using CineCatalog.Models;

namespace CineCatalog.Services;

public interface IDataService
{
    Task<List<CatalogItem>> LoadCatalogAsync();
    Task SaveCatalogAsync(List<CatalogItem> items);
    Task<AppSettings> LoadSettingsAsync();
    Task SaveSettingsAsync(AppSettings settings);
    string DataDirectory { get; }
}

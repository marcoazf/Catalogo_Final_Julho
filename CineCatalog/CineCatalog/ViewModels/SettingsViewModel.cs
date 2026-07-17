using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CineCatalog.Models;
using CineCatalog.Services;

namespace CineCatalog.ViewModels;

public partial class SettingsViewModel : ObservableObject
{
    private readonly IDataService _dataService;
    private AppSettings _settings = new();

    [ObservableProperty]
    private string _theme = "Dark";

    [ObservableProperty]
    private int _zoomLevel = 3;

    [ObservableProperty]
    private string _dataPath = string.Empty;

    [ObservableProperty]
    private int _totalItems;

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    public SettingsViewModel(IDataService dataService)
    {
        _dataService = dataService;
        DataPath = _dataService.DataDirectory;
    }

    public async Task InitializeAsync()
    {
        _settings = await _dataService.LoadSettingsAsync();
        Theme = _settings.Theme;
        ZoomLevel = _settings.ZoomLevel;

        var items = await _dataService.LoadCatalogAsync();
        TotalItems = items.Count;
    }

    [RelayCommand]
    private void SetTheme(string theme)
    {
        Theme = theme;
        _settings.Theme = theme;
        App.ApplyTheme(theme);
        _ = _dataService.SaveSettingsAsync(_settings);
    }

    partial void OnZoomLevelChanged(int value)
    {
        _settings.ZoomLevel = value;
        _ = _dataService.SaveSettingsAsync(_settings);
    }

    [RelayCommand]
    private async Task ClearData()
    {
        var result = MessageBox.Show(
            "Eliminar TODOS os dados do catálogo?\n\nEsta ação não pode ser desfeita.",
            "Limpar Catálogo",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning);

        if (result == MessageBoxResult.Yes)
        {
            await _dataService.SaveCatalogAsync(new List<CatalogItem>());
            TotalItems = 0;
            StatusMessage = "Catálogo limpo";
        }
    }

    [RelayCommand]
    private void OpenDataFolder()
    {
        try
        {
            System.Diagnostics.Process.Start("explorer.exe", _dataService.DataDirectory);
        }
        catch { }
    }

    public AppSettings GetSettings() => _settings;
}

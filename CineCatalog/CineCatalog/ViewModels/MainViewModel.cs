using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CineCatalog.Services;

namespace CineCatalog.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly IDataService _dataService;

    [ObservableProperty]
    private CatalogViewModel _catalog = null!;

    [ObservableProperty]
    private SettingsViewModel _settings = null!;

    [ObservableProperty]
    private bool _isInitialized;

    [ObservableProperty]
    private string _titleBar = "CineCatalog Elo";

    public MainViewModel(
        IDataService dataService,
        CatalogViewModel catalog,
        SettingsViewModel settings)
    {
        _dataService = dataService;
        Catalog = catalog;
        Settings = settings;
    }

    public async Task InitializeAsync()
    {
        await Settings.InitializeAsync();
        await Catalog.InitializeAsync();
        IsInitialized = true;
    }

    [RelayCommand]
    private async Task Refresh()
    {
        await Catalog.InitializeAsync();
    }

    [RelayCommand]
    private async Task ShowSettings()
    {
        await Settings.InitializeAsync();
    }
}

using System.Collections.ObjectModel;
using System.ComponentModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CineCatalog.Models;
using CineCatalog.Services;

namespace CineCatalog.ViewModels;

public partial class CatalogViewModel : ObservableObject
{
    private readonly IDataService _dataService;
    private readonly IFileDialogService _fileDialog;

    private List<CatalogItem> _allItems = new();

    [ObservableProperty]
    private ObservableCollection<CatalogItem> _filteredItems = new();

    [ObservableProperty]
    private bool _isLoading;

    [ObservableProperty]
    private bool _isEmpty = true;

    [ObservableProperty]
    private string _searchQuery = string.Empty;

    [ObservableProperty]
    private string _currentView = "Movies";

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    [ObservableProperty]
    private int _totalCount;

    [ObservableProperty]
    private int _filteredCount;

    [ObservableProperty]
    private int _zoomLevel = 3;

    private CancellationTokenSource? _searchCts;

    public int CardsPerRow => ZoomLevel switch
    {
        1 => 8,
        2 => 6,
        3 => 5,
        4 => 4,
        _ => 5
    };

    public CatalogViewModel(IDataService dataService, IFileDialogService fileDialog)
    {
        _dataService = dataService;
        _fileDialog = fileDialog;
    }

    public async Task InitializeAsync()
    {
        IsLoading = true;
        try
        {
            _allItems = await _dataService.LoadCatalogAsync();
            TotalCount = _allItems.Count;
            ApplyFilters();
            SetStatus($"Catálogo carregado — {TotalCount} título{(TotalCount != 1 ? "s" : "")}");
        }
        catch (Exception ex)
        {
            SetStatus($"Erro ao carregar: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    partial void OnSearchQueryChanged(string value)
    {
        _searchCts?.Cancel();
        _searchCts = new CancellationTokenSource();
        var token = _searchCts.Token;

        _ = Task.Delay(300, token).ContinueWith(_ =>
        {
            if (!token.IsCancellationRequested)
                App.Current.Dispatcher.Invoke(ApplyFilters);
        }, token);
    }

    partial void OnCurrentViewChanged(string value)
    {
        ApplyFilters();
    }

    private void ApplyFilters()
    {
        var query = SearchQuery?.Trim().ToLowerInvariant() ?? string.Empty;
        var viewType = CurrentView == "Movies" ? ItemType.Movie : ItemType.Series;

        var filtered = _allItems
            .Where(item => item.Type == viewType)
            .Where(item => string.IsNullOrEmpty(query)
                || item.Title.ToLowerInvariant().Contains(query)
                || item.Description.ToLowerInvariant().Contains(query)
                || item.Tags.Any(t => t.ToLowerInvariant().Contains(query)))
            .OrderByDescending(item => item.Status == ItemStatus.Favorite)
            .ThenByDescending(item => item.CreatedAt)
            .ToList();

        FilteredItems = new ObservableCollection<CatalogItem>(filtered);
        FilteredCount = filtered.Count;
        IsEmpty = filtered.Count == 0;
        OnPropertyChanged(nameof(CardsPerRow));
    }

    [RelayCommand]
    private void SetView(string view)
    {
        CurrentView = view;
    }

    [RelayCommand]
    private void SetZoom(int level)
    {
        ZoomLevel = level;
        OnPropertyChanged(nameof(CardsPerRow));
    }

    [RelayCommand]
    private void ClearSearch()
    {
        SearchQuery = string.Empty;
        ApplyFilters();
    }

    [RelayCommand]
    private async Task AddItem()
    {
        var dialog = new Views.ItemDetailDialog();
        var vm = new ItemDetailViewModel(_fileDialog)
        {
            Type = CurrentView == "Movies" ? ItemType.Movie : ItemType.Series
        };
        dialog.DataContext = vm;

        if (dialog.ShowDialog() == true)
        {
            var newItem = vm.BuildItem();
            _allItems.Add(newItem);
            TotalCount = _allItems.Count;
            ApplyFilters();
            await SaveCatalogAsync();
            SetStatus($"\"{newItem.Title}\" adicionado ao acervo");
        }
    }

    [RelayCommand]
    private async Task EditItem(CatalogItem? item)
    {
        if (item is null) return;

        var dialog = new Views.ItemDetailDialog();
        var vm = new ItemDetailViewModel(_fileDialog);
        vm.LoadItem(item);
        dialog.DataContext = vm;

        if (dialog.ShowDialog() == true)
        {
            vm.UpdateItem(item);
            item.UpdatedAt = DateTime.Now;
            ApplyFilters();
            await SaveCatalogAsync();
            SetStatus($"\"{item.Title}\" atualizado");
        }
    }

    [RelayCommand]
    private async Task DeleteItem(CatalogItem? item)
    {
        if (item is null) return;

        var result = MessageBox.Show(
            $"Eliminar \"{item.Title}\" permanentemente?",
            "Confirmar Eliminação",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning);

        if (result == MessageBoxResult.Yes)
        {
            _allItems.Remove(item);
            TotalCount = _allItems.Count;
            ApplyFilters();
            await SaveCatalogAsync();
            SetStatus($"\"{item.Title}\" eliminado");
        }
    }

    [RelayCommand]
    private async Task ToggleFavorite(CatalogItem? item)
    {
        if (item is null) return;

        item.Status = item.Status == ItemStatus.Favorite ? ItemStatus.New : ItemStatus.Favorite;
        ApplyFilters();
        await SaveCatalogAsync();
    }

    [RelayCommand]
    private void PlayMedia(CatalogItem? item)
    {
        if (item is null || !item.HasMedia) return;

        try
        {
            var psi = new System.Diagnostics.ProcessStartInfo
            {
                FileName = item.MediaPath,
                UseShellExecute = true
            };
            System.Diagnostics.Process.Start(psi);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Não foi possível abrir o arquivo:\n{ex.Message}",
                "Erro de Reprodução", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task ExportBackup()
    {
        var path = _fileDialog.SaveBackupFile();
        if (path is null) return;

        try
        {
            var json = System.Text.Json.JsonSerializer.Serialize(_allItems, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true
            });
            await File.WriteAllTextAsync(path, json);
            SetStatus($"Backup exportado: {Path.GetFileName(path)}");
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erro ao exportar:\n{ex.Message}", "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task ImportBackup()
    {
        var path = _fileDialog.OpenBackupFile();
        if (path is null) return;

        try
        {
            var json = await File.ReadAllTextAsync(path);
            var imported = System.Text.Json.JsonSerializer.Deserialize<List<CatalogItem>>(json);
            if (imported is null || imported.Count == 0)
            {
                MessageBox.Show("Nenhum dado encontrado no arquivo.", "Importação", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            var result = MessageBox.Show(
                $"Importar {imported.Count} título{(imported.Count != 1 ? "s" : "")}?\n" +
                "Os dados atuais serão substituídos.",
                "Confirmar Importação",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                _allItems = imported;
                TotalCount = _allItems.Count;
                ApplyFilters();
                await SaveCatalogAsync();
                SetStatus($"{imported.Count} título{(imported.Count != 1 ? "s" : "")} importados");
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erro ao importar:\n{ex.Message}", "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    public async Task SaveCatalogAsync()
    {
        await _dataService.SaveCatalogAsync(_allItems);
    }

    private void SetStatus(string msg)
    {
        StatusMessage = msg;
    }

    public CatalogItem? FindItemById(string id)
    {
        return _allItems.FirstOrDefault(i => i.Id == id);
    }
}

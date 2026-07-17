using System.Windows;
using System.Windows.Media;
using CineCatalog.Models;
using CineCatalog.Services;
using CineCatalog.ViewModels;
using CineCatalog.Views;

namespace CineCatalog;

public partial class App : Application
{
    private IDataService _dataService = null!;
    private MainViewModel _mainViewModel = null!;

    private void Application_Startup(object sender, StartupEventArgs e)
    {
        // Configure unhandled exception handling
        DispatcherUnhandledException += (s, args) =>
        {
            MessageBox.Show($"Erro inesperado:\n{args.Exception.Message}",
                "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
            args.Handled = true;
        };

        AppDomain.CurrentDomain.UnhandledException += (s, args) =>
        {
            if (args.ExceptionObject is Exception ex)
            {
                MessageBox.Show($"Erro crítico:\n{ex.Message}", "Erro Fatal",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        };

        // Initialize services
        _dataService = new JsonDataService();

        var fileDialog = new FileDialogService();

        // Load settings and apply theme
        var settingsTask = _dataService.LoadSettingsAsync();
        var savedSettings = settingsTask.GetAwaiter().GetResult();
        ApplyTheme(savedSettings.Theme);

        // Initialize ViewModels
        var catalogVm = new CatalogViewModel(_dataService, fileDialog);
        var settingsVm = new SettingsViewModel(_dataService);
        _mainViewModel = new MainViewModel(_dataService, catalogVm, settingsVm);

        // Create and show main window
        var mainWindow = new MainWindow(_mainViewModel);
        mainWindow.Show();
    }

    private void Application_Exit(object sender, ExitEventArgs e)
    {
        // Auto-save catalog on exit
        try
        {
            if (_mainViewModel?.Catalog is not null)
            {
                var task = _mainViewModel.Catalog.SaveCatalogAsync();
                task.Wait(TimeSpan.FromSeconds(3));
            }
        }
        catch { /* Silently handle save errors on exit */ }
    }

    public static void ApplyTheme(string theme)
    {
        if (Current is App app)
        {
            var dicts = Current.Resources.MergedDictionaries;

            // Remove existing theme
            var existing = dicts.FirstOrDefault(d =>
                d.Source?.OriginalString?.Contains("Light.xaml") == true ||
                d.Source?.OriginalString?.Contains("Generic.xaml") == true);

            if (existing is not null)
                dicts.Remove(existing);

            // Apply new theme
            var uri = theme == "Light"
                ? new Uri("Themes/Light.xaml", UriKind.Relative)
                : new Uri("Themes/Generic.xaml", UriKind.Relative);

            dicts.Add(new ResourceDictionary { Source = uri });

            // Update window backgrounds
            foreach (Window window in Current.Windows)
            {
                window.Background = (Brush)Current.Resources["BgColor"];
                window.Foreground = (Brush)Current.Resources["TextColor"];
            }
        }
    }
}

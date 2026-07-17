using System.Windows;
using System.Windows.Controls;
using CineCatalog.ViewModels;

namespace CineCatalog;

public partial class MainWindow : Window
{
    private readonly MainViewModel _viewModel;

    public MainWindow(MainViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        DataContext = viewModel;

        Loaded += async (s, e) =>
        {
            await viewModel.InitializeAsync();
        };

        viewModel.PropertyChanged += (s, e) =>
        {
            if (e.PropertyName == nameof(MainViewModel.Settings))
            {
                // Toggle views based on navigation
            }
        };
    }
}

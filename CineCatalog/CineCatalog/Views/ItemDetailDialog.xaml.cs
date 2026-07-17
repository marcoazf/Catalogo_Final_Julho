using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using CineCatalog.Models;
using CineCatalog.ViewModels;

namespace CineCatalog.Views;

public partial class ItemDetailDialog : Window
{
    public ItemDetailDialog()
    {
        InitializeComponent();
        Owner = Application.Current.MainWindow;
    }

    private void TypeSwitch_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && DataContext is ItemDetailViewModel vm)
        {
            vm.Type = btn.Tag.ToString() == "Movie" ? ItemType.Movie : ItemType.Series;
        }
    }

    private void Star_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && DataContext is ItemDetailViewModel vm)
        {
            var rating = int.Parse(btn.Tag.ToString()!);
            vm.Rating = rating;
            UpdateStars();
        }
    }

    private void UpdateStars()
    {
        if (DataContext is not ItemDetailViewModel vm) return;

        var starsContainer = (StackPanel)((Border)((ScrollViewer)((Grid)((Border)Content).Child).Children[2]).Content).Children[0];
        var starPanel = (StackPanel)((Grid)((Border)Content).Child).FindName("StarPanel");

        // Simpler: find all star buttons in the visual tree
        var parent = (Grid)((Border)((Border)Content).Child);
        var scrollViewer = (ScrollViewer)parent.Children[2];
        var formGrid = (Grid)scrollViewer.Content;
        var rightStack = (StackPanel)formGrid.Children[1];
        var starStack = (StackPanel)rightStack.Children[9]; // Rating stars stack

        for (int i = 0; i < starStack.Children.Count; i++)
        {
            if (starStack.Children[i] is Button b)
            {
                b.Foreground = (i < vm.Rating) ? new SolidColorBrush(Color.FromRgb(251, 191, 36)) : new SolidColorBrush(Color.FromRgb(107, 114, 128));
            }
        }
    }

    private void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        if (DataContext is ItemDetailViewModel vm && !string.IsNullOrWhiteSpace(vm.Title))
        {
            DialogResult = true;
            Close();
        }
        else
        {
            MessageBox.Show("O título é obrigatório.", "Validação", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private void CancelButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }

    private void CloseButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }
}

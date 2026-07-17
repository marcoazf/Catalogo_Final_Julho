using System.Windows;
using System.Windows.Controls;
using CineCatalog.Controls;
using CineCatalog.Models;

namespace CineCatalog.Views;

public partial class CatalogView : UserControl
{
    public CatalogView()
    {
        InitializeComponent();
    }

    private void MovieCard_Clicked(object sender, CatalogItem item)
    {
        if (DataContext is ViewModels.CatalogViewModel vm)
        {
            if (Keyboard.IsKeyDown(System.Windows.Input.Key.LeftCtrl) ||
                Keyboard.IsKeyDown(System.Windows.Input.Key.RightCtrl))
            {
                vm.PlayMediaCommand.Execute(item);
            }
            else
            {
                vm.EditItemCommand.Execute(item);
            }
        }
    }

    private void MovieCard_RightClicked(object sender, CatalogItem item)
    {
        var contextMenu = new ContextMenu();
        contextMenu.Items.Add(new MenuItem
        {
            Header = "Editar",
            Command = ((ViewModels.CatalogViewModel)DataContext).EditItemCommand,
            CommandParameter = item
        });
        contextMenu.Items.Add(new MenuItem
        {
            Header = "Reproduzir",
            Command = ((ViewModels.CatalogViewModel)DataContext).PlayMediaCommand,
            CommandParameter = item
        });
        contextMenu.Items.Add(new Separator());
        contextMenu.Items.Add(new MenuItem
        {
            Header = "Favoritar",
            Command = ((ViewModels.CatalogViewModel)DataContext).ToggleFavoriteCommand,
            CommandParameter = item
        });
        contextMenu.Items.Add(new Separator());
        contextMenu.Items.Add(new MenuItem
        {
            Header = "Eliminar",
            Command = ((ViewModels.CatalogViewModel)DataContext).DeleteItemCommand,
            CommandParameter = item,
            Foreground = System.Windows.Media.Brushes.Red
        });

        contextMenu.IsOpen = true;
    }

    private void MovieCard_FavoriteToggled(object sender, CatalogItem item)
    {
        if (DataContext is ViewModels.CatalogViewModel vm)
        {
            vm.ToggleFavoriteCommand.Execute(item);
        }
    }
}

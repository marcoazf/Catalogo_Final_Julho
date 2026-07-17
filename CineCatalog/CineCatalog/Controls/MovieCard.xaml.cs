using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using CineCatalog.Models;

namespace CineCatalog.Controls;

public partial class MovieCard : UserControl
{
    public static readonly DependencyProperty TitleProperty =
        DependencyProperty.Register(nameof(Title), typeof(string), typeof(MovieCard),
            new PropertyMetadata(string.Empty));

    public static readonly DependencyProperty YearProperty =
        DependencyProperty.Register(nameof(Year), typeof(int?), typeof(MovieCard),
            new PropertyMetadata(null));

    public static readonly DependencyProperty RatingProperty =
        DependencyProperty.Register(nameof(Rating), typeof(int), typeof(MovieCard),
            new PropertyMetadata(0));

    public static readonly DependencyProperty ImagePathProperty =
        DependencyProperty.Register(nameof(ImagePath), typeof(string), typeof(MovieCard),
            new PropertyMetadata(string.Empty));

    public static readonly DependencyProperty HasImageProperty =
        DependencyProperty.Register(nameof(HasImage), typeof(bool), typeof(MovieCard),
            new PropertyMetadata(false));

    public static readonly DependencyProperty IsFavoriteProperty =
        DependencyProperty.Register(nameof(IsFavorite), typeof(bool), typeof(MovieCard),
            new PropertyMetadata(false));

    public static readonly DependencyProperty WatchedProperty =
        DependencyProperty.Register(nameof(Watched), typeof(bool), typeof(MovieCard),
            new PropertyMetadata(false));

    public static readonly DependencyProperty ItemProperty =
        DependencyProperty.Register(nameof(Item), typeof(CatalogItem), typeof(MovieCard),
            new PropertyMetadata(null, OnItemChanged));

    public string Title
    {
        get => (string)GetValue(TitleProperty);
        set => SetValue(TitleProperty, value);
    }

    public int? Year
    {
        get => (int?)GetValue(YearProperty);
        set => SetValue(YearProperty, value);
    }

    public int Rating
    {
        get => (int)GetValue(RatingProperty);
        set => SetValue(RatingProperty, value);
    }

    public string ImagePath
    {
        get => (string)GetValue(ImagePathProperty);
        set => SetValue(ImagePathProperty, value);
    }

    public bool HasImage
    {
        get => (bool)GetValue(HasImageProperty);
        set => SetValue(HasImageProperty, value);
    }

    public bool IsFavorite
    {
        get => (bool)GetValue(IsFavoriteProperty);
        set => SetValue(IsFavoriteProperty, value);
    }

    public bool Watched
    {
        get => (bool)GetValue(WatchedProperty);
        set => SetValue(WatchedProperty, value);
    }

    public CatalogItem? Item
    {
        get => (CatalogItem?)GetValue(ItemProperty);
        set => SetValue(ItemProperty, value);
    }

    public event EventHandler<CatalogItem>? ItemClicked;
    public event EventHandler<CatalogItem>? ItemRightClicked;
    public event EventHandler<CatalogItem>? FavoriteToggled;

    public MovieCard()
    {
        InitializeComponent();
    }

    private static void OnItemChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is MovieCard card && e.NewValue is CatalogItem item)
        {
            card.Title = item.Title;
            card.Year = item.Year;
            card.Rating = item.Rating;
            card.ImagePath = item.ImagePath;
            card.HasImage = item.HasImage;
            card.IsFavorite = item.Status == ItemStatus.Favorite;
            card.Watched = item.Watched;
        }
    }

    protected override void OnMouseLeftButtonUp(MouseButtonEventArgs e)
    {
        base.OnMouseLeftButtonUp(e);
        if (Item is not null)
            ItemClicked?.Invoke(this, Item);
    }

    protected override void OnMouseRightButtonUp(MouseButtonEventArgs e)
    {
        base.OnMouseRightButtonUp(e);
        if (Item is not null)
            ItemRightClicked?.Invoke(this, Item);
    }
}

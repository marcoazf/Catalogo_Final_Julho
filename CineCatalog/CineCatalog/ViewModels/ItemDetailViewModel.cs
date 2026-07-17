using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CineCatalog.Models;
using CineCatalog.Services;

namespace CineCatalog.ViewModels;

public partial class ItemDetailViewModel : ObservableObject
{
    private readonly IFileDialogService _fileDialog;

    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    private string _description = string.Empty;

    [ObservableProperty]
    private int? _year;

    [ObservableProperty]
    private int _rating;

    [ObservableProperty]
    private ItemStatus _status = ItemStatus.New;

    [ObservableProperty]
    private bool _watched;

    [ObservableProperty]
    private string _imagePath = string.Empty;

    [ObservableProperty]
    private string _mediaPath = string.Empty;

    [ObservableProperty]
    private string _genre = string.Empty;

    [ObservableProperty]
    private string _directorOrCreator = string.Empty;

    [ObservableProperty]
    private string _tags = string.Empty;

    [ObservableProperty]
    private ItemType _type = ItemType.Movie;

    // Series-specific
    [ObservableProperty]
    private int _seasons;

    [ObservableProperty]
    private int _episodes;

    // Movie-specific
    [ObservableProperty]
    private string _duration = string.Empty;

    public bool IsMovie => Type == ItemType.Movie;
    public bool IsSeries => Type == ItemType.Series;

    public string ImagePreviewPath => !string.IsNullOrEmpty(ImagePath) && File.Exists(ImagePath)
        ? ImagePath
        : string.Empty;

    public ItemDetailViewModel(IFileDialogService fileDialog)
    {
        _fileDialog = fileDialog;
    }

    public void LoadItem(CatalogItem item)
    {
        Title = item.Title;
        Description = item.Description;
        Year = item.Year;
        Rating = item.Rating;
        Status = item.Status;
        Watched = item.Watched;
        ImagePath = item.ImagePath;
        MediaPath = item.MediaPath;
        Type = item.Type;
        Tags = string.Join(", ", item.Tags);

        if (item is MovieItem movie)
        {
            Genre = movie.Genre;
            DirectorOrCreator = movie.Director;
            Duration = movie.Duration?.TotalMinutes.ToString("F0") ?? string.Empty;
        }
        else if (item is SeriesItem series)
        {
            Genre = series.Genre;
            DirectorOrCreator = series.Creator;
            Seasons = series.Seasons;
            Episodes = series.Episodes;
        }
    }

    public void UpdateItem(CatalogItem item)
    {
        item.Title = Title;
        item.Description = Description;
        item.Year = Year;
        item.Rating = Rating;
        item.Status = Status;
        item.Watched = Watched;
        item.ImagePath = ImagePath;
        item.MediaPath = MediaPath;
        item.Tags = Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        if (item is MovieItem movie)
        {
            movie.Genre = Genre;
            movie.Director = DirectorOrCreator;
            movie.Duration = int.TryParse(Duration, out var min) ? TimeSpan.FromMinutes(min) : null;
        }
        else if (item is SeriesItem series)
        {
            series.Genre = Genre;
            series.Creator = DirectorOrCreator;
            series.Seasons = Seasons;
            series.Episodes = Episodes;
        }
    }

    public CatalogItem BuildItem()
    {
        if (Type == ItemType.Movie)
        {
            return new MovieItem
            {
                Title = Title,
                Description = Description,
                Year = Year,
                Rating = Rating,
                Status = Status,
                Watched = Watched,
                ImagePath = ImagePath,
                MediaPath = MediaPath,
                Genre = Genre,
                Director = DirectorOrCreator,
                Duration = int.TryParse(Duration, out var min) ? TimeSpan.FromMinutes(min) : null,
                Tags = Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
        }
        else
        {
            return new SeriesItem
            {
                Title = Title,
                Description = Description,
                Year = Year,
                Rating = Rating,
                Status = Status,
                Watched = Watched,
                ImagePath = ImagePath,
                MediaPath = MediaPath,
                Genre = Genre,
                Creator = DirectorOrCreator,
                Seasons = Seasons,
                Episodes = Episodes,
                Tags = Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
        }
    }

    [RelayCommand]
    private void PickImage()
    {
        var path = _fileDialog.OpenImageFile();
        if (path is not null)
        {
            ImagePath = path;
            OnPropertyChanged(nameof(ImagePreviewPath));
        }
    }

    [RelayCommand]
    private void PickMedia()
    {
        var path = _fileDialog.OpenMediaFile();
        if (path is not null)
        {
            MediaPath = path;
        }
    }

    partial void OnTypeChanged(ItemType value)
    {
        OnPropertyChanged(nameof(IsMovie));
        OnPropertyChanged(nameof(IsSeries));
    }
}

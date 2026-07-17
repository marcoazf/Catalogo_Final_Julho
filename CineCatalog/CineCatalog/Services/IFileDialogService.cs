using Microsoft.Win32;

namespace CineCatalog.Services;

public interface IFileDialogService
{
    string? OpenImageFile();
    string? OpenMediaFile();
    string? SaveBackupFile();
    string? OpenBackupFile();
}

public class FileDialogService : IFileDialogService
{
    private static readonly string[] ImageFilter =
        { "Imagens|*.jpg;*.jpeg;*.png;*.bmp;*.webp" };
    private static readonly string[] MediaFilter =
        { "Vídeos|*.mp4;*.mkv;*.avi;*.wmv;*.mov;*.webm" };
    private static readonly string[] BackupFilter =
        { "JSON|*.json" };

    public string? OpenImageFile()
    {
        var dialog = new OpenFileDialog
        {
            Title = "Selecionar Imagem do Poster",
            Filter = string.Join("|", ImageFilter),
            CheckFileExists = true,
            Multiselect = false
        };

        return dialog.ShowDialog() == true ? dialog.FileName : null;
    }

    public string? OpenMediaFile()
    {
        var dialog = new OpenFileDialog
        {
            Title = "Selecionar Arquivo de Mídia",
            Filter = string.Join("|", MediaFilter),
            CheckFileExists = true,
            Multiselect = false
        };

        return dialog.ShowDialog() == true ? dialog.FileName : null;
    }

    public string? SaveBackupFile()
    {
        var dialog = new SaveFileDialog
        {
            Title = "Exportar Backup",
            Filter = string.Join("|", BackupFilter),
            FileName = $"CineCatalog_Backup_{DateTime.Now:yyyyMMdd}.json"
        };

        return dialog.ShowDialog() == true ? dialog.FileName : null;
    }

    public string? OpenBackupFile()
    {
        var dialog = new OpenFileDialog
        {
            Title = "Importar Backup",
            Filter = string.Join("|", BackupFilter),
            CheckFileExists = true,
            Multiselect = false
        };

        return dialog.ShowDialog() == true ? dialog.FileName : null;
    }
}

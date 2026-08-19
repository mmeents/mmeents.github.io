using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace WeaversGuild.Publishing;

/// <summary>
/// Rebuilds stories/index.json by scanning the stories folder.
/// The index is always derived — never hand-edited — so adding a story
/// is just "write the json, rebuild, push".
/// Call Rebuild(siteRoot) at the end of the story export menu item.
/// </summary>
public static class IndexBuilder
{
    private static readonly JsonSerializerOptions Write = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    public static void Rebuild(string siteRoot)
    {
        var storiesDir = Path.Combine(siteRoot, "stories");
        Directory.CreateDirectory(storiesDir);

        var entries = new List<IndexEntry>();

        foreach (var path in Directory.EnumerateFiles(storiesDir, "*.json", SearchOption.AllDirectories))
        {
            if (string.Equals(Path.GetFileName(path), "index.json", StringComparison.OrdinalIgnoreCase))
                continue;

            JsonNode? node;
            try { node = JsonNode.Parse(File.ReadAllText(path)); }
            catch (JsonException) { continue; }   // skip anything malformed
            if (node is null) continue;

            // slug is the path under stories/, minus .json, forward-slashed
            var slug = Path.GetRelativePath(storiesDir, path)
                           .Replace(Path.DirectorySeparatorChar, '/');
            slug = slug[..^".json".Length];

            var description = node["description"]?.GetValue<string>() ?? "";
            var scenes = node["scenes"] as JsonArray;

            var text = scenes is { Count: > 0 }
                ? string.Join("\n\n", scenes.Select(s => s?["body"]?.GetValue<string>() ?? ""))
                : description;

            entries.Add(new IndexEntry
            {
                Slug      = slug,
                Name      = node["name"]?.GetValue<string>() ?? Path.GetFileNameWithoutExtension(path),
                Realm     = node["realm"]?.GetValue<string>() ?? slug.Split('/')[0],
                Published = node["published"]?.GetValue<string>(),
                Blurb     = Blurb(description),
                Words     = WordCount(text),
                Scenes    = scenes?.Count ?? 0,
                Machines  = Machines(node["credits"])
            });
        }

        var payload = new
        {
            generated = DateTime.UtcNow.ToString("O"),
            stories = entries
                .OrderByDescending(e => e.Published ?? "")
                .ThenBy(e => e.Name)
                .ToList()
        };

        File.WriteAllText(Path.Combine(storiesDir, "index.json"),
                          JsonSerializer.Serialize(payload, Write));
    }

    private static string Normalize(string s) =>
        s.Replace("\r\n", "\n").Replace("\r", "\n").Trim();

    private static int WordCount(string s)
    {
        var t = Normalize(s);
        return t.Length == 0
            ? 0
            : t.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;
    }

    /// <summary>First sentence or two of the rollup, for the shelf.</summary>
    private static string Blurb(string description, int max = 200)
    {
        var first = Normalize(description).Split("\n\n", 2)[0].Replace("\n", " ");
        if (first.Length <= max) return first;
        var cut = first.LastIndexOf(' ', max);
        return first[..(cut > 0 ? cut : max)].TrimEnd(',', ';', ':') + "…";
    }

    /// <summary>Distinct hosts, so the shelf can show how many machines wove it.</summary>
    private static List<string> Machines(JsonNode? credits)
    {
        if (credits is not JsonArray arr) return [];
        return arr.Select(c => c?["host"]?.GetValue<string>())
                  .Where(h => !string.IsNullOrWhiteSpace(h))
                  .Select(h => h!)
                  .Distinct(StringComparer.OrdinalIgnoreCase)
                  .OrderBy(h => h)
                  .ToList();
    }

    private sealed class IndexEntry
    {
        [JsonPropertyName("slug")]      public string Slug { get; init; } = "";
        [JsonPropertyName("name")]      public string Name { get; init; } = "";
        [JsonPropertyName("realm")]     public string Realm { get; init; } = "";
        [JsonPropertyName("published")] public string? Published { get; init; }
        [JsonPropertyName("blurb")]     public string Blurb { get; init; } = "";
        [JsonPropertyName("words")]     public int Words { get; init; }
        [JsonPropertyName("scenes")]    public int Scenes { get; init; }
        [JsonPropertyName("machines")]  public List<string> Machines { get; init; } = [];
    }
}

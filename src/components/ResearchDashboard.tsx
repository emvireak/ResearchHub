import { useState } from "react";
import { Search, Globe, Map, LogOut, Loader2, ExternalLink, Copy, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { firecrawl, type ScrapeResult, type SearchResultItem, type ScrapeFormat } from "@/lib/firecrawl-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResearchDashboardProps {
  onDisconnect: () => void;
}

export default function ResearchDashboard({ onDisconnect }: ResearchDashboardProps) {
  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-foreground">Research Dashboard</h2>
            <p className="mt-1 text-xs text-muted-foreground font-mono">Firecrawl connected</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onDisconnect} className="gap-2 text-muted-foreground">
            <LogOut size={14} />
            Disconnect
          </Button>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="mb-6 bg-secondary/50 border border-border">
            <TabsTrigger value="search" className="gap-2 font-mono text-xs">
              <Search size={12} />
              Search
            </TabsTrigger>
            <TabsTrigger value="scrape" className="gap-2 font-mono text-xs">
              <Globe size={12} />
              Scrape
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2 font-mono text-xs">
              <Map size={12} />
              Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <SearchPanel />
          </TabsContent>
          <TabsContent value="scrape">
            <ScrapePanel />
          </TabsContent>
          <TabsContent value="map">
            <MapPanel />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrapeContent, setScrapeContent] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || trimmed.length > 500) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await firecrawl.search(trimmed, 10, scrapeContent);
      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setError(res.error || "Search failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <Input
          placeholder="Search the web..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 font-mono text-sm bg-background"
          maxLength={500}
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap">
          <input
            type="checkbox"
            checked={scrapeContent}
            onChange={(e) => setScrapeContent(e.target.checked)}
            className="rounded border-border"
          />
          Include content
        </label>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Search
        </Button>
      </form>

      {error && <ErrorMessage message={error} />}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/20">
              <div className="mb-2 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground truncate">{item.title}</h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-xs text-terminal truncate hover:underline"
                  >
                    {item.url}
                    <ExternalLink size={10} className="flex-shrink-0" />
                  </a>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
              {item.markdown && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-mono text-terminal">View content</summary>
                  <div className="mt-2 max-h-60 overflow-auto rounded border border-border bg-background p-3 prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.markdown}</ReactMarkdown>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <EmptyState message="No results found" />
      )}
    </div>
  );
}

function ScrapePanel() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScrapeResult["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formats, setFormats] = useState<ScrapeFormat[]>(["markdown", "links"]);
  const [copied, setCopied] = useState(false);

  const toggleFormat = (f: ScrapeFormat) => {
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || trimmed.length > 2000) return;
    if (formats.length === 0) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await firecrawl.scrape(trimmed, formats);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error || "Scrape failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatOptions: { value: ScrapeFormat; label: string }[] = [
    { value: "markdown", label: "Markdown" },
    { value: "html", label: "HTML" },
    { value: "links", label: "Links" },
    { value: "summary", label: "Summary" },
    { value: "screenshot", label: "Screenshot" },
  ];

  return (
    <div>
      <form onSubmit={handleScrape} className="mb-4 flex gap-3">
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 font-mono text-sm bg-background"
          maxLength={2000}
        />
        <Button type="submit" disabled={loading || formats.length === 0} className="gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
          Scrape
        </Button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {formatOptions.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => toggleFormat(f.value)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
              formats.includes(f.value)
                ? "border-primary/40 bg-primary/10 text-terminal"
                : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} />}

      {result && (
        <div className="space-y-4">
          {result.metadata && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-medium text-foreground">{result.metadata.title || "Untitled"}</h3>
              {result.metadata.description && (
                <p className="text-xs text-muted-foreground">{result.metadata.description}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground font-mono">
                {result.metadata.statusCode && <span>Status: {result.metadata.statusCode}</span>}
                {result.metadata.language && <span>Lang: {result.metadata.language}</span>}
              </div>
            </div>
          )}

          {result.summary && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText size={14} className="text-terminal" />
                <span className="text-xs font-mono font-medium text-foreground">Summary</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
            </div>
          )}

          {result.markdown && (
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="text-xs font-mono text-muted-foreground">Markdown Content</span>
                <button
                  onClick={() => handleCopy(result.markdown || "")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check size={12} className="text-terminal" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="max-h-96 overflow-auto p-4 prose prose-sm prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.markdown}</ReactMarkdown>
              </div>
            </div>
          )}

          {result.screenshot && (
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="mb-2 block text-xs font-mono text-muted-foreground">Screenshot</span>
              <img
                src={`data:image/png;base64,${result.screenshot}`}
                alt="Page screenshot"
                className="w-full rounded border border-border"
              />
            </div>
          )}

          {result.links && result.links.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="mb-2 block text-xs font-mono text-muted-foreground">
                Links ({result.links.length})
              </span>
              <div className="max-h-60 overflow-auto space-y-1">
                {result.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-terminal truncate hover:underline"
                  >
                    {link}
                    <ExternalLink size={10} className="flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MapPanel() {
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMap = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || trimmed.length > 2000) return;

    setLoading(true);
    setError("");
    setLinks([]);

    try {
      const res = await firecrawl.map(trimmed, search.trim() || undefined, 200);
      if (res.success && res.links) {
        setLinks(res.links);
      } else {
        setError(res.error || "Map failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleMap} className="mb-6 space-y-3">
        <div className="flex gap-3">
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 font-mono text-sm bg-background"
            maxLength={2000}
          />
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Map size={14} />}
            Map
          </Button>
        </div>
        <Input
          placeholder="Filter by keyword (optional)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="font-mono text-sm bg-background"
          maxLength={200}
        />
      </form>

      {error && <ErrorMessage message={error} />}

      {links.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="mb-3 block text-xs font-mono text-muted-foreground">
            Discovered {links.length} URLs
          </span>
          <div className="max-h-96 overflow-auto space-y-1">
            {links.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 py-0.5 text-xs text-terminal truncate hover:underline"
              >
                <span className="w-8 flex-shrink-0 text-right text-muted-foreground font-mono">{i + 1}.</span>
                {link}
                <ExternalLink size={10} className="flex-shrink-0 opacity-0 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
      <p className="text-xs text-destructive">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

const FIRECRAWL_API = "https://api.firecrawl.dev/v1";

function getApiKey(): string {
  const key = localStorage.getItem("firecrawl_api_key");
  if (!key) throw new Error("Firecrawl API key not configured");
  return key;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

export type ScrapeFormat = "markdown" | "html" | "links" | "screenshot" | "summary";

export interface ScrapeResult {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    links?: string[];
    screenshot?: string;
    summary?: string;
    metadata?: {
      title?: string;
      description?: string;
      language?: string;
      sourceURL?: string;
      statusCode?: number;
    };
  };
  error?: string;
}

export interface SearchResultItem {
  url: string;
  title: string;
  description: string;
  markdown?: string;
}

export interface SearchResult {
  success: boolean;
  data?: SearchResultItem[];
  error?: string;
}

export interface MapResult {
  success: boolean;
  links?: string[];
  error?: string;
}

export const firecrawl = {
  hasKey(): boolean {
    return Boolean(localStorage.getItem("firecrawl_api_key"));
  },

  setKey(key: string) {
    localStorage.setItem("firecrawl_api_key", key.trim());
  },

  removeKey() {
    localStorage.removeItem("firecrawl_api_key");
  },

  async scrape(
    url: string,
    formats: ScrapeFormat[] = ["markdown"],
    onlyMainContent = true
  ): Promise<ScrapeResult> {
    const res = await fetch(`${FIRECRAWL_API}/scrape`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        url: normalizeUrl(url),
        formats,
        onlyMainContent,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || `Request failed (${res.status})` };
    }
    return json;
  },

  async search(
    query: string,
    limit = 10,
    scrapeContent = false
  ): Promise<SearchResult> {
    const body: Record<string, unknown> = { query, limit };
    if (scrapeContent) {
      body.scrapeOptions = { formats: ["markdown"] };
    }
    const res = await fetch(`${FIRECRAWL_API}/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || `Request failed (${res.status})` };
    }
    return json;
  },

  async map(
    url: string,
    search?: string,
    limit = 100
  ): Promise<MapResult> {
    const res = await fetch(`${FIRECRAWL_API}/map`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        url: normalizeUrl(url),
        search,
        limit,
        includeSubdomains: false,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || `Request failed (${res.status})` };
    }
    return json;
  },
};

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

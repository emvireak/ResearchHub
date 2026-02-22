const asciiArt = `██████╗ ███████╗███████╗███████╗ █████╗ ██████╗  ██████╗██╗  ██╗
██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██║  ██║
██████╔╝█████╗  ███████╗█████╗  ███████║██████╔╝██║     ███████║
██╔══██╗██╔══╝  ╚════██║██╔══╝  ██╔══██║██╔══██╗██║     ██╔══██║
██║  ██║███████╗███████║███████╗██║  ██║██║  ██║╚██████╗██║  ██║
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝`;

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-12 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <pre className="mb-4 overflow-x-auto font-mono text-[8px] leading-tight text-terminal sm:text-[10px] lg:text-xs scrollbar-hide select-none animate-fade-in-up">
              {asciiArt}
            </pre>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              Content Research Hub
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h1 className="mb-4 text-2xl font-medium leading-relaxed text-foreground sm:text-3xl lg:text-4xl">
              Search, scrape, and analyze any website. Powered by Firecrawl.
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Extract structured content, discover sitemaps, and research the web
              with a professional-grade toolkit built on the Firecrawl API.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

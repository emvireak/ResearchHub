import { useState } from "react";
import { KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firecrawl } from "@/lib/firecrawl-client";

interface ApiKeySetupProps {
  onKeySet: () => void;
}

export default function ApiKeySetup({ onKeySet }: ApiKeySetupProps) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError("API key is required");
      return;
    }
    if (trimmed.length < 10) {
      setError("Invalid API key format");
      return;
    }

    setLoading(true);
    setError("");

    firecrawl.setKey(trimmed);

    try {
      const result = await firecrawl.search("test", 1);
      if (!result.success && result.error) {
        firecrawl.removeKey();
        setError("Invalid API key. Please check and try again.");
        setLoading(false);
        return;
      }
      onKeySet();
    } catch {
      firecrawl.removeKey();
      setError("Could not verify API key. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-lg">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <KeyRound size={20} className="text-terminal" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">Connect Firecrawl</h2>
              <p className="text-xs text-muted-foreground">Enter your API key to start researching</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="fc-xxxxxxxxxxxxxxxxxxxxxxxx"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError("");
                }}
                className="font-mono text-sm bg-background"
                autoComplete="off"
              />
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? "Verifying..." : "Connect"}
              {!loading && <ArrowRight size={14} />}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
            <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-terminal" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
              Get a free key at{" "}
              <a
                href="https://www.firecrawl.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal underline underline-offset-2"
              >
                firecrawl.dev
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

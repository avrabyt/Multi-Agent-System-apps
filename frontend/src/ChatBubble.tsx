import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import brain from "brain";
import { Brain, Loader2, SendHorizontal } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export interface Props {
  title?: string;
  placeholder?: string;
}

export function ChatBubble({
  title = "Research Assistant",
  placeholder = "Ask me anything...",
}: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ query: string; response?: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { query }]);
    setIsLoading(true);

    try {
      const response = await brain.run_research_team({ query, max_stories: 2 });
      const data = await response.json();
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, response: data.summary } : msg,
        ),
      );
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? {
                ...msg,
                response:
                  "Sorry, an error occurred while processing your request.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Brain className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[400px] p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            {title}
          </SheetTitle>
        </SheetHeader>

        {/* Chat Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ height: "calc(100vh - 180px)" }}
        >
          {messages.map((message, index) => (
            <div key={index} className="space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  {message.query}
                </div>
              </div>

              {/* Assistant Response */}
              {message.response && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] prose dark:prose-invert">
                    <ReactMarkdown>{message.response}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Researching...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
          <Input
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SendHorizontal className="w-4 h-4" />
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

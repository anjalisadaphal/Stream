import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const initialMessages = [
  {
    role: "assistant",
    content: "Hello! I'm your STREAM assistant. I can help you understand our career assessment platform, explain features, and answer questions about Programming, Analytics, and Testing careers. How can I assist you today?",
  },
];

export function Chatbot({ isMinimized, onToggle, onClose }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { getChatbotResponse } = await import("@/services/aiService");
      const response = await getChatbotResponse([...messages, userMessage]);
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      
      // Use fallback responses for better UX
      const { getFallbackResponse } = await import("@/services/chatbotFallback");
      const fallbackMessage = getFallbackResponse(userMessage.content);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What is STREAM?",
    "How does the assessment work?",
    "What careers can I explore?",
    "How long does the quiz take?",
  ];

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300",
        isMinimized ? "w-80 h-14" : "w-96 h-[600px]"
      )}
    >
      <Card className="h-full flex flex-col shadow-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">STREAM Assistant</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggle}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setMessages(initialMessages);
                onClose?.();
              }}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[80%]",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <div className="w-4 h-4 rounded-full bg-accent" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {messages.length === 1 && (
              <div className="px-4 pb-2 border-t pt-2">
                <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1 px-2"
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => handleSend(), 100);
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export function ChatbotButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 bg-gradient-to-r from-primary to-accent"
      title="Chat with STREAM Assistant"
    >
      <Bot className="h-6 w-6" />
      <span className="sr-only">Open Chatbot</span>
    </Button>
  );
}


'use client'
import { useState, useRef, useEffect } from 'react';
import { Bot, Sun, Moon, Plus, Send, User, Loader2, Sparkles, Menu, MessageSquare } from 'lucide-react';

const suggestedPrompts = [
  "Write a blog post about AI productivity",
  "Create a social media strategy",
  "Help me brainstorm content ideas",
  "Draft a professional email",
  "Generate creative writing prompts"
];

// This is the single, main component for the entire application.
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Use a local theme state and sync it with the DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('chat-history');
      if (storedHistory) {
        let parsedHistory = JSON.parse(storedHistory);
        // Filter out any corrupted sessions
        const validHistory = parsedHistory.filter(session => Array.isArray(session.messages));
        
        setChatSessions(validHistory);
        // Load the last chat session by default
        if (validHistory.length > 0) {
          setCurrentSessionId(validHistory[validHistory.length - 1].id);
        } else {
          // If no valid history, create a new empty session
          const newSession = { id: Date.now(), messages: [] };
          setChatSessions([newSession]);
          setCurrentSessionId(newSession.id);
        }
      } else {
        // If no history exists in localStorage, create the first session
        const newSession = { id: Date.now(), messages: [] };
        setChatSessions([newSession]);
        setCurrentSessionId(newSession.id);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage:", error);
      // Fallback to creating a new empty session on error
      const newSession = { id: Date.now(), messages: [] };
      setChatSessions([newSession]);
      setCurrentSessionId(newSession.id);
    }
  }, []);

  // Save chat history to localStorage whenever the history changes
  useEffect(() => {
    try {
      if (chatSessions.length > 0) {
        localStorage.setItem('chat-history', JSON.stringify(chatSessions));
      }
    } catch (error) {
      console.error("Failed to save chat history to localStorage:", error);
    }
  }, [chatSessions]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const messages = chatSessions.find(session => session.id === currentSessionId)?.messages || [];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {
    const newSession = { id: Date.now(), messages: [] };
    setChatSessions(prevSessions => [...prevSessions, newSession]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };
  
  const handleLoadSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    // Update messages in the current session
    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === currentSessionId
          ? { ...session, messages: [...(session.messages || []), userMessage] }
          : session
      )
    );

    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentInput,
          context: messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n')
        }),
      });

      if (!response.ok) {
        let errorMessageText = "Server returned an error. Please try again.";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessageText = `Server Error: ${errorData.error}`;
          }
        } catch (jsonError) {
          console.error("Failed to parse server error response:", jsonError);
        }

        const errorMessage = {
          id: (Date.now() + 1).toString(),
          content: errorMessageText,
          sender: "ai",
          timestamp: new Date(),
        };
        
        setChatSessions(prevSessions =>
          prevSessions.map(session =>
            session.id === currentSessionId
              ? { ...session, messages: [...(session.messages || []), errorMessage] }
              : session
          )
        );
        return;
      }

      const responseData = await response.json();
      
      const finalContent = responseData.finalAnswer;

      if (!finalContent || finalContent.length === 0) {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          content: "Sorry, the AI models are currently unable to generate a response. Please try again in a moment.",
          sender: "ai",
          timestamp: new Date(),
        };
        
        setChatSessions(prevSessions =>
          prevSessions.map(session =>
            session.id === currentSessionId
              ? { ...session, messages: [...(session.messages || []), errorMessage] }
              : session
          )
        );
        return;
      }
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: finalContent,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === currentSessionId
            ? { ...session, messages: [...(session.messages || []), aiMessage] }
            : session
        )
      );
      
    } catch (error) {
      console.error('Error calling API:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to the server. Please check your network and try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === currentSessionId
            ? { ...session, messages: [...(session.messages || []), errorMessage] }
            : session
          )
        );
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptSelect = (prompt) => {
    setInput(prompt);
  };
  
  // A robust markdown renderer to format the AI's responses
  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];

    lines.forEach((line, index) => {
      // Check for headings
      const headingMatch = line.match(/^(#+)\s(.+)/);
      if (headingMatch) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${index - listItems.length}`} className="my-2 ml-4 list-disc space-y-1">{listItems}</ul>);
          listItems = [];
        }
        const level = headingMatch[1].length;
        const headingText = headingMatch[2];
        if (level === 1) elements.push(<h1 key={index} className="text-2xl font-bold my-4">{headingText}</h1>);
        if (level === 2) elements.push(<h2 key={index} className="text-xl font-semibold my-3">{headingText}</h2>);
        if (level >= 3) elements.push(<h3 key={index} className="text-lg font-medium my-2">{headingText}</h3>);
        return;
      }

      // Check for lists
      const listMatch = line.match(/^(\*|-)\s(.+)/);
      if (listMatch) {
        const itemText = listMatch[2];
        listItems.push(<li key={index} className="text-sm">{itemText}</li>);
        return;
      }
      
      // Check for horizontal rule
      const hrMatch = line.match(/^---/);
      if (hrMatch) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${index - listItems.length}`} className="my-2 ml-4 list-disc space-y-1">{listItems}</ul>);
          listItems = [];
        }
        elements.push(<hr key={index} className="my-4 border-t border-border" />);
        return;
      }

      // Handle plain text and inline formatting
      let processedText = line;
      // Bold
      processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Inline code
      processedText = processedText.replace(/`(.*?)`/g, '<code>$1</code>');
      
      if (listItems.length > 0) {
        elements.push(<ul key="final-list" className="my-2 ml-4 list-disc space-y-1">{listItems}</ul>);
      }
      if (processedText.trim()) {
        elements.push(<p key={index} className="mb-2 text-sm" dangerouslySetInnerHTML={{ __html: processedText }} />);
      }
    });

    if (listItems.length > 0) {
      elements.push(<ul key="final-list" className="my-2 ml-4 list-disc space-y-1">{listItems}</ul>);
    }

    return <>{elements}</>;
  };

  const MessageBubble = ({ message }) => (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className={`flex max-w-[80%] space-x-3 ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
        <div className={`flex-shrink-0 p-2 rounded-lg ${
            message.sender === "user" 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {message.sender === "user" ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div className={`p-4 rounded-2xl shadow-md ${
            message.sender === "user"
              ? "bg-primary text-primary-foreground dark:bg-blue-600 dark:text-white"
              : "bg-card border border-border"
          }`}
        >
          {message.sender === "user" ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            renderMarkdown(message.content)
          )}
          <p className={`text-xs mt-2 ${
              message.sender === "user" 
                ? "text-primary-foreground/70 dark:text-gray-200" 
                : "text-muted-foreground"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-background">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 p-4 flex flex-col justify-between 
                   bg-card border-r border-border transform transition-transform duration-300 ease-in-out 
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                   md:relative md:w-64 md:translate-x-0 md:flex md:flex-shrink-0`}
      >
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground">
              <Bot className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">Flowa AI</h1>
          </div>
          <button 
            onClick={handleNewChat}
            className="w-full justify-start border border-border bg-secondary text-secondary-foreground hover:bg-muted p-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
          
          <ul className="mt-4 space-y-2">
            {chatSessions.length > 0 && chatSessions.map(session => (
              <li key={session.id}>
                <button
                  onClick={() => handleLoadSession(session.id)}
                  className={`w-full justify-start text-left p-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 
                    ${session.id === currentSessionId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                  `}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="truncate">{session.messages.length > 0 ? session.messages[0].content : "New Chat"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center p-4 border-t border-border">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-card border-b border-border py-4 px-6 flex items-center space-x-3 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-card-foreground">AI Chat Assistant</h2>
        </header>

        <div className="flex-1 p-8 overflow-y-auto w-full">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-secondary rounded-2xl mb-4 text-secondary-foreground">
                <Sparkles className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start a conversation with Flowa AI
              </h3>
              <p className="text-muted-foreground mb-8">
                Choose a prompt below or type your own message to begin
              </p>
              
              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptSelect(prompt)}
                    className="p-4 text-left bg-card border border-border hover:border-primary/50 rounded-xl transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="flex items-start space-x-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5 group-hover:text-primary transition-colors" />
                      <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] space-x-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-secondary">
                      <Bot className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="p-4 rounded-2xl shadow-md bg-card border border-border">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4 w-full">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message to Flowa AI..."
              className="flex-1 bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-primary text-primary-foreground p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/80"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

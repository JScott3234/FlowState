import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Link2, Loader2, ExternalLink } from 'lucide-react';
import { useFlowBot } from '../hooks/useFlowBot';
import { cn } from '../lib/utils';

export const Flow = () => {
    const { messages, sendMessage, isTyping } = useFlowBot();
    const [inputValue, setInputValue] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Check if this is the initial state (only the welcome message)
    const isInitialState = messages.length === 1 && messages[0].role === 'bot';

    return (
        <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Chat Container */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10"
            >
                {isInitialState ? (
                    /* Initial Welcome State */
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                            Welcome to Flow
                        </h1>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            I can read and summarize web pages for you. Just provide up to <strong className="text-blue-400">two links</strong> and I'll extract the key information.
                        </p>

                        {/* Example prompts */}
                        <div className="grid gap-3 w-full max-w-md">
                            <button
                                onClick={() => setInputValue('Summarize https://example.com')}
                                className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all text-left"
                            >
                                <Link2 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                <span className="text-slate-300 group-hover:text-white transition-colors">
                                    "Summarize this article for me..."
                                </span>
                            </button>
                            <button
                                onClick={() => setInputValue('Compare these two pages: ')}
                                className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all text-left"
                            >
                                <ExternalLink className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                                <span className="text-slate-300 group-hover:text-white transition-colors">
                                    "Compare these two pages..."
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Chat Messages */
                    <div className="max-w-3xl mx-auto space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    msg.role === 'user'
                                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-sm shadow-lg shadow-blue-500/20"
                                        : "bg-white/5 text-slate-200 border border-white/10 rounded-tl-sm backdrop-blur-sm"
                                )}>
                                    {msg.role === 'bot' && (
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <Sparkles className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-400">Flow</span>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <Loader2 className="w-3 h-3 text-white animate-spin" />
                                        </div>
                                        <span className="text-sm text-slate-400 italic">Reading and analyzing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Paste a link or ask me anything..."
                                rows={1}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-200 flex items-center justify-center",
                                inputValue.trim()
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
                                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                            )}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 text-center">
                        Flow can read up to 2 links per message
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Flow;

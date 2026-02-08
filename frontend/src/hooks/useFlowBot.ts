import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { agentAPI } from '../api/flowstate';
import { useAuth } from '../contexts/AuthContext';

export interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
}

export function useFlowBot() {
    const { email } = useAuth();
    const { socketId, lastMessage } = useWebSocket();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'bot', content: "Hello! I can help you organize your schedule or read web pages for you. How can I help you flow today?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    // Initial greeting or persistence could go here

    useEffect(() => {
        if (!lastMessage) return;

        if (lastMessage.type === 'flowbot_status') {
            if (lastMessage.status === 'thinking') {
                setIsTyping(true);
            }
        } else if (lastMessage.type === 'flowbot_result') {
            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'bot', content: lastMessage.response }]);
        } else if (lastMessage.type === 'flowbot_error') {
            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'bot', content: `Error: ${lastMessage.error}` }]);
        }
    }, [lastMessage]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || !email) return;

        // Add user message to UI
        const userMsg: ChatMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);

        try {
            // Trigger backend agent
            await agentAPI.chat(text, email, socketId);
        } catch (error) {
            console.error("Failed to send message to FlowBot:", error);
            setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I encountered an error connecting to the agent." }]);
        }
    }, [email, socketId]);

    const clearHistory = useCallback(() => {
        setMessages([
            { role: 'bot', content: "Hello! History cleared. How can I help you flow today?" }
        ]);
    }, []);

    return {
        messages,
        sendMessage,
        isTyping,
        clearHistory
    };
}

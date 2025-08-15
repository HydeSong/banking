import React, { useState } from 'react';

// 定义消息类型
type Message = {
    text: string;
    sender: 'user' | 'bot';
};

const Chatbot = () => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hi! I'm here to help. What can I do for you?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');

    const quickResponses = {
        'hello': 'Hello! How can I assist you today?',
        'hi': 'Hello! How can I assist you today?',
        'help': 'I can help you with account information, transactions, and general banking questions.',
        'account': 'For account information, I can help you check your balance or recent transactions. What would you like to know?',
        'balance': 'To check your account balance, you would typically need to log in to your online banking portal or mobile app.',
        'transaction': 'To view recent transactions, please log in to your online banking portal or mobile app.',
        'loan': 'For loan information, I recommend speaking with one of our loan specialists. Would you like me to connect you with one?',
        'credit card': 'For credit card inquiries, I can help with general questions. For specific account details, please check your online banking.',
        'mortgage': 'Our mortgage team can help you with home loan options. Would you like me to transfer you to a mortgage specialist?',
        'contact': 'You can reach our customer service at 1-800-123-4567 or visit our website for more contact options.'
    } as const;

    const sendMessage = () => {
        if (input.trim() === '') return;

        // Add user message
        const userMessage: Message = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Check for quick response
        const lowerInput = input.toLowerCase();
        let response = "I understand you're asking about that. Let me connect you with a human agent.";

        const keys = Object.keys(quickResponses) as (keyof typeof quickResponses)[];
        for (const key of keys) {
            if (lowerInput.includes(key)) {
                response = quickResponses[key];
                break;
            }
        }

        // Add bot response after a short delay
        setTimeout(() => {
            const botMessage: Message = { text: response, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        }, 500);
    };

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', margin: '16px' }}>
            <div style={{ height: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            textAlign: msg.sender === 'user' ? 'right' : 'left',
                            margin: '8px 0',
                            marginLeft: msg.sender === 'user' ? 'auto' : '0',
                            marginRight: msg.sender === 'user' ? '0' : 'auto',
                            display: 'block',
                            width: 'fit-content',
                            maxWidth: '80%',
                            clear: 'both',
                            backgroundColor: msg.sender === 'user' ? '#007bff' : '#f1f1f1',
                            color: msg.sender === 'user' ? 'white' : 'black',
                            padding: '8px 12px',
                            borderRadius: '12px',
                        }}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button
                    onClick={sendMessage}
                    style={{ marginLeft: '8px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
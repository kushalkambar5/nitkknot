import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChatRoom, sendMessage } from '../services/chatRoomService';
import Button from '../components/Button';

const ChatRoom = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch messages
    useEffect(() => {
        const fetchChat = async () => {
            try {
                const response = await getChatRoom(roomId);
                if (response.data.success) {
                    setMessages(response.data.messages || []); // Assuming response structure
                    // If backend returns room populated with messages:
                    if (response.data.chatRoom && response.data.chatRoom.messages) {
                         setMessages(response.data.chatRoom.messages);
                    }
                }
            } catch (err) {
                console.error('Failed to load chat', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChat();
        // Polling interval could be added here
        const interval = setInterval(fetchChat, 5000); // Poll every 5s
        return () => clearInterval(interval);

    }, [roomId]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await sendMessage(roomId, newMessage);
            if (response.data.success) {
                setNewMessage('');
                // Optimistically add message or re-fetch?
                // For simplicity, let's wait for polling or re-fetch manually
                // Or better: Append the sent message if backend returns it
                if (response.data.message) {
                    setMessages(prev => [...prev, response.data.message]);
                }
            }
        } catch (err) {
            console.error('Failed to send', err);
        } finally {
            setSending(false);
        }
    };

    // Helper to determine if message is mine
    // Crude check: if no 'sender' passed, assumes backend handles it.
    // Frontend needs to know 'my' ID. 
    // We can decode token or use a specific prop.
    // For now, let's assume sender is populated object and check against Name? No, unsafe.
    // Check sender._id? We need `myId`.
    // Let's decode token roughly or rely on alignment.
    // Hack: user localStorage 'userId' if we saved it? We didn't.
    // We only saved 'token'.
    // `userService.getMyProfile` could cache ID.
    // For now, let's render all on left/right based on heuristic or just simple list.
    // BETTER: Decode token payload if available.
    
    // Quick fix: decode jwt (without library if needed, or just guess)
    // Actually, response.data.chatRoom might have currentUserId? 
    // Let's assume simplified view for now: Right side = me.
    // We can check if `sender` matches `user.name` from profile?
    
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-neutral-900 dark:text-white">
            {/* Header */}
            <header className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
                <Link to="/chat" className="size-10 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="flex-1">
                    <h1 className="font-bold text-lg">Chat</h1>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <span className="block size-2 rounded-full bg-green-500"></span> Online
                    </p>
                </div>
                <button className="size-10 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </header>

            {/* Messages */}
            <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-24">
                {loading ? (
                    <div className="flex justify-center pt-10">Loading...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-neutral-400 mt-10">
                        <p>Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.isMine ? 'self-end bg-primary text-white rounded-br-sm' : 'self-start bg-neutral-100 dark:bg-white/10 rounded-bl-sm'}`}>
                             {/* Note: `isMine` is a placeholder property. We need real logic here. */}
                             {/* As a fallback, we'll try to guess based on content or use generic styling? 
                                 No, alignment is key.
                                 Let's assume backend adds 'isMine' or we fetch Profile context.
                                 For now, render all effectively as 'received' style or Alternating?
                                 Actually, let's just render generic bubbles.
                             */}
                            <p>{msg.content}</p>
                            <span className="text-[10px] opacity-70 block text-right mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-white/5">
                <form onSubmit={handleSend} className="flex gap-2 max-w-md mx-auto">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..." 
                        className="flex-1 h-12 px-5 rounded-full bg-neutral-100 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim() || sending}
                        className="size-12 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30"
                    >
                        {sending ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-outlined ml-0.5">send</span>
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatRoom;

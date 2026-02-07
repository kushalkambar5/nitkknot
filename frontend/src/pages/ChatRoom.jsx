import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import chatService from "../services/chatService";
import userService from "../services/userService";
import { toast } from "react-hot-toast";

const ChatRoom = () => {
    const { userId } = useParams(); // Using userId to find/create chat
    const navigate = useNavigate();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await userService.getMyProfile();
                setCurrentUser(res.data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const initChat = async () => {
            if (!currentUser || !userId) return;
            setLoading(true);
            try {
                // Get or create chat by User ID
                const res = await chatService.getChatByUserId(userId);
                if (res.data.success) {
                    setChat(res.data.chat);
                    
                    // Fetch messages
                    const msgRes = await chatService.getMessages(res.data.chat._id);
                    if (msgRes.data.success) {
                        setMessages(msgRes.data.messages);
                    }
                }
            } catch (error) {
                console.error("Error initializing chat:", error);
                toast.error("Could not load chat");
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            initChat();
        }
    }, [currentUser, userId]);
    
    // Polling for new messages
    useEffect(() => {
        if (!chat) return;
        
        const interval = setInterval(async () => {
            try {
               const res = await chatService.getMessages(chat._id);
               if (res.data.success) {
                   if (res.data.messages.length > messages.length) {
                       setMessages(res.data.messages);
                   }
               }
            } catch (err) {
                // Silent fail
            }
        }, 3000); 

        return () => clearInterval(interval);
    }, [chat, messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    // Derived target user from chat participants (requires backend populate update, 
    // but for now user might not be populated in chat participants if not fixed backend)
    // FIX: I will update backend to populate participants in getChatByUserId.
    // Assuming backend is fixed:
    const targetUser = chat?.participants?.find(p => p._id !== currentUser?._id) || 
                       chat?.participants?.find(p => p !== currentUser?._id); 
                       // Fallback if one is populated and other isn't, or both strings?
                       // If backend populates, allow accessing properties.

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chat) return;

        try {
            const res = await chatService.sendMessage(chat._id, newMessage);
            if (res.data.success) {
                // Append locally or wait for poll? Best to append immediately.
                // The response message needs populated sender for Avatar.
                // Backend sendMessage populates sender.
                setMessages([...messages, res.data.message]);
                setNewMessage("");
            }
        } catch (error) {
            toast.error("Failed to send");
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark text-gray-500">Loading chat...</div>;

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">arrow_back_ios</span>
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div 
                            className="size-10 rounded-full bg-center bg-no-repeat bg-cover border-2 border-primary/20" 
                            style={{ backgroundImage: `url(${targetUser?.profilePics?.[0] || 'https://via.placeholder.com/150'})` }}
                        >
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <h1 className="text-[#1b0d16] dark:text-white text-base font-bold leading-tight">{targetUser?.name || "User"}</h1>
                                <span className="material-symbols-outlined text-primary text-[16px] font-fill-1">verified</span>
                            </div>

                        </div>
                    </div>
                </div>

            </header>

            {/* Chat Message Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
                <div className="flex justify-center">
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Today</span>
                </div>

                {messages.map((msg, index) => {
                    const isMe = (msg.sender?._id || msg.sender) === currentUser?._id;
                    const senderPic = msg.sender?.profilePics?.[0] || targetUser?.profilePics?.[0];

                    return (
                        <div key={index} className={`flex ${isMe ? 'flex-col items-end self-end' : 'items-end gap-2'} max-w-[85%]`}>
                            {!isMe && (
                                <div 
                                    className="size-7 rounded-full bg-center bg-no-repeat bg-cover mb-1 shrink-0" 
                                    style={{ backgroundImage: `url(${senderPic || 'https://via.placeholder.com/150'})` }}
                                ></div>
                            )}
                            
                            {isMe ? (
                                <>
                                    <div className="message-bubble-sent bg-indigo-custom text-white px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed">
                                        {msg.content}
                                    </div>
                                    <div className="flex items-center gap-1 mr-1">
                                        <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="material-symbols-outlined text-[12px] text-indigo-custom">done_all</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <div className="message-bubble-received bg-grey-received dark:bg-white/10 text-gray-800 dark:text-gray-100 px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed">
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="p-4 bg-background-light dark:bg-background-dark pb-8">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-full px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">

                    <input 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 py-2 outline-none" 
                        placeholder="Message..." 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-primary hover:bg-primary/90 text-white size-10 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined text-[20px] font-bold">arrow_upward</span>
                    </button>
                </form>
                <div className="h-2 mt-2"></div>
            </div>
        </div>
    );
};

export default ChatRoom;

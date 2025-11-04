import { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock, Mail, Phone } from 'lucide-react';

const GuestCommunicationHistory = ({ bookingId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [bookingId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/messages`);
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      sender: 'Admin',
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'email'
    };

    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      setMessages([...messages, { ...message, id: Date.now() }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold">Guest Communication</h3>
        </div>
        <span className="text-sm text-gray-500">{messages.length} messages</span>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${msg.sender === 'Admin' ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg p-3`}>
                <div className="flex items-center mb-1">
                  {msg.sender === 'Guest' ? (
                    <User className="w-4 h-4 mr-1 text-gray-600" />
                  ) : (
                    <User className="w-4 h-4 mr-1 text-blue-600" />
                  )}
                  <span className="text-sm font-medium">{msg.sender}</span>
                  {msg.type === 'email' && <Mail className="w-3 h-3 ml-2 text-gray-400" />}
                  {msg.type === 'phone' && <Phone className="w-3 h-3 ml-2 text-gray-400" />}
                </div>
                <p className="text-sm text-gray-800 mb-1">{msg.message}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestCommunicationHistory;

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const BookingNotesComments = ({ bookingId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [bookingId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/notes`);
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const note = {
      text: newNote,
      author: 'Admin',
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      const data = await response.json();
      setNotes([...notes, { ...note, id: data.id || Date.now() }]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleEditNote = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText })
      });
      setNotes(notes.map(note => note.id === id ? { ...note, text: editText } : note));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/notes/${id}`, {
        method: 'DELETE'
      });
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <FileText className="w-6 h-6 text-purple-600 mr-2" />
        <h3 className="text-xl font-bold">Booking Notes & Comments</h3>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
            placeholder="Add a note or comment..."
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAddNote}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNote(note.id)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="flex items-center px-3 py-1 border rounded text-sm hover:bg-gray-100"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{note.author}</p>
                      <p className="text-xs text-gray-500">{formatTimestamp(note.timestamp)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(note.id);
                          setEditText(note.text);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{note.text}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingNotesComments;

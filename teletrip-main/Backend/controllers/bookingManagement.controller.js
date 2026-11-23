const Booking = require('../models/booking.model');

exports.modifyBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { checkIn, checkOut, guests, rooms, specialRequests } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Safety guard for live supplier bookings
    if (booking.bookingReference && booking.status === 'confirmed' && (checkIn || checkOut || rooms)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Direct date or room modification is not allowed for confirmed supplier bookings. Please contact Bedsonline support or process a re-booking / cancellation to prevent supplier discrepancy.' 
      });
    }

    if (checkIn) booking.checkIn = checkIn;
    if (checkOut) booking.checkOut = checkOut;
    if (guests) booking.guests = guests;
    if (rooms) booking.rooms = rooms;
    if (specialRequests) booking.specialRequests = specialRequests;

    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json(booking.messages || []);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { sender, message, type } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (!booking.messages) booking.messages = [];
    
    const newMessage = {
      id: Date.now(),
      sender: sender || 'Admin',
      message,
      type: type || 'email',
      timestamp: new Date()
    };

    booking.messages.push(newMessage);
    await booking.save();

    res.json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json(booking.notes || []);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text, author } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (!booking.notes) booking.notes = [];
    
    const newNote = {
      id: Date.now(),
      text,
      author: author || 'Admin',
      timestamp: new Date()
    };

    booking.notes.push(newNote);
    await booking.save();

    res.json({ success: true, data: newNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { bookingId, noteId } = req.params;
    const { text } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const note = booking.notes.find(n => n.id == noteId);
    if (note) {
      note.text = text;
      await booking.save();
    }

    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { bookingId, noteId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    booking.notes = booking.notes.filter(n => n.id != noteId);
    await booking.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSpecialRequests = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    let requests = [];
    if (Array.isArray(booking.specialRequests)) {
      requests = booking.specialRequests;
    } else if (booking.specialRequests && typeof booking.specialRequests === 'object') {
      requests = Object.entries(booking.specialRequests).map(([key, val], idx) => ({
        id: idx + 1,
        request: `${key}: ${val}`,
        status: 'pending'
      }));
    } else if (typeof booking.specialRequests === 'string' && booking.specialRequests.trim()) {
      requests = [{ id: 1, request: booking.specialRequests, status: 'pending' }];
    }

    res.json(requests);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { bookingId, requestId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    let request = null;
    if (Array.isArray(booking.specialRequests)) {
      request = booking.specialRequests.find(r => r.id == requestId);
      if (request) {
        request.status = status;
        await booking.save();
      }
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTimeline = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json(booking.timeline || []);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection (In-memory mock for now if no URI is provided)
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_db';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Models
const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true } // In production, this should be hashed
});
const Admin = mongoose.model('Admin', AdminSchema);

const RoomSchema = new mongoose.Schema({
    roomNumber: String,
    block: String,
    capacity: Number,
    occupied: Number,
    status: String
});
const Room = mongoose.model('Room', RoomSchema);

// Routes
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    // Hardcoded auth for demo purposes if DB is empty
    if (username === 'admin' && password === 'admin') {
        const token = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1h' });
        return res.json({ token, message: 'Login successful' });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await Room.find();
        if(rooms.length === 0) {
            // Return mock data if db is empty
            return res.json([
                { _id: '1', roomNumber: '101', block: 'Block A', capacity: 2, occupied: 2, status: 'Full' },
                { _id: '2', roomNumber: '102', block: 'Block A', capacity: 2, occupied: 1, status: 'Partial' },
                { _id: '3', roomNumber: '103', block: 'Block B', capacity: 3, occupied: 0, status: 'Empty' }
            ]);
        }
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

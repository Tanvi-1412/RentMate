require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const initChatSocket = require('./sockets/chatSocket');
const { setIo } = require('./services/notificationService');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
const Category = require('./models/Category');

connectDB().then(async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: 'Electronics', slug: 'electronics', description: 'Calculators, lab devices, cables, gadgets' },
        { name: 'Books', slug: 'books', description: 'Academic textbooks, notes, reference guides' },
        { name: 'Furniture', slug: 'furniture', description: 'Study tables, chairs, bookshelves' },
        { name: 'Hostel Essentials', slug: 'hostel-essentials', description: 'Buckets, mattresses, lamps, organizers' },
        { name: 'Kitchen Items', slug: 'kitchen-items', description: 'Kettles, induction stoves, utensils' },
        { name: 'Clothing', slug: 'clothing', description: 'Formal wear, lab coats, aprons' },
        { name: 'Sports', slug: 'sports', description: 'Badminton rackets, footballs, cricket gear' },
        { name: 'Cycles', slug: 'cycles', description: 'Bicycles for campus commute' },
        { name: 'Study Materials', slug: 'study-materials', description: 'Drawings tools, drafters, sheets' },
        { name: 'Accessories', slug: 'accessories', description: 'Bags, watch, daily accessories' },
        { name: 'Other', slug: 'other', description: 'Miscellaneous student items' },
      ];
      await Category.insertMany(defaultCategories);
      console.log('[Seed] Default KITCOEK categories seeded successfully');
    }
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
});

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Pass socket instance to notification service
setIo(io);

// Initialize chat socket handlers
initChatSocket(io);

server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`  RentMate API Server Running    `);
  console.log(`  Port: ${PORT}                  `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================`);
});

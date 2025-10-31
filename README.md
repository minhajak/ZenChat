# Real-Time Chat Application 💬

A modern, full-stack real-time chat application built with the MERN stack, featuring instant messaging, online status tracking, and media sharing capabilities.

## ✨ Features

- **Real-time Messaging** - Instant message delivery using Socket.IO
- **Online Status Tracking** - See who's online in real-time
- **User Authentication** - Secure JWT-based authentication system
- **Profile Management** - Upload and update profile pictures
- **Media Sharing** - Share images, PDFs, and audio files
- **Online Filter** - Filter contacts to show only online users
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Modern UI** - Clean interface with DaisyUI components
- **Type-Safe** - Full TypeScript implementation

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **DaisyUI** - Component library
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icon library
- **React-hot-toast** - for sleek toast

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **TypeScript** - Type safety
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Cloudinary** - Media storage
- **Multer** - File upload handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Cloudinary account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables

**Backend (.env)**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_SECRET_KEY=your_jwt_secret
REFRESH_SECRET_KEY=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_CLIENT_URL=http://localhost:5000
```

4. Run the application
```bash
# Run backend (from backend directory)
npm run dev

# Run frontend (from frontend directory)
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

---

## 🌐 Hosted Links

| Component | Link |
|------------|------|
| **Client (Frontend)** | [https://zen-chat-app.netlify.app/friends] |
| **Server (Backend)** | [https://zenchat-0y88.onrender.com/] |


---


## 📁 Project Structure
```
chat-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── lib/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- Input validation and sanitization
- File type and size restrictions
- Secure HTTP headers

## 🎨 UI/UX Features

- Responsive mobile-first design
- Dark/Light theme support (via DaisyUI)
- Smooth transitions and animations
- Loading skeletons for better UX
- Real-time online status indicators
- Message read receipts (optional)

## 📱 Mobile Support

- Adaptive layout for mobile devices
- Touch-friendly interface
- Optimized performance for mobile networks
- Progressive Web App (PWA) ready

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👨‍💻 Author

minhaj ak - [@minhajak]

Project Link: [https://github.com/minhajak/ZenChat]

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [Cloudinary](https://cloudinary.com/) for media management
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [DaisyUI](https://daisyui.com/) for UI components
```


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authenticateJWT, authorizeRoles } from './middleware/auth.js';
import { telegramWebappLogin, adminLogin, getMe } from './controllers/auth.controller.js';
import {
  getAdminStats,
  getAllGroups,
  createGroup,
  assignGroupLeader,
  getAllLeaders,
  createLeader,
  getAllStudents,
  createStudent,
} from './controllers/admin.controller.js';
import {
  getLeaderGroups,
  getGroupStudents,
  markGroupAttendance,
  createGroupTask,
  gradeSubmission,
} from './controllers/leader.controller.js';
import {
  getStudentProfile,
  getStudentAttendance,
  getStudentTasks,
  submitTask,
} from './controllers/student.controller.js';
import { bot } from './bot/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'Student Management Platform',
  });
});

// Auth Routes
app.post('/api/v1/auth/telegram-login', telegramWebappLogin);
app.post('/api/v1/auth/admin-login', adminLogin);
app.get('/api/v1/auth/me', authenticateJWT, getMe);

// Admin Routes (SUPER_ADMIN only)
app.get('/api/v1/admin/stats', authenticateJWT, authorizeRoles('SUPER_ADMIN'), getAdminStats);
app.get('/api/v1/admin/groups', authenticateJWT, authorizeRoles('SUPER_ADMIN'), getAllGroups);
app.post('/api/v1/admin/groups', authenticateJWT, authorizeRoles('SUPER_ADMIN'), createGroup);
app.patch(
  '/api/v1/admin/groups/:groupId/leader',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN'),
  assignGroupLeader,
);
app.get('/api/v1/admin/leaders', authenticateJWT, authorizeRoles('SUPER_ADMIN'), getAllLeaders);
app.post('/api/v1/admin/leaders', authenticateJWT, authorizeRoles('SUPER_ADMIN'), createLeader);
app.get('/api/v1/admin/students', authenticateJWT, authorizeRoles('SUPER_ADMIN'), getAllStudents);
app.post('/api/v1/admin/students', authenticateJWT, authorizeRoles('SUPER_ADMIN'), createStudent);

// Group Leader Routes (GROUP_LEADER or SUPER_ADMIN)
app.get(
  '/api/v1/leader/groups',
  authenticateJWT,
  authorizeRoles('GROUP_LEADER', 'SUPER_ADMIN'),
  getLeaderGroups,
);
app.get(
  '/api/v1/leader/groups/:groupId/students',
  authenticateJWT,
  authorizeRoles('GROUP_LEADER', 'SUPER_ADMIN'),
  getGroupStudents,
);
app.post(
  '/api/v1/leader/attendance',
  authenticateJWT,
  authorizeRoles('GROUP_LEADER', 'SUPER_ADMIN'),
  async (req, res) => {
    await markGroupAttendance(req, res);
    io.emit('attendance_updated', { groupId: req.body.groupId, date: req.body.date });
  },
);
app.post(
  '/api/v1/leader/tasks',
  authenticateJWT,
  authorizeRoles('GROUP_LEADER', 'SUPER_ADMIN'),
  createGroupTask,
);
app.patch(
  '/api/v1/leader/submissions/:submissionId',
  authenticateJWT,
  authorizeRoles('GROUP_LEADER', 'SUPER_ADMIN'),
  gradeSubmission,
);

// Student Routes (STUDENT)
app.get('/api/v1/student/profile', authenticateJWT, getStudentProfile);
app.get('/api/v1/student/attendance', authenticateJWT, getStudentAttendance);
app.get('/api/v1/student/tasks', authenticateJWT, getStudentTasks);
app.post('/api/v1/student/submissions', authenticateJWT, submitTask);

// WebSocket Connections
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to WebSocket: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start Express + WebSocket Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // Start Telegram Bot in long polling mode for development
  if (
    process.env.TELEGRAM_BOT_TOKEN &&
    process.env.TELEGRAM_BOT_TOKEN !== '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ'
  ) {
    bot
      .start({
        onStart: (botInfo) => {
          console.log(`🤖 Telegram Bot @${botInfo.username} started successfully!`);
        },
      })
      .catch((err) => {
        console.warn('⚠️ Telegram Bot failed to start (Check BOT_TOKEN):', err.message);
      });
  } else {
    console.log('ℹ️ Running backend in standalone API mode (Telegram Bot token not set)');
  }
});

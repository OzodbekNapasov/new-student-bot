import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../prisma/client.js';
import bcrypt from 'bcryptjs';

// Get Admin Analytics Dashboard Stats
export async function getAdminStats(req: AuthRequest, res: Response) {
  try {
    const totalStudents = await prisma.student.count();
    const totalGroups = await prisma.group.count();
    const totalLeaders = await prisma.user.count({ where: { role: 'GROUP_LEADER' } });
    const totalTasks = await prisma.task.count();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendanceCount = await prisma.attendance.count({ where: { date: todayStr } });
    const todayPresentCount = await prisma.attendance.count({ where: { date: todayStr, status: 'PRESENT' } });

    const attendanceRate = todayAttendanceCount > 0 ? Math.round((todayPresentCount / todayAttendanceCount) * 100) : 0;

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalGroups,
        totalLeaders,
        totalTasks,
        todayAttendanceCount,
        attendanceRate,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
}

// Groups CRUD
export async function getAllGroups(req: AuthRequest, res: Response) {
  try {
    const groups = await prisma.group.findMany({
      include: {
        leader: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true, telegramId: true },
        },
        _count: {
          select: { students: true, tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, groups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch groups' });
  }
}

export async function createGroup(req: AuthRequest, res: Response) {
  try {
    const { name, code, faculty, academicYear, leaderId } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Group name and code are required' });
    }

    const existingGroup = await prisma.group.findFirst({
      where: { OR: [{ name }, { code }] },
    });

    if (existingGroup) {
      return res.status(400).json({ success: false, message: 'Group with this name or code already exists' });
    }

    const group = await prisma.group.create({
      data: {
        name,
        code,
        faculty: faculty || 'General',
        academicYear: academicYear ? parseInt(academicYear, 10) : 2024,
        leaderId: leaderId || null,
      },
      include: { leader: true },
    });

    return res.status(201).json({ success: true, group });
  } catch (error) {
    console.error('Create group error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create group' });
  }
}

export async function assignGroupLeader(req: AuthRequest, res: Response) {
  try {
    const { groupId } = req.params;
    const { leaderId } = req.body;

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (leaderId) {
      const leaderUser = await prisma.user.findUnique({ where: { id: leaderId } });
      if (!leaderUser) {
        return res.status(404).json({ success: false, message: 'Leader user not found' });
      }

      // Ensure user role is GROUP_LEADER
      await prisma.user.update({
        where: { id: leaderId },
        data: { role: 'GROUP_LEADER' },
      });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { leaderId: leaderId || null },
      include: { leader: true },
    });

    return res.json({ success: true, group: updatedGroup });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to assign group leader' });
  }
}

// Manage Group Leaders
export async function getAllLeaders(req: AuthRequest, res: Response) {
  try {
    const leaders = await prisma.user.findMany({
      where: { role: 'GROUP_LEADER' },
      include: {
        managedGroups: true,
      },
    });
    return res.json({ success: true, leaders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch leaders' });
  }
}

export async function createLeader(req: AuthRequest, res: Response) {
  try {
    const { firstName, lastName, phone, email, password, telegramId } = req.body;
    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, message: 'First name, email, and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const leader = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || '',
        phone: phone || null,
        email,
        password: hashedPassword,
        telegramId: telegramId ? telegramId.toString() : null,
        role: 'GROUP_LEADER',
      },
    });

    return res.status(201).json({ success: true, leader });
  } catch (error) {
    console.error('Create leader error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create leader. Email or Telegram ID may already exist.' });
  }
}

// Student Management (Admin)
export async function getAllStudents(req: AuthRequest, res: Response) {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, telegramId: true, username: true } },
        group: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
}

export async function createStudent(req: AuthRequest, res: Response) {
  try {
    const { firstName, lastName, phone, telegramId, groupId, studentCardNumber } = req.body;
    if (!firstName || !groupId) {
      return res.status(400).json({ success: false, message: 'First name and group ID are required' });
    }

    // Create User record for student
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || '',
        phone: phone || null,
        telegramId: telegramId ? telegramId.toString() : null,
        role: 'STUDENT',
      },
    });

    // Create Student record linked to group
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        groupId,
        studentCardNumber: studentCardNumber || `STD-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      include: {
        user: true,
        group: true,
      },
    });

    return res.status(201).json({ success: true, student });
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create student' });
  }
}

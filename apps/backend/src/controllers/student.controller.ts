import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../prisma/client.js';

export async function getStudentProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            telegramId: true,
            username: true,
          },
        },
        group: {
          include: {
            leader: {
              select: { id: true, firstName: true, lastName: true, phone: true, email: true },
            },
          },
        },
      },
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: 'Student profile not found for this user' });
    }

    return res.json({ success: true, student });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
}

export async function getStudentAttendance(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
      take: 60,
    });

    const totalDays = attendances.length;
    const presentDays = attendances.filter((a) => a.status === 'PRESENT').length;
    const absentDays = attendances.filter((a) => a.status === 'ABSENT').length;
    const excusedDays = attendances.filter((a) => a.status === 'EXCUSED').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    return res.json({
      success: true,
      stats: {
        totalDays,
        presentDays,
        absentDays,
        excusedDays,
        attendancePercentage,
      },
      attendances,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
}

export async function getStudentTasks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const tasks = await prisma.task.findMany({
      where: { groupId: student.groupId },
      include: {
        submissions: {
          where: { studentId: student.id },
        },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return res.json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
}

export async function submitTask(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { taskId, content, fileUrl } = req.body;

    if (!taskId || !content) {
      return res.status(400).json({ success: false, message: 'taskId and content required' });
    }

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const submission = await prisma.submission.upsert({
      where: {
        taskId_studentId: {
          taskId,
          studentId: student.id,
        },
      },
      update: {
        content,
        fileUrl: fileUrl || null,
        status: 'PENDING',
      },
      create: {
        taskId,
        studentId: student.id,
        content,
        fileUrl: fileUrl || null,
      },
    });

    return res.json({ success: true, submission });
  } catch (error) {
    console.error('Submit task error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit task' });
  }
}

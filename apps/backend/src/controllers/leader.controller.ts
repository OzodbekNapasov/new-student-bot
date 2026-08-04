import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../prisma/client.js';

// Get groups managed by the logged-in Group Leader
export async function getLeaderGroups(req: AuthRequest, res: Response) {
  try {
    const leaderId = req.user?.id;
    const groups = await prisma.group.findMany({
      where: { leaderId },
      include: {
        students: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, phone: true, telegramId: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });
    return res.json({ success: true, groups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch leader groups' });
  }
}

// Get group students with attendance statistics
export async function getGroupStudents(req: AuthRequest, res: Response) {
  try {
    const { groupId } = req.params;
    const leaderId = req.user?.id;

    // Verify leader manages this group (unless Super Admin)
    if (req.user?.role !== 'SUPER_ADMIN') {
      const group = await prisma.group.findFirst({
        where: { id: groupId, leaderId },
      });
      if (!group) {
        return res.status(403).json({ success: false, message: 'Access denied: You do not manage this group' });
      }
    }

    const students = await prisma.student.findMany({
      where: { groupId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, telegramId: true, username: true } },
        attendances: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
    });

    return res.json({ success: true, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch group students' });
  }
}

// Mark attendance for multiple students on a specific date
export async function markGroupAttendance(req: AuthRequest, res: Response) {
  try {
    const { groupId, date, records } = req.body;
    // records format: [{ studentId: "...", status: "PRESENT" | "ABSENT" | "EXCUSED" }]

    if (!groupId || !date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'groupId, date, and records array are required' });
    }

    const leaderId = req.user?.id;
    if (req.user?.role !== 'SUPER_ADMIN') {
      const group = await prisma.group.findFirst({ where: { id: groupId, leaderId } });
      if (!group) {
        return res.status(403).json({ success: false, message: 'Access denied to this group' });
      }
    }

    const results = [];
    for (const rec of records) {
      const attendance = await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: rec.studentId,
            date,
          },
        },
        update: {
          status: rec.status,
          markedById: leaderId!,
        },
        create: {
          studentId: rec.studentId,
          groupId,
          date,
          status: rec.status,
          markedById: leaderId!,
        },
      });
      results.push(attendance);
    }

    return res.json({ success: true, count: results.length, attendance: results });
  } catch (error) {
    console.error('Mark attendance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record attendance' });
  }
}

// Tasks Management for Group Leaders
export async function createGroupTask(req: AuthRequest, res: Response) {
  try {
    const { groupId, title, description, dueDate } = req.body;
    if (!groupId || !title || !description || !dueDate) {
      return res.status(400).json({ success: false, message: 'groupId, title, description, and dueDate required' });
    }

    const leaderId = req.user?.id;
    if (req.user?.role !== 'SUPER_ADMIN') {
      const group = await prisma.group.findFirst({ where: { id: groupId, leaderId } });
      if (!group) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const task = await prisma.task.create({
      data: {
        groupId,
        title,
        description,
        dueDate: new Date(dueDate),
        createdById: leaderId!,
      },
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create task' });
  }
}

export async function gradeSubmission(req: AuthRequest, res: Response) {
  try {
    const { submissionId } = req.params;
    const { status, grade } = req.body;

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status,
        grade: grade !== undefined ? parseFloat(grade) : undefined,
      },
      include: {
        student: { include: { user: true } },
        task: true,
      },
    });

    return res.json({ success: true, submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to grade submission' });
  }
}

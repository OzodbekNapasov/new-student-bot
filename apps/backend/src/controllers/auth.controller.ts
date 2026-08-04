import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../prisma/client.js';
import { verifyTelegramInitData } from '../utils/telegramAuth.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-2026';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function telegramWebappLogin(req: AuthRequest, res: Response) {
  try {
    const { initData, testTelegramId } = req.body;

    let telegramIdStr: string | null = null;
    let firstName = 'Student';
    let lastName = '';
    let username = '';

    if (initData) {
      const verified = verifyTelegramInitData(initData, TELEGRAM_BOT_TOKEN);
      if (!verified && process.env.NODE_ENV === 'production') {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid Telegram initData signature' });
      }
      if (verified?.user) {
        telegramIdStr = verified.user.id.toString();
        firstName = verified.user.first_name || 'Student';
        lastName = verified.user.last_name || '';
        username = verified.user.username || '';
      }
    }

    if (!telegramIdStr && testTelegramId) {
      telegramIdStr = testTelegramId.toString();
    }

    if (!telegramIdStr) {
      return res
        .status(400)
        .json({ success: false, message: 'Telegram User identification required' });
    }

    let user = await prisma.user.findUnique({
      where: { telegramId: telegramIdStr },
      include: {
        studentProfile: {
          include: { group: true },
        },
        managedGroups: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: telegramIdStr,
          firstName,
          lastName,
          username,
          role: 'STUDENT',
        },
        include: {
          studentProfile: { include: { group: true } },
          managedGroups: true,
        },
      });
    }

    const payload = {
      id: user.id,
      telegramId: user.telegramId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        studentProfile: user.studentProfile,
        managedGroups: user.managedGroups,
      },
    });
  } catch (error) {
    console.error('Telegram login error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error during authentication' });
  }
}

export async function adminLogin(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        managedGroups: true,
      },
    });

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'GROUP_LEADER') {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        managedGroups: user.managedGroups,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error during admin login' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: {
          include: {
            group: {
              include: {
                leader: true,
              },
            },
          },
        },
        managedGroups: {
          include: {
            students: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

import { NextResponse } from 'next/server';
import { hashPassword, setSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'node:crypto';

export async function POST(request: Request) {
  try {
    const { name, email, password, inviteCode, spaceName } = await request.json();
    const normalizedEmail = String(email ?? '').trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Tên, email và mật khẩu tối thiểu 8 ký tự là bắt buộc' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return NextResponse.json({ error: 'Email này đã được đăng ký' }, { status: 409 });

    // ------------------------------------------------------------------
    // Nếu có mã mời → ghép vào space có sẵn
    // ------------------------------------------------------------------
    if (inviteCode) {
      const space = await prisma.space.findUnique({
        where: { inviteCode: String(inviteCode).trim().toUpperCase() },
        include: { _count: { select: { members: true } } },
      });

      if (!space) {
        return NextResponse.json({ error: 'Mã mời không hợp lệ hoặc đã hết hạn' }, { status: 400 });
      }

      // Khóa: 1 space chỉ nhận tối đa 2 thành viên
      if (space._count.members >= 2) {
        return NextResponse.json(
          { error: 'Góc yêu thương này đã có đủ hai người rồi! ♥ Không thể thêm thành viên mới.' },
          { status: 409 },
        );
      }

      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          memberships: { create: { spaceId: space.id, role: 'PARTNER' } },
        },
        select: {
          id: true,
          name: true,
          email: true,
          memberships: { select: { role: true, space: { select: { id: true, name: true, inviteCode: true } } } },
        },
      });
      await setSession(user.id);
      const membership = user.memberships[0];
      return NextResponse.json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: membership.role,
            spaceId: membership.space.id,
            spaceName: membership.space.name,
            inviteCode: membership.space.inviteCode,
          },
        },
        { status: 201 },
      );
    }

    // ------------------------------------------------------------------
    // Không có mã mời → tạo space mới
    // Giới hạn: chỉ cho phép tạo tối đa 10 Space trên toàn hệ thống
    // (thực tế chỉ cần 1 cái, giới hạn này ngăn bot spam tạo account)
    // ------------------------------------------------------------------
    const totalSpaces = await prisma.space.count();
    if (totalSpaces >= 10) {
      return NextResponse.json(
        { error: 'Ứng dụng này là không gian riêng tư dành cho hai người, không mở đăng ký công khai. Liên hệ chủ ứng dụng để được mời vào!' },
        { status: 403 },
      );
    }

    const space = await prisma.space.create({
      data: {
        name: String(spaceName ?? '').trim() || 'Góc nhỏ của chúng mình',
        inviteCode: randomBytes(4).toString('hex').toUpperCase(),
      },
    });

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        memberships: { create: { spaceId: space.id, role: 'OWNER' } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        memberships: { select: { role: true, space: { select: { id: true, name: true, inviteCode: true } } } },
      },
    });
    await setSession(user.id);
    const membership = user.memberships[0];
    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: membership.role,
          spaceId: membership.space.id,
          spaceName: membership.space.name,
          inviteCode: membership.space.inviteCode,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Không thể tạo tài khoản' }, { status: 500 });
  }
}
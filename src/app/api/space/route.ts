import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 404 });

  const space = await prisma.space.findUnique({
    where: { id: user.spaceId },
    select: {
      id: true,
      name: true,
      inviteCode: true,
      birthday: true,
      anniversaryDate: true,
      members: { select: { role: true, user: { select: { id: true, name: true, email: true } } } },
    },
  });
  return NextResponse.json({ space, role: user.role });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 404 });
  if (user.role !== 'OWNER') return NextResponse.json({ error: 'Chỉ chủ space mới có thể chỉnh ngày sinh nhật' }, { status: 403 });

  try {
    const { birthday, anniversaryDate } = await request.json();
    const normalizedBirthday = birthday ? String(birthday).trim() : null;
    const normalizedAnniversary = anniversaryDate ? String(anniversaryDate).trim() : null;
    if (normalizedBirthday && !/^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthday)) {
      return NextResponse.json({ error: 'Ngày sinh không hợp lệ' }, { status: 400 });
    }
    if (normalizedAnniversary && !/^\d{4}-\d{2}-\d{2}$/.test(normalizedAnniversary)) {
      return NextResponse.json({ error: 'Ngày kỷ niệm không hợp lệ' }, { status: 400 });
    }
    const updatedSpace = await prisma.space.update({
      where: { id: user.spaceId },
      data: {
        ...(birthday !== undefined ? { birthday: normalizedBirthday } : {}),
        ...(anniversaryDate !== undefined ? { anniversaryDate: normalizedAnniversary } : {}),
      },
    });
    return NextResponse.json({ space: { birthday: updatedSpace.birthday, anniversaryDate: updatedSpace.anniversaryDate } });
  } catch {
    return NextResponse.json({ error: 'Không thể lưu ngày sinh nhật' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  try {
    const { inviteCode } = await request.json();
    const normalizedCode = String(inviteCode ?? '').trim().toUpperCase();
    if (!normalizedCode) return NextResponse.json({ error: 'Mã mời là bắt buộc' }, { status: 400 });

    const space = await prisma.space.findUnique({ where: { inviteCode: normalizedCode }, include: { members: true } });
    if (!space) return NextResponse.json({ error: 'Mã mời không hợp lệ' }, { status: 404 });
    if (space.members.some((member) => member.userId === user.id)) return NextResponse.json({ error: 'Bạn đã ở trong space này' }, { status: 409 });
    if (space.members.length >= 2) return NextResponse.json({ error: 'Space này đã đủ hai thành viên' }, { status: 409 });

    await prisma.spaceMember.create({ data: { userId: user.id, spaceId: space.id, role: 'PARTNER' } });
    return NextResponse.json({ success: true, space: { id: space.id, name: space.name } });
  } catch {
    return NextResponse.json({ error: 'Không thể tham gia space' }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 404 });

  try {
    await prisma.$transaction(async (transaction) => {
      const spaceId = user.spaceId as number;
      await transaction.item.deleteMany({ where: { spaceId } });
      await transaction.goal.deleteMany({ where: { spaceId } });
      await transaction.photo.deleteMany({ where: { spaceId } });
      await transaction.music.deleteMany({ where: { spaceId } });
      await transaction.pin.deleteMany({ where: { spaceId } });
      await transaction.chatMessage.deleteMany({ where: { spaceId } });
      await transaction.sharedGame.deleteMany({ where: { spaceId } });
      await transaction.sharedMemoryGame.deleteMany({ where: { spaceId } });
      await transaction.spaceMember.deleteMany({ where: { spaceId } });
      await transaction.space.delete({ where: { id: spaceId } });
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Không thể xóa Shared Space' }, { status: 500 });
  }
}

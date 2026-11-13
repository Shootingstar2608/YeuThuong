import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  const messages = await prisma.chatMessage.findMany({
    where: { spaceId: user.spaceId },
    orderBy: { createdAt: 'asc' },
    take: 100,
    select: { id: true, content: true, createdAt: true, user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  try {
    const { content } = await request.json();
    const message = String(content ?? '').trim();
    if (!message || message.length > 500) return NextResponse.json({ error: 'Tin nhắn phải từ 1 đến 500 ký tự' }, { status: 400 });

    const created = await prisma.chatMessage.create({
      data: { content: message, userId: user.id, spaceId: user.spaceId },
      select: { id: true, content: true, createdAt: true, user: { select: { id: true, name: true } } },
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Không thể gửi tin nhắn' }, { status: 500 });
  }
}
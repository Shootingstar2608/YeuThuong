import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  const cards = await prisma.secretCustomCard.findMany({
    where: { spaceId: user.spaceId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  try {
    const { type, content, level } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Nội dung thẻ là bắt buộc' }, { status: 400 });
    }

    const card = await prisma.secretCustomCard.create({
      data: {
        spaceId: user.spaceId,
        type: type || 'DARE',
        content: content.trim(),
        level: typeof level === 'number' ? level : 1,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await prisma.secretCustomCard.deleteMany({
    where: { id: parseInt(id), spaceId: user.spaceId },
  });

  return NextResponse.json({ success: true });
}

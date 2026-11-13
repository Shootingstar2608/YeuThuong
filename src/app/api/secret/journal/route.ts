import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  const journals = await prisma.secretJournal.findMany({
    where: { spaceId: user.spaceId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(journals);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  try {
    const { title, content, rating, date, tags, author } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Tiêu đề và nội dung là bắt buộc' }, { status: 400 });
    }

    const journal = await prisma.secretJournal.create({
      data: {
        spaceId: user.spaceId,
        title: title.trim(),
        content: content.trim(),
        rating: typeof rating === 'number' ? rating : 5,
        date: date || new Date().toISOString().split('T')[0],
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        author: author || (user.name.includes('chồng') ? 'Boss' : 'Slave'),
      },
    });

    return NextResponse.json(journal, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await prisma.secretJournal.deleteMany({
    where: { id: parseInt(id), spaceId: user.spaceId },
  });

  return NextResponse.json({ success: true });
}

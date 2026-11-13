import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  const items = await prisma.secretCustomItem.findMany({
    where: { spaceId: user.spaceId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  try {
    const { category, name, desc, icon } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tên món đồ là bắt buộc' }, { status: 400 });
    }

    const item = await prisma.secretCustomItem.create({
      data: {
        spaceId: user.spaceId,
        category: category === 'COSPLAY' ? 'COSPLAY' : 'PROP',
        name: name.trim(),
        desc: desc ? desc.trim() : '',
        icon: icon && icon.trim() ? icon.trim() : (category === 'COSPLAY' ? '👗' : '⛓️'),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await prisma.secretCustomItem.deleteMany({
    where: { id: parseInt(id), spaceId: user.spaceId },
  });

  return NextResponse.json({ success: true });
}

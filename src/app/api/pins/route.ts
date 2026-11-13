import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });
  try {
    const pins = await prisma.pin.findMany({ where: { spaceId: user.spaceId }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(pins);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });
  try {
    const { title, note, author } = await request.json();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const newPin = await prisma.pin.create({ data: { title, note, author, userId: user.id, spaceId: user.spaceId } });
    return NextResponse.json(newPin);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create pin' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.pin.deleteMany({ where: { id: parseInt(id), spaceId: user.spaceId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete pin' }, { status: 500 });
  }
}

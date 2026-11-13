import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  try {
    const items = await prisma.item.findMany({
      where: { spaceId: user.spaceId, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });
  try {
    const { name, type } = await request.json();
    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }
    
    const newItem = await prisma.item.create({
      data: { name, type, userId: user.id, spaceId: user.spaceId },
    });
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await prisma.item.deleteMany({ where: { id: parseInt(id), spaceId: user.spaceId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

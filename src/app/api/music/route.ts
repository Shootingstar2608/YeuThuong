import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tracks = await prisma.music.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(tracks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch music' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, artist, url } = await request.json();
    if (!title || !url) return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });

    const newTrack = await prisma.music.create({ data: { title, artist, url } });
    return NextResponse.json(newTrack);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create music' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.music.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete music' }, { status: 500 });
  }
}

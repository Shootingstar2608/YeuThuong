import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pins = await prisma.pin.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(pins);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, note, author } = await request.json();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const newPin = await prisma.pin.create({ data: { title, note, author } });
    return NextResponse.json(newPin);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create pin' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.pin.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete pin' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const icons = ['💖', '🎁', '🍰', '🌹', '💑', '🧸', '🍓', '🌙'];

function shuffledCards() {
  return JSON.stringify([...icons, ...icons].sort(() => Math.random() - 0.5));
}

function parseIndices(value: string) {
  return JSON.parse(value) as number[];
}

async function getMemoryGame(spaceId: number) {
  let game = await prisma.sharedMemoryGame.upsert({
    where: { spaceId },
    update: {},
    create: { spaceId, cards: shuffledCards() },
  });

  if (game.mismatchUntil && game.mismatchUntil <= new Date()) {
    game = await prisma.sharedMemoryGame.update({ where: { spaceId }, data: { openIndices: '[]', mismatchUntil: null } });
  }
  return game;
}

function response(game: Awaited<ReturnType<typeof getMemoryGame>>) {
  return NextResponse.json({ cards: JSON.parse(game.cards), openIndices: parseIndices(game.openIndices), matchedIndices: parseIndices(game.matchedIndices), moves: game.moves, updatedAt: game.updatedAt });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });
  return response(await getMemoryGame(user.spaceId));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  try {
    const { action, index } = await request.json();
    if (action === 'reset') {
      return response(await prisma.sharedMemoryGame.upsert({ where: { spaceId: user.spaceId }, update: { cards: shuffledCards(), openIndices: '[]', matchedIndices: '[]', mismatchUntil: null, moves: 0 }, create: { spaceId: user.spaceId, cards: shuffledCards() } }));
    }

    const game = await getMemoryGame(user.spaceId);
    const cell = Number(index);
    const open = parseIndices(game.openIndices);
    const matched = parseIndices(game.matchedIndices);
    if (!Number.isInteger(cell) || cell < 0 || cell >= 16 || open.length >= 2 || open.includes(cell) || matched.includes(cell)) return NextResponse.json({ error: 'Thẻ này không thể lật' }, { status: 409 });

    const nextOpen = [...open, cell];
    const cards = JSON.parse(game.cards) as string[];
    if (nextOpen.length === 1) return response(await prisma.sharedMemoryGame.update({ where: { spaceId: user.spaceId }, data: { openIndices: JSON.stringify(nextOpen) } }));

    const isMatch = cards[nextOpen[0]] === cards[nextOpen[1]];
    const nextMatched = isMatch ? [...matched, ...nextOpen] : matched;
    return response(await prisma.sharedMemoryGame.update({ where: { spaceId: user.spaceId }, data: { openIndices: JSON.stringify(nextOpen), matchedIndices: JSON.stringify(nextMatched), mismatchUntil: isMatch ? null : new Date(Date.now() + 900), moves: { increment: 1 } } }));
  } catch {
    return NextResponse.json({ error: 'Không thể cập nhật game' }, { status: 500 });
  }
}
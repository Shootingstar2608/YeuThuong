import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

async function getGame(spaceId: number, firstUserId: number) {
  return prisma.sharedGame.upsert({
    where: { spaceId },
    update: {},
    create: { spaceId, currentTurnUserId: firstUserId },
    select: { board: true, currentTurnUserId: true, winnerUserId: true, status: true, updatedAt: true },
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });
  return NextResponse.json(await getGame(user.spaceId, user.id));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  try {
    const { action, index } = await request.json();
    if (action === 'reset') {
      const reset = await prisma.sharedGame.update({ where: { spaceId: user.spaceId }, data: { board: '.........', currentTurnUserId: user.id, winnerUserId: null, status: 'PLAYING' } });
      return NextResponse.json(reset);
    }

    const cell = Number(index);
    const game = await getGame(user.spaceId, user.id);
    const members = await prisma.spaceMember.findMany({ where: { spaceId: user.spaceId }, orderBy: { joinedAt: 'asc' }, select: { userId: true } });
    const otherMember = members.find((member) => member.userId !== user.id);
    if (game.status !== 'PLAYING') return NextResponse.json({ error: 'Ván chơi đã kết thúc' }, { status: 409 });
    if (game.currentTurnUserId !== user.id) return NextResponse.json({ error: 'Chưa đến lượt của bạn' }, { status: 409 });
    if (!Number.isInteger(cell) || cell < 0 || cell > 8 || game.board[cell] !== '.') return NextResponse.json({ error: 'Nước đi không hợp lệ' }, { status: 400 });

    const mark = members[0]?.userId === user.id ? 'X' : 'O';
    const board = `${game.board.slice(0, cell)}${mark}${game.board.slice(cell + 1)}`;
    const hasWinner = wins.some(([a, b, c]) => board[a] !== '.' && board[a] === board[b] && board[a] === board[c]);
    const isDraw = !board.includes('.');
    const updated = await prisma.sharedGame.update({
      where: { spaceId: user.spaceId },
      data: { board, currentTurnUserId: hasWinner || isDraw ? null : otherMember?.userId, winnerUserId: hasWinner ? user.id : null, status: hasWinner ? 'WON' : isDraw ? 'DRAW' : 'PLAYING' },
      select: { board: true, currentTurnUserId: true, winnerUserId: true, status: true, updatedAt: true },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Không thể thực hiện nước đi' }, { status: 500 });
  }
}
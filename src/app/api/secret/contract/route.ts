import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  let contract = await prisma.secretContract.findUnique({
    where: { spaceId: user.spaceId },
  });

  if (!contract) {
    contract = await prisma.secretContract.create({
      data: {
        spaceId: user.spaceId,
        bossName: user.name || 'chồng yêu của Vân',
        slaveName: 'vợ yêu của Phúc',
      },
    });
  }

  return NextResponse.json(contract);
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user?.spaceId) return NextResponse.json({ error: 'No shared space' }, { status: 403 });

  try {
    const body = await request.json();
    const {
      bossName,
      slaveName,
      rules,
      hardLimits,
      safewords,
      aftercare,
      bossSigned,
      slaveSigned,
      bossSignature,
      slaveSignature,
    } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (bossName !== undefined) dataToUpdate.bossName = bossName;
    if (slaveName !== undefined) dataToUpdate.slaveName = slaveName;
    if (rules !== undefined) dataToUpdate.rules = typeof rules === 'string' ? rules : JSON.stringify(rules);
    if (hardLimits !== undefined) dataToUpdate.hardLimits = typeof hardLimits === 'string' ? hardLimits : JSON.stringify(hardLimits);
    if (safewords !== undefined) dataToUpdate.safewords = safewords;
    if (aftercare !== undefined) dataToUpdate.aftercare = aftercare;
    if (bossSigned !== undefined) dataToUpdate.bossSigned = Boolean(bossSigned);
    if (slaveSigned !== undefined) dataToUpdate.slaveSigned = Boolean(slaveSigned);
    if (bossSignature !== undefined) dataToUpdate.bossSignature = bossSignature;
    if (slaveSignature !== undefined) dataToUpdate.slaveSignature = slaveSignature;

    if (bossSigned && slaveSigned) {
      dataToUpdate.signedAt = new Date();
    }

    const updated = await prisma.secretContract.upsert({
      where: { spaceId: user.spaceId },
      update: dataToUpdate,
      create: {
        spaceId: user.spaceId,
        bossName: bossName || 'chồng yêu của Vân',
        slaveName: slaveName || 'vợ yêu của Phúc',
        ...dataToUpdate,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

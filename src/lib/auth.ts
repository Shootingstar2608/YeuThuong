import { cookies } from 'next/headers';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'our-space-session';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expected] = storedHash.split(':');
  if (!salt || !expected) return false;

  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function setSession(userId: number) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
  await prisma.session.create({ data: { tokenHash: hashSessionToken(token), userId, expiresAt } });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365, // 1 năm – đăng nhập 1 lần là xong!
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          memberships: {
            take: 1,
            orderBy: { joinedAt: 'desc' },
            select: { role: true, space: { select: { id: true, name: true, inviteCode: true } } },
          },
        },
      },
    },
  });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
    return null;
  }

  const membership = session.user.memberships[0];
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    spaceId: membership?.space.id ?? null,
    spaceName: membership?.space.name ?? null,
    inviteCode: membership?.space.inviteCode ?? null,
    role: membership?.role ?? null,
  };
}
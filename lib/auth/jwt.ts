import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload extends JWTPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
}

function getSecret(): Uint8Array {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer('johnr1sh-copilot')
    .setAudience('johnr1sh-web')
    .sign(getSecret());
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer('johnr1sh-copilot')
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: 'johnr1sh-copilot',
    audience: 'johnr1sh-web',
    algorithms: ['HS256'],
  });
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: 'johnr1sh-copilot',
    algorithms: ['HS256'],
  });
  if ((payload as { type?: string }).type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return { sub: payload.sub as string };
}

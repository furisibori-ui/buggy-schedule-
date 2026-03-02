import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDb();
    return NextResponse.json({ ok: true, message: 'テーブルを作成しました' });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'DB_NOT_CONFIGURED' ||
        error.message.includes('POSTGRES_URL') ||
        error.message.includes('DATABASE_URL')
      ) {
        return NextResponse.json(
          { error: 'データベースが接続されていません。Vercel の Storage で Postgres（Neon）を追加し、プロジェクトに接続してください。' },
          { status: 503 }
        );
      }
    }
    console.error(error);
    return NextResponse.json({ error: 'DB init failed' }, { status: 500 });
  }
}

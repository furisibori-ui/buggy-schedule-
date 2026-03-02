import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';

function getSql() {
  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) {
    throw new Error('DB_NOT_CONFIGURED');
  }
  return neon(connectionString);
}

export async function POST(request: NextRequest) {
  try {
    const { name, dates } = await request.json();
    if (!name || !dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { error: 'イベント名と日程候補は必須です' },
        { status: 400 }
      );
    }
    const slug = randomBytes(8).toString('hex');
    const sql = getSql();
    const rows = await sql`
      INSERT INTO events (slug, name, dates)
      VALUES (${slug}, ${name}, ${JSON.stringify(dates)})
      RETURNING id, slug, name, dates, created_at
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    if (error instanceof Error && error.message === 'DB_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'データベースが接続されていません。Vercel の Storage で Postgres を追加し、/api/init にアクセスしてテーブルを作成してください。' },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, slug, name, dates, created_at
      FROM events
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    if (error instanceof Error && error.message === 'DB_NOT_CONFIGURED') {
      return NextResponse.json([], { status: 200 });
    }
    console.error(error);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}

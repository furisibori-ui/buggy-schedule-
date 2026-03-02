import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sql = getSql();
    const eventResult = await sql`
      SELECT id FROM events WHERE slug = ${slug}
    `;
    if (eventResult.length === 0) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }
    const eventId = eventResult[0].id;
    const rows = await sql`
      SELECT id, name, answers, created_at
      FROM responses
      WHERE event_id = ${eventId}
      ORDER BY created_at ASC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    if (error instanceof Error && error.message === 'DB_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'データベースが接続されていません。' },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { name, answers } = await request.json();
    if (!name || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: '名前と回答は必須です' },
        { status: 400 }
      );
    }
    const sql = getSql();
    const eventResult = await sql`
      SELECT id FROM events WHERE slug = ${slug}
    `;
    if (eventResult.length === 0) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }
    const eventId = eventResult[0].id;
    const rows = await sql`
      INSERT INTO responses (event_id, name, answers)
      VALUES (${eventId}, ${name}, ${JSON.stringify(answers)})
      RETURNING id, name, answers, created_at
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    if (error instanceof Error && error.message === 'DB_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'データベースが接続されていません。Vercel の Storage で Postgres を追加してください。' },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 });
  }
}

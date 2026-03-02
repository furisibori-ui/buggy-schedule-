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
    const rows = await sql`
      SELECT id, slug, name, dates, created_at
      FROM events
      WHERE slug = ${slug}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { removeDate } = await request.json();
    if (!removeDate || typeof removeDate !== 'string') {
      return NextResponse.json({ error: '削除する日程を指定してください' }, { status: 400 });
    }
    const sql = getSql();
    const eventResult = await sql`
      SELECT id, dates FROM events WHERE slug = ${slug}
    `;
    if (eventResult.length === 0) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }
    const currentDates = (eventResult[0].dates as string[]) || [];
    const newDates = currentDates.filter((d: string) => d !== removeDate);
    if (newDates.length === currentDates.length) {
      return NextResponse.json({ error: '指定された日程が見つかりません' }, { status: 400 });
    }
    await sql`
      UPDATE events SET dates = ${JSON.stringify(newDates)} WHERE slug = ${slug}
    `;
    return NextResponse.json({ ok: true, dates: newDates });
  } catch (error) {
    if (error instanceof Error && error.message === 'DB_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'データベースが接続されていません。' },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
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
    await sql`DELETE FROM responses WHERE event_id = ${eventResult[0].id}`;
    await sql`DELETE FROM events WHERE slug = ${slug}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'DB_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'データベースが接続されていません。' },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}

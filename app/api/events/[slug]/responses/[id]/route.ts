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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getSql();
    const responseId = parseInt(id, 10);
    if (isNaN(responseId)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }
    await sql`DELETE FROM responses WHERE id = ${responseId}`;
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

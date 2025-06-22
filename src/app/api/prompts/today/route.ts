import { NextResponse } from 'next/server';
import { selectDailyContent } from '~/lib/dailyContent';

export async function GET() {
  try {
    const today = new Date();
    const content = await selectDailyContent(today);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching daily content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch daily content', details: errorMessage }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { repo } from '@/lib/repo-instance';
import { getOutboundUrl, getAmazonTag } from '@/lib/links';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const deal = await repo().getDeal(slug);

    if (deal) {
      const destination = getOutboundUrl(deal);
      return NextResponse.redirect(destination, { status: 302 });
    }

    // Fallback if slug not found
    return NextResponse.redirect(`https://www.amazon.in?tag=${getAmazonTag()}`, { status: 302 });
  } catch (error) {
    console.error('[/go redirect] Error:', error);
    return NextResponse.redirect(`https://www.amazon.in?tag=${getAmazonTag()}`, { status: 302 });
  }
}

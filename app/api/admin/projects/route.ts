import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { createProject, listProjects } from '@/lib/content/projects';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience, the required role and a
    // grant on this site. The middleware ahead of this only chooses redirects -
    // it verifies nothing.
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    return NextResponse.json(await listProjects(writer.siteId));
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const data = await request.json();

    if (!data.title || !data.description || !data.githubUrl || !data.category) {
      return NextResponse.json(
        { error: 'Title, description, GitHub URL and category are required' },
        { status: 400 }
      );
    }

    return NextResponse.json(await createProject(writer.siteId, data), { status: 201 });
  } catch (error) {
    // `title` is unique within a site, so the same project cannot be added
    // twice by accident — and the other portfolio having one by that name is no
    // longer a reason this one cannot.
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A project with that title already exists' },
        { status: 409 }
      );
    }
    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

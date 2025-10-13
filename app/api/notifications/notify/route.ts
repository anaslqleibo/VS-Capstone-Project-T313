import { executeQuery } from '@/app/lib/db';
import { sendEmail } from '@/app/lib/email';
import { insertNotification } from '@/app/lib/notification-db';
import { NextResponse } from 'next/server';

export async function POST(req: Request, _context: any) {
  const { via_web, via_email, shift_id, assignee_id, status, subject, html } = await req.json();

  if (via_web && shift_id && status) await insertNotification(shift_id, status, assignee_id);


  if (via_email && assignee_id && subject && html) {
    const [user] = await executeQuery(`SELECT email FROM users WHERE id = ?`, [assignee_id]) as any[];
    
    if (!user) {
        return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
        );
    }

    await sendEmail({ to: user.email, subject, html, text: subject });
  }

  return NextResponse.json({ success: true });
}

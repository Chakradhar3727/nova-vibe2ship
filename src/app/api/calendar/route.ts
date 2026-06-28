import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const { token, title, description, startTime, endTime } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing OAuth token' }, { status: 401 });
    }

    // Initialize OAuth2 client with the token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Insert the event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title,
        description: description || 'Scheduled by NOVA Agent',
        start: {
          dateTime: startTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime,
          timeZone: 'UTC',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 10 },
            { method: 'email', minutes: 30 },
          ],
        },
      },
    });

    return NextResponse.json({ success: true, eventId: response.data.id, eventLink: response.data.htmlLink });
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
  }
}

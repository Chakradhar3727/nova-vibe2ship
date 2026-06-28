import { NextResponse } from 'next/server';
import vm from 'vm';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Capture console.log output so the agent can debug its own code
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(a => 
        typeof a === 'object' ? JSON.stringify(a) : String(a)
      ).join(' ')),
      error: (...args: any[]) => logs.push('ERROR: ' + args.map(a => String(a)).join(' ')),
      warn: (...args: any[]) => logs.push('WARN: ' + args.map(a => String(a)).join(' ')),
    };

    // Create a secure sandbox context (no access to file system or environment variables)
    const sandbox = {
      console: customConsole,
      Math,
      Date,
      JSON,
      parseInt,
      parseFloat,
      setTimeout,
      clearTimeout,
    };

    vm.createContext(sandbox);

    let result;
    try {
      // Execute the code with a strict 2-second timeout to prevent infinite loops
      const script = new vm.Script(code);
      result = script.runInContext(sandbox, { timeout: 2000 });
    } catch (err: any) {
      logs.push(`Execution Error: ${err.message}`);
    }

    return NextResponse.json({
      success: true,
      logs: logs.join('\n'),
      result: result !== undefined ? String(result) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

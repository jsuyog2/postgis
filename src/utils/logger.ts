/**
 * Lightweight structured logger for the postgis library.
 * Enabled by setting the `POSTGIS_DEBUG=true` environment variable.
 */

const DEBUG = process.env['POSTGIS_DEBUG'] === 'true';

type LogArgs = unknown[];

function formatMessage(level: string, args: LogArgs): string {
  const ts = new Date().toISOString();
  return `[postgis:${level}] ${ts} ${args.map(String).join(' ')}`;
}

export const logger = {
  debug(...args: LogArgs): void {
    if (DEBUG) {
      console.debug(formatMessage('debug', args));
    }
  },
  warn(...args: LogArgs): void {
    console.warn(formatMessage('warn', args));
  },
  error(...args: LogArgs): void {
    console.error(formatMessage('error', args));
  },
};

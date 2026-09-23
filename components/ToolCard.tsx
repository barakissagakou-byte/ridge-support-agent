'use client';

type Props = {
  name: string;
  state: string;
  input: unknown;
  output?: unknown;
  errorText?: string;
};

const STATUS: Record<string, { label: string; tone: string }> = {
  'input-streaming': { label: 'Preparing…', tone: 'pending' },
  'input-available': { label: 'Running…', tone: 'pending' },
  'output-available': { label: 'Done', tone: 'ok' },
  'output-error': { label: 'Error', tone: 'error' },
};

const pretty = (v: unknown) => JSON.stringify(v, null, 2) ?? '';

export function ToolCard({ name, state, input, output, errorText }: Props) {
  const status = STATUS[state] ?? { label: state, tone: 'pending' };
  return (
    <details className="tool-card">
      <summary>
        <span className="tool-icon" aria-hidden>⚙</span>
        <code className="tool-name">{name}</code>
        <span className={`tool-status ${status.tone}`}>{status.label}</span>
      </summary>
      <div className="tool-body">
        <div className="tool-label">Input</div>
        <pre>{input === undefined ? '…' : pretty(input)}</pre>
        {state === 'output-available' && (
          <>
            <div className="tool-label">Result</div>
            <pre>{pretty(output)}</pre>
          </>
        )}
        {state === 'output-error' && (
          <>
            <div className="tool-label">Error</div>
            <pre className="tool-error">{errorText}</pre>
          </>
        )}
      </div>
    </details>
  );
}

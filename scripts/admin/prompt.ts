import { CliError } from "./errors";

// Interactive input for the admin CLI. Passwords are only ever typed here, hidden, on a real terminal:
// never an argument (shell history, `ps`), never an environment variable, never a pipe.

const ENTER = new Set(["\r", "\n"]);
const CTRL_C = "\u0003";
const CTRL_D = "\u0004";
const BACKSPACE = new Set(["\u007f", "\b"]);
// Arrow keys, Home/End, Delete… arrive as ESC sequences; they have no meaning in this prompt.
const ESCAPE_SEQUENCE = /\u001b\[[0-9;?]*[ -/]*[@-~]|\u001b./g;
const CONTROL_CHAR = /[\u0000-\u001f\u007f-\u009f]/;

export type InputState = { buffer: string; done: boolean; aborted: boolean };

/** Folds one chunk of terminal input (a keystroke, or a whole paste) into the line being typed. */
export function applyInput(buffer: string, chunk: string): InputState {
  let current = buffer;
  for (const char of chunk.replaceAll(ESCAPE_SEQUENCE, "")) {
    if (ENTER.has(char)) return { buffer: current, done: true, aborted: false };
    if (char === CTRL_C || (char === CTRL_D && current === "")) return { buffer: current, done: false, aborted: true };
    if (BACKSPACE.has(char)) current = [...current].slice(0, -1).join("");
    else if (!CONTROL_CHAR.test(char)) current += char;
  }
  return { buffer: current, done: false, aborted: false };
}

const NEEDS_TERMINAL =
  "This command needs an interactive terminal. With Docker use `docker compose run --rm admin-cli …` (without -T).";

function assertTerminal(): void {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new CliError(NEEDS_TERMINAL);
}

type PromptOptions = { hidden?: boolean };

/** One line of input. `hidden` echoes nothing at all (not even asterisks, so the length is not shown either). */
export function promptLine(label: string, { hidden = false }: PromptOptions = {}): Promise<string> {
  assertTerminal();
  const { stdin, stdout } = process;

  return new Promise((resolve, reject) => {
    let buffer = "";
    const render = () => stdout.write(`\r\u001b[K${label}${hidden ? "" : buffer}`);

    const finish = (outcome: () => void) => {
      stdin.off("data", onData);
      stdin.off("end", onEnd);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      outcome();
    };
    const onEnd = () => finish(() => reject(new CliError("Input closed before an answer was given.")));
    const onData = (chunk: string) => {
      const next = applyInput(buffer, chunk);
      buffer = next.buffer;
      if (next.aborted) return finish(() => reject(new CliError("Cancelled.", 130)));
      if (next.done) {
        if (!hidden) render(); // a pasted line arrives with its Enter in one chunk: show it before moving on
        return finish(() => resolve(buffer));
      }
      render();
    };

    stdin.setEncoding("utf8");
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
    stdin.on("end", onEnd);
    render();
  });
}

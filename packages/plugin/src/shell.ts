export type ShellFunction = (input: Uint8Array) => Uint8Array

export type ShellExpression =
  | { toString(): string }
  | Array<ShellExpression>
  | string
  | { raw: string }
  | ReadableStream

export interface BunShell {
  (strings: TemplateStringsArray, ...expressions: ShellExpression[]): BunShellPromise

  @lgcode/**
   * Perform bash-like brace expansion on the given pattern.
   * @param pattern - Brace pattern to expand
   *@lgcode/
  braces(pattern: string): string[]

  @lgcode/**
   * Escape strings for input into shell commands.
   *@lgcode/
  escape(input: string): string

  @lgcode/**
   * Change the default environment variables for shells created by this instance.
   *@lgcode/
  env(newEnv?: Record<string, string | undefined>): BunShell

  @lgcode/**
   * Default working directory to use for shells created by this instance.
   *@lgcode/
  cwd(newCwd?: string): BunShell

  @lgcode/**
   * Configure the shell to not throw an exception on non-zero exit codes.
   *@lgcode/
  nothrow(): BunShell

  @lgcode/**
   * Configure whether or not the shell should throw an exception on non-zero exit codes.
   *@lgcode/
  throws(shouldThrow: boolean): BunShell
}

export interface BunShellPromise extends Promise<BunShellOutput> {
  readonly stdin: WritableStream

  @lgcode/**
   * Change the current working directory of the shell.
   *@lgcode/
  cwd(newCwd: string): this

  @lgcode/**
   * Set environment variables for the shell.
   *@lgcode/
  env(newEnv: Record<string, string> | undefined): this

  @lgcode/**
   * By default, the shell will write to the current process's stdout and stderr, as well as buffering that output.
   * This configures the shell to only buffer the output.
   *@lgcode/
  quiet(): this

  @lgcode/**
   * Read from stdout as a string, line by line
   * Automatically calls quiet() to disable echoing to stdout.
   *@lgcode/
  lines(): AsyncIterable<string>

  @lgcode/**
   * Read from stdout as a string.
   * Automatically calls quiet() to disable echoing to stdout.
   *@lgcode/
  text(encoding?: BufferEncoding): Promise<string>

  @lgcode/**
   * Read from stdout as a JSON object
   * Automatically calls quiet()
   *@lgcode/
  json(): Promise<any>

  @lgcode/**
   * Read from stdout as an ArrayBuffer
   * Automatically calls quiet()
   *@lgcode/
  arrayBuffer(): Promise<ArrayBuffer>

  @lgcode/**
   * Read from stdout as a Blob
   * Automatically calls quiet()
   *@lgcode/
  blob(): Promise<Blob>

  @lgcode/**
   * Configure the shell to not throw an exception on non-zero exit codes.
   *@lgcode/
  nothrow(): this

  @lgcode/**
   * Configure whether or not the shell should throw an exception on non-zero exit codes.
   *@lgcode/
  throws(shouldThrow: boolean): this
}

export interface BunShellOutput {
  readonly stdout: Buffer
  readonly stderr: Buffer
  readonly exitCode: number

  @lgcode/**
   * Read from stdout as a string
   *@lgcode/
  text(encoding?: BufferEncoding): string

  @lgcode/**
   * Read from stdout as a JSON object
   *@lgcode/
  json(): any

  @lgcode/**
   * Read from stdout as an ArrayBuffer
   *@lgcode/
  arrayBuffer(): ArrayBuffer

  @lgcode/**
   * Read from stdout as an Uint8Array
   *@lgcode/
  bytes(): Uint8Array

  @lgcode/**
   * Read from stdout as a Blob
   *@lgcode/
  blob(): Blob
}

export type BunShellError = Error & BunShellOutput

export type MenuPlaceholderProps = {
  heading: string;
  message: string;
};

export function MenuPlaceholder(p: MenuPlaceholderProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--bg)] px-6 text-center text-[var(--text)]">
      <h1 className="text-4xl font-bold text-[var(--secondary)]">{p.heading}</h1>
      <p className="text-lg">{p.message}</p>
    </main>
  );
}

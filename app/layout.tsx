import '@/ui/theme/tokens.css';
import '@/ui/theme/global.css';
import { fontVariables } from '@/ui/theme/fonts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}

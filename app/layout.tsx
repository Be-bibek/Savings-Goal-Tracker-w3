import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Savings Goal Tracker',
  description: 'A beautiful, interactive app to track savings goals with Stellar wallet integration.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

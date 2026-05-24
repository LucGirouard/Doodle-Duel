import type { Metadata } from "next";
import "./globals.css";
import { NextAuthProvider } from "./providers";
import UserMenu from "./components/UserMenu";

export const metadata: Metadata = {
  title: "Art Battle",
  description: "Intense 1v1 art battles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <div style={styles.container}>
            {/* Floating User Menu - only shows when logged in */}
            <div style={styles.userMenuWrapper}>
              <UserMenu />
            </div>
            
            {/* Main Content */}
            <main style={styles.main}>
              {children}
            </main>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    position: "relative",
  },
  userMenuWrapper: {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: 1000,
  },
  main: {
    minHeight: "100vh",
  },
};

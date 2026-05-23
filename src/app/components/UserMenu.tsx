"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get first letter of email for avatar
  const getInitial = () => {
    if (!session?.user?.email) return "?";
    return session.user.email.charAt(0).toUpperCase();
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Still loading session
  if (status === "loading") {
    return (
      <div style={styles.avatar}>
        <span style={styles.initial}>?</span>
      </div>
    );
  }

  // Not authenticated - don't show menu
  if (!session) {
    return null;
  }

  return (
    <div ref={menuRef} style={styles.container}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.avatar}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <span style={styles.initial}>{getInitial()}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <span style={styles.email}>{session.user.email}</span>
          </div>
          <div style={styles.dropdownDivider} />
          <button
            onClick={async () => {
              setIsOpen(false);
              // Sign out and redirect to home page (not login)
              await signOut({ callbackUrl: "/", redirect: true });
            }}
            style={styles.signOutButton}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    display: "inline-block",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#000",
    color: "#fffaf1",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    transition: "transform 0.2s",
  },
  initial: {
    lineHeight: 1,
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    minWidth: "200px",
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "12px 16px",
  },
  email: {
    fontSize: "14px",
    color: "#333",
    fontWeight: "500",
    wordBreak: "break-all",
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "#eee",
  },
  signOutButton: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "transparent",
    border: "none",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    transition: "background-color 0.2s",
  },
};
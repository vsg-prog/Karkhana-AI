import { useEffect, useState, ReactNode } from "react";
import { useStore } from "@/store/store";

/**
 * Format date in Indian Standard Time (IST - Asia/Kolkata).
 * e.g. "22 Aug 2026, 02:04:19 AM IST"
 */
export function formatISTTime(date: Date = new Date()): string {
  try {
    const dateStr = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);

    const timeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }).format(date);

    return dateStr + ", " + timeStr + " IST";
  } catch {
    return date.toLocaleString() + " IST";
  }
}

/**
 * Live Indian Date & Time Clock Widget
 */
export function ClockWidget() {
  const [timeString, setTimeString] = useState<string>(() => formatISTTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeString(formatISTTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="cth-titlebar-nodrag"
      title="Indian Standard Time (IST)"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        background: "var(--cth-paper-100)",
        boxShadow: "inset 0 0 0 1px var(--cth-ink-300)",
        borderRadius: 3,
        fontSize: 11,
        fontFamily: "var(--cth-font-mono)",
        color: "var(--cth-ink-800)",
        whiteSpace: "nowrap",
        letterSpacing: "0.2px"
      }}
    >
      <span style={{ fontSize: 12, lineHeight: 1 }}>🇮🇳</span>
      <span>{timeString}</span>
    </div>
  );
}

export const IndianClock = ClockWidget;

export type SupportedLanguage =
  | "English (EN)"
  | "हिंदी (Hindi)"
  | "বাংলা (Bengali)"
  | "অসমীয়া (Assamese)";

export const LANGUAGE_OPTIONS: { label: string; value: SupportedLanguage }[] = [
  { label: "English (EN)", value: "English (EN)" },
  { label: "हिंदी (Hindi)", value: "हिंदी (Hindi)" },
  { label: "বাংলা (Bengali)", value: "বাংলা (Bengali)" },
  { label: "অসমীয়া (Assamese)", value: "অসমীয়া (Assamese)" },
];

/**
 * Language Selector Dropdown Component
 */
export function LanguageSelector() {
  const selectedLanguage = useStore((s) => s.selectedLanguage) || "English (EN)";
  const setSelectedLanguage = useStore((s) => s.setSelectedLanguage);

  return (
    <div
      className="cth-titlebar-nodrag"
      title="Select Language"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 6px",
        background: "var(--cth-paper-100)",
        boxShadow: "inset 0 0 0 1px var(--cth-ink-300)",
        borderRadius: 3,
        fontSize: 11,
        fontFamily: "var(--cth-font-ui)",
        color: "var(--cth-ink-800)"
      }}
    >
      <span style={{ fontSize: 12, lineHeight: 1 }}>🌐</span>
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 11,
          fontFamily: "var(--cth-font-ui)",
          color: "var(--cth-ink-800)",
          cursor: "pointer",
          paddingRight: 2
        }}
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export interface HeaderProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Header({ children, className, style }: HeaderProps) {
  return (
    <div
      className={"cth-titlebar-drag " + (className || "")}
      style={{
        height: 36,
        minHeight: 36,
        background: "linear-gradient(180deg, var(--cth-cream-100) 0%, var(--cth-cream-200) 100%)",
        borderBottom: "1px solid var(--cth-ink-300)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 96,
        paddingRight: 12,
        gap: 12,
        userSelect: "none",
        ...style
      }}
    >
      {children}
      <LanguageSelector />
    </div>
  );
}

export default Header;

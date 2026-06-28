"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Moon,
  Search,
  ShieldCheck,
  Crown,
} from "lucide-react";
import {
  MOCK_COMPLIANCE_ALERTS,
  MOCK_NOTIFICATIONS,
  MOCK_SEARCH_SUGGESTIONS,
} from "@/components/operations/mock/dashboard";

interface TopNavProps {
  founderMode: boolean;
  onFounderModeToggle: () => void;
}

export default function TopNav({ founderMode, onFounderModeToggle }: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const notifRef = useRef<HTMLDivElement>(null);
  const complianceRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (complianceRef.current && !complianceRef.current.contains(e.target as Node)) {
        setShowCompliance(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  const complianceTotal = MOCK_COMPLIANCE_ALERTS.reduce((sum, a) => sum + a.count, 0);

  return (
    <header className="ops-topnav">
      <form
        className="ops-topnav-search"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <Search className="ops-topnav-search-icon" strokeWidth={1.75} aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players, contests, transactions…"
          className="ops-topnav-search-input"
          aria-label="Global search"
        />
        {searchQuery.length === 0 && (
          <div className="ops-topnav-search-hints" aria-hidden="true">
            {MOCK_SEARCH_SUGGESTIONS.slice(0, 2).map((s) => (
              <button
                key={s}
                type="button"
                className="ops-topnav-search-hint"
                onClick={() => setSearchQuery(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="ops-topnav-actions">
        <div className="ops-topnav-dropdown" ref={notifRef}>
          <button
            type="button"
            className="ops-topnav-action-btn"
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowCompliance(false);
              setShowProfile(false);
            }}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={showNotifications}
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="ops-topnav-badge">{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className="ops-topnav-panel" role="menu">
              <p className="ops-topnav-panel-title">Notifications</p>
              <ul className="ops-topnav-panel-list">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <li key={n.id} className={n.read ? "" : "ops-topnav-panel-unread"}>
                    <span>{n.title}</span>
                    <span className="ops-topnav-panel-time">{n.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="ops-topnav-dropdown" ref={complianceRef}>
          <button
            type="button"
            className="ops-topnav-action-btn ops-topnav-action-warning"
            onClick={() => {
              setShowCompliance((v) => !v);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            aria-label={`Compliance alerts, ${complianceTotal} events`}
            aria-expanded={showCompliance}
          >
            <ShieldCheck className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span className="ops-topnav-badge ops-topnav-badge-warning">{complianceTotal}</span>
          </button>
          {showCompliance && (
            <div className="ops-topnav-panel" role="menu">
              <p className="ops-topnav-panel-title">Compliance Alerts</p>
              <ul className="ops-topnav-panel-list">
                {MOCK_COMPLIANCE_ALERTS.map((a) => (
                  <li key={a.id}>
                    <span>{a.region} region</span>
                    <span className="ops-topnav-panel-count">{a.count} events</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          type="button"
          className={`ops-topnav-founder-toggle ${founderMode ? "ops-topnav-founder-active" : ""}`}
          onClick={onFounderModeToggle}
          aria-pressed={founderMode}
          aria-label="Toggle founder mode"
        >
          <Crown className="w-4 h-4" strokeWidth={1.75} />
          <span className="ops-topnav-founder-label">Founder</span>
        </button>

        <button
          type="button"
          className="ops-topnav-action-btn"
          onClick={() => setDarkMode((v) => !v)}
          aria-pressed={darkMode}
          aria-label="Toggle dark mode"
        >
          <Moon className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>

        <div className="ops-topnav-dropdown" ref={profileRef}>
          <button
            type="button"
            className="ops-topnav-profile"
            onClick={() => {
              setShowProfile((v) => !v);
              setShowNotifications(false);
              setShowCompliance(false);
            }}
            aria-expanded={showProfile}
            aria-label="Admin profile menu"
          >
            <span className="ops-topnav-avatar" aria-hidden="true">OP</span>
            <span className="ops-topnav-profile-info">
              <span className="ops-topnav-profile-name">Ops Admin</span>
              <span className="ops-topnav-profile-role">Platform Operations</span>
            </span>
            <ChevronDown className="w-4 h-4 ops-topnav-profile-chevron" aria-hidden="true" />
          </button>
          {showProfile && (
            <div className="ops-topnav-panel ops-topnav-profile-panel" role="menu">
              <p className="ops-topnav-panel-title">Admin Profile</p>
              <ul className="ops-topnav-panel-list">
                <li><button type="button">Account Settings</button></li>
                <li><button type="button">Activity Log</button></li>
                <li><button type="button">Sign Out</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

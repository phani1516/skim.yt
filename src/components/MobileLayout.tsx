"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import GlassSidebar from "./GlassSidebar";

interface MobileLayoutProps {
    children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userInitial, setUserInitial] = useState("U");
    const menuRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Get user initial on mount
    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.email || "User";
                setUserInitial(name.charAt(0).toUpperCase());
            }
        }
        loadUser();
    }, [supabase]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <div className="mobile-layout">
            {/* Header */}
            <header className="mobile-header">
                {/* Hamburger — two thin glass lines */}
                <button
                    className="mobile-header__hamburger"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <span className="mobile-header__line" />
                    <span className="mobile-header__line" />
                </button>

                {/* App title */}
                <div className="mobile-header__title">
                    <span className="mobile-header__title-skim">skim</span>
                    <span className="mobile-header__title-yt">.yt</span>
                </div>

                {/* User avatar + dropdown */}
                <div className="user-menu" ref={menuRef}>
                    <button
                        className="mobile-header__avatar"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="User profile"
                    >
                        <span className="mobile-header__avatar-text">{userInitial}</span>
                    </button>

                    {menuOpen && (
                        <div className="user-menu__dropdown">
                            <button
                                className="user-menu__item"
                                onClick={() => {
                                    alert("Settings is coming soon!");
                                    setMenuOpen(false);
                                }}
                            >
                                <span className="user-menu__icon">⚙️</span>
                                Settings
                            </button>
                            <div className="user-menu__divider" />
                            <button
                                className="user-menu__item user-menu__item--danger"
                                onClick={handleSignOut}
                            >
                                <span className="user-menu__icon">🚪</span>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main content */}
            <main className="mobile-main">{children}</main>

            {/* Sidebar */}
            <GlassSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
        </div>
    );
}

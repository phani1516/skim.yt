"use client";

import { useState } from "react";
import GlassSidebar from "./GlassSidebar";

interface MobileLayoutProps {
    children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

                {/* User avatar */}
                <button className="mobile-header__avatar" aria-label="User profile">
                    <span className="mobile-header__avatar-text">P</span>
                </button>
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

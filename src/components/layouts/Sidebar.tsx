'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  Search,
  X,
  ChevronsUpDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { SettingsModal } from '@/components/features/settings/SettingsModal';

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: NavigationItem[];
};

type NavigationSection = {
  section: string;
  items: NavigationItem[];
};

type SidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  role?: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge' | 'buyer' | 'supplier';
  navigation: NavigationSection[];
};

export default function Sidebar({
  isCollapsed,
  toggleSidebar,
  role,
  navigation
}: SidebarProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expanded sections for manual click / toggle all
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleMouseEnter = (sectionKey: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setHoveredSection(sectionKey);
  };

  const handleMouseLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredSection(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // Restore scroll position on mount & scroll active item into view
  useEffect(() => {
    if (!navRef.current) return;
    try {
      const savedScroll = sessionStorage.getItem('sidebar_scroll_position');
      if (savedScroll !== null) {
        navRef.current.scrollTop = Number(savedScroll);
      }
    } catch {}

    // Smoothly scroll active item into view if it's off-screen
    const timer = setTimeout(() => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector('[data-sidebar-active="true"]') as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Save scroll position on scroll
  const handleScroll = useCallback(() => {
    if (!navRef.current) return;
    try {
      sessionStorage.setItem('sidebar_scroll_position', navRef.current.scrollTop.toString());
    } catch {}
  }, []);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => {
      const updated = {
        ...prev,
        [sectionKey]: !prev[sectionKey]
      };
      try {
        sessionStorage.setItem('sidebar_expanded_sections', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Toggle all sections open/closed
  const toggleAllSections = () => {
    const allKeys: string[] = [];
    navigation.forEach(sec => {
      sec.items.forEach(item => {
        if (item.subItems) {
          allKeys.push(item.label.toLowerCase().replace(/\s+/g, '-'));
        }
      });
    });

    const anyClosed = allKeys.some(key => !expandedSections[key]);
    const nextState: Record<string, boolean> = {};
    allKeys.forEach(key => {
      nextState[key] = anyClosed;
    });
    setExpandedSections(nextState);
    try {
      sessionStorage.setItem('sidebar_expanded_sections', JSON.stringify(nextState));
    } catch {}
  };

  // Filter navigation by search query
  const filteredNavigation = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return navigation;

    return navigation
      .map(sec => {
        const matchingItems = sec.items
          .map(item => {
            const itemMatches = item.label.toLowerCase().includes(query);
            if (item.subItems) {
              const matchingSubItems = item.subItems.filter(sub =>
                sub.label.toLowerCase().includes(query)
              );
              if (itemMatches || matchingSubItems.length > 0) {
                return {
                  ...item,
                  subItems: matchingSubItems.length > 0 ? matchingSubItems : item.subItems
                };
              }
              return null;
            }
            return itemMatches ? item : null;
          })
          .filter((item): item is NavigationItem => item !== null);

        if (matchingItems.length > 0) {
          return {
            ...sec,
            items: matchingItems
          };
        }
        return null;
      })
      .filter((sec): sec is NavigationSection => sec !== null);
  }, [navigation, searchQuery]);

  return (
    <aside className={clsx(
      'h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col sticky top-0 z-40 select-none shadow-xs',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header with logo & toggle button */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        {isCollapsed ? (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs mx-auto">
            <span className="text-white font-bold text-xs">MC</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-1">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs text-white font-black text-xs tracking-tighter">
              MC
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">MilkChillar</h2>
              <p className="text-[10px] text-slate-400 font-medium">Dairy Management</p>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Quick Search Bar (visible when expanded) */}
      {!isCollapsed && (
        <div className="px-3 pt-2 pb-1.5 border-b border-slate-100/80 bg-slate-50/50 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search... (e.g. sale, p&l)"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
                title="Clear search"
              >
                <X size={12} />
              </button>
            ) : (
              <button
                onClick={toggleAllSections}
                className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                title="Expand/Collapse all submenus"
              >
                <ChevronsUpDown size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav
        ref={navRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2 px-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200"
      >
        {filteredNavigation.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <p className="text-xs text-slate-400">No links matching</p>
            <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">"{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-[11px] text-blue-600 hover:underline font-medium"
            >
              Clear filter
            </button>
          </div>
        ) : (
          filteredNavigation.map(({ section, items }) => (
            <div key={section} className="space-y-0.5">
              {!isCollapsed && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-0.5">
                  {section}
                </p>
              )}

              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = pathname === item.href;
                  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                  const isSubItemActive = Boolean(item.subItems && item.subItems.some(sub => pathname === sub.href));

                  if (hasSubItems) {
                    const sectionKey = item.label.toLowerCase().replace(/\s+/g, '-');
                    const isExpanded = searchQuery
                      ? true
                      : (hoveredSection === sectionKey);

                    return (
                      <div
                        key={item.label}
                        className="space-y-0.5"
                        onMouseEnter={() => handleMouseEnter(sectionKey)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          onClick={() => {
                            setHoveredSection(prev => prev === sectionKey ? null : sectionKey);
                          }}
                          className={clsx(
                            'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group',
                            isSubItemActive
                              ? 'bg-blue-50/70 text-blue-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                          )}
                          title={item.label}
                        >
                          <span className={clsx(
                            'flex items-center justify-center shrink-0 w-4 h-4 transition-colors',
                            isSubItemActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                          )}>
                            {item.icon}
                          </span>

                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left truncate">{item.label}</span>
                              <span className="text-slate-400 group-hover:text-slate-600 transition-transform">
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </span>
                            </>
                          )}
                        </button>

                        {/* Sub-items */}
                        {isExpanded && !isCollapsed && (
                          <div className="ml-4 pl-2 border-l border-slate-200/80 space-y-0.5 py-0.5 animate-in fade-in-50 duration-150">
                            {item.subItems!.map((subItem) => {
                              const isChildActive = pathname === subItem.href;

                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  data-sidebar-active={isChildActive ? "true" : "false"}
                                  className={clsx(
                                    'flex items-center gap-2 px-2 py-1 rounded-md text-[11.5px] transition-all',
                                    isChildActive
                                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                                      : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
                                  )}
                                  title={subItem.label}
                                >
                                  <span className={clsx(
                                    'shrink-0 w-3.5 h-3.5 flex items-center justify-center',
                                    isChildActive ? 'text-white' : 'text-slate-400'
                                  )}>
                                    {subItem.icon}
                                  </span>
                                  <span className="truncate">{subItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-sidebar-active={isActive ? "true" : "false"}
                      className={clsx(
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group',
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                      )}
                      title={item.label}
                    >
                      <span className={clsx(
                        'flex items-center justify-center shrink-0 w-4 h-4 transition-colors',
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                      )}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* User Info & Settings Footer */}
      <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-1 shrink-0">
        {isCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-2xs transition-all"
          >
            <Settings size={15} className="text-slate-500" />
            <span>Settings</span>
          </button>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </aside>
  );
}
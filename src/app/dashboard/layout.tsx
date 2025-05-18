"use client"

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const user = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, read: true }
                    : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
    };

    const navLinks = [
        ...(user.role === 'admin' ? [{
            href: '/dashboard/products', label: 'Products', icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        }] : []),
        {
            href: '/dashboard/shipments', label: 'Shipments', icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            )
        },
        ...(user.role === 'admin' ? [{
            href: '/dashboard/inventory', label: 'Inventory', icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        }] : []),
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">Distributech</h1>
                </div>
                <nav className="mt-6">
                    <div className="px-4 space-y-2">
                        {navLinks.map(link => {
                            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center px-4 py-2 rounded-lg transition font-medium ${isActive
                                        ? 'bg-blue-100 text-blue-700 font-bold border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="ml-64">
                <header className="bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between px-8 py-4">
                        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                        <div className="flex items-center space-x-4">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className="p-2 text-gray-600 hover:text-blue-600 transition relative">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="right">
                                    <SheetHeader>
                                        <SheetTitle>Notifications</SheetTitle>
                                        <SheetDescription>
                                            {notifications.length > 0 ? (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Mark all as read
                                                </button>
                                            ) : null}
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-4 space-y-4">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-gray-500">No new notifications.</div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-blue-50'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                {new Date(notification.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-xs text-blue-600 hover:text-blue-800"
                                                            >
                                                                Mark as read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600"></div>
                                <span className="text-gray-700">User</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
} 
import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  user: User | null;
  unreadNotifications: number;
  onNotificationsClick: () => void;
  onLogout: () => void;
}

export default function Header({ user, unreadNotifications, onNotificationsClick, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Hey {user?.name?.split(' ')[0] ?? 'there'}
          </h2>
          <p className="text-gray-600 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={onNotificationsClick}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            title="Notifications"
          >
            <Bell className="h-6 w-6" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-gray-200">
                <span className="text-white font-medium text-sm">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
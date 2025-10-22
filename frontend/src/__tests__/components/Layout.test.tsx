import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../lib/store';

// Mock the useAuth hook
vi.mock('../../lib/store', () => ({
  useAuth: vi.fn(),
}));

// Mock the useTranslation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the socket service
vi.mock('../../lib/socket', () => ({
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

// Mock the ThemeSwitcher component
vi.mock('../../components/ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme Switcher</div>,
}));

// Mock the LanguageSwitcher component
vi.mock('../../components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

// Mock the NotificationBell component
vi.mock('../../components/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell">Notification Bell</div>,
}));

const MockLayout = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <Layout>{children}</Layout>
  </BrowserRouter>
);

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo and basic navigation', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: vi.fn(),
    });

    render(
      <MockLayout>
        <div>Test content</div>
      </MockLayout>
    );

    // Check for the header logo specifically
    const headerLogo = screen.getByRole('link', { name: 'eMirimo' });
    expect(headerLogo).toBeInTheDocument();
  });

  it('renders login and register buttons when user is not logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: vi.fn(),
    });

    render(
      <MockLayout>
        <div>Test content</div>
      </MockLayout>
    );

    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.getByText('register')).toBeInTheDocument();
  });

  it('renders user navigation when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { name: 'Test User', role: 'seeker' },
      logout: vi.fn(),
    });

    render(
      <MockLayout>
        <div>Test content</div>
      </MockLayout>
    );

    expect(screen.getByText('welcome, Test User')).toBeInTheDocument();
    expect(screen.getByText('logout')).toBeInTheDocument();
  });

  it('renders children content', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: vi.fn(),
    });

    render(
      <MockLayout>
        <div data-testid="test-content">Test content</div>
      </MockLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
});

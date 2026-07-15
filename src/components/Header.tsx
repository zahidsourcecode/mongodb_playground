import { Database, ExternalLink, Menu, Moon, RotateCcw, Sun } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export function Header({ onMenuClick, showMenu = false }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { resetData } = useDatabase();

  return (
    <header
      className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border-b shrink-0"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-9 h-9 rounded-lg border transition-colors hover:border-primary hover:text-primary shrink-0 lg:hidden"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            title="Open menu"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary shrink-0">
          <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold leading-tight truncate">MongoPlayground</h1>
          <p className="text-xs hidden md:block truncate" style={{ color: 'var(--text-muted)' }}>
            Practice MongoDB queries — no install, no login
          </p>
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            {['React 19', 'Vite', 'TypeScript', 'Tailwind CSS'].map((tech) => (
              <span
                key={tech}
                className="px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium rounded-md border"
                style={{
                  background: 'var(--primary-light)',
                  borderColor: 'rgba(78, 189, 211, 0.35)',
                  color: '#4EBDD3',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={() => resetData()}
          className="flex items-center justify-center sm:gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 text-sm rounded-lg border transition-colors hover:border-primary hover:text-primary"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          title="Reset to seed data"
          aria-label="Reset to seed data"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">Reset</span>
        </button>

        <a
          href="https://zahid-career.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-3 py-1 text-sm rounded-lg border transition-colors hover:border-primary group"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          title="Zahid Hasan — Visit developer portfolio"
        >
          <img
            src="/developer.png"
            alt="Zahid Hasan"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover object-top ring-2 ring-transparent group-hover:ring-primary transition-all"
          />
          <span className="hidden md:inline group-hover:text-primary transition-colors">Developer</span>
          <ExternalLink className="w-3 h-3 opacity-60 hidden md:inline group-hover:text-primary transition-colors" />
        </a>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-lg border transition-colors hover:border-primary hover:text-primary"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}

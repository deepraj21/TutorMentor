
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700/40 py-4 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-xl">{title}</h1>
      </div>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    </header>
  );
};

export default Header;

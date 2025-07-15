import React from "react";
import { useTheme, ThemeMode } from "../contexts/ThemeContext";
import "./ThemeToggle.css";

const ThemeToggle: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme();

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "🖥️" },
  ];

  const handleThemeChange = (newTheme: ThemeMode) => {
    document.documentElement.classList.add("theme-transitioning");
    setThemeMode(newTheme);

    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 200);
  };

  return (
    <div className="theme-toggle">
      <div className="theme-toggle-label">Theme</div>
      <div className="theme-toggle-options">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            className={`theme-option ${themeMode === option.value ? "active" : ""}`}
            onClick={() => handleThemeChange(option.value)}
            title={`Switch to ${option.label} mode`}
          >
            <span className="theme-option-icon">{option.icon}</span>
            <span className="theme-option-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;

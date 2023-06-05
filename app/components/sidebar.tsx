import React, { useEffect, useCallback, MouseEvent, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppConfig } from "../types";
import { MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH, NARROW_SIDEBAR_WIDTH, Path, REPO_URL } from "../constant";
import { useMobileScreen } from "../utils";
import { showToast } from "./ui-lib";
import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";

interface SideBarProps {
  className?: string;
}

function useDragSideBar(config: AppConfig) {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 50) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);
      config.update((config) => {
        config.sidebarWidth = nextWidth;
      });
    },
    [config]
  );

  const handleMouseUp = useCallback(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [config.sidebarWidth, handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      startX.current = e.clientX;

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  const isMobileScreen = useMobileScreen();
  const shouldNarrow = !isMobileScreen && (config.sidebarWidth ?? 300) < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow ? NARROW_SIDEBAR_WIDTH : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return { handleMouseDown };
}

const SideBar: React.FC<SideBarProps> = ({ className }) => {
  const config = useAppConfig();
  const navigate = useNavigate();

  const handleOpenSettings = useCallback(() => {
    navigate(Path.Settings);
  }, [navigate]);

  const handleOpenCreateSession = useCallback(() => {
    navigate(Path.CreateSession);
  }, [navigate]);

  const handleOpenPlugins = useCallback(() => {
    navigate(Path.Plugins);
  }, [navigate]);

  const handleToggleMask = useCallback(() => {
    config.update((config) => {
      config.mask = !config.mask;
    });
    showToast(Locale.Tips.MaskToggle);
  }, [config]);

  const { handleMouseDown } = useDragSideBar(config);

  const isMobileScreen = useMobileScreen();
  const sidebarClassName = isMobileScreen ? "sidebar-narrow" : "";

  return (
    <aside className={`sidebar ${sidebarClassName} ${className}`}>
      <div className="sidebar-drag-area" onMouseDown={handleMouseDown} />
      <div className="sidebar-content">
        <div className="sidebar-header">
          <Link to={Path.Home}>
            <img src="/static/logo.svg" className="logo" alt={Locale.Title} />
          </Link>
          <IconButton
            className="btn btn-settings"
            icon={<SettingsIcon />}
            title={Locale.Tooltip.Settings}
            onClick={handleOpenSettings}
          />
        </div>
        {/* ChatList component */}
        <div className="sidebar-footer">
          <IconButton
            className="btn btn-create-session"
            icon={<AddIcon />}
            title={Locale.Tooltip.CreateSession}
            onClick={handleOpenCreateSession}
          />
          <IconButton
            className="btn btn-toggle-mask"
            icon={<MaskIcon />}
            title={Locale.Tooltip.ToggleMask}
            onClick={handleToggleMask}
          />
          <IconButton
            className="btn btn-plugins"
            icon={<PluginIcon />}
            title={Locale.Tooltip.Plugins}
            onClick={handleOpenPlugins}
          />
          <a className="btn btn-github" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <img src="/static/github.svg" alt={Locale.Tooltip.Github} />
          </a>
        </div>
      </div>
      <div className="sidebar-resize-handle" onMouseDown={handleMouseDown}>
        <div className="handle-icon">
          <CloseIcon />
        </div>
      </div>
    </aside>
  );
};

export default SideBar;

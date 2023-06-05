import React, { useEffect, useCallback, MouseEvent, KeyboardEvent, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import dynamic from "next/dynamic";
import Locale from "../locales";
import { useAppConfig, useChatStore } from "../store";
import { MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH, NARROW_SIDEBAR_WIDTH, Path, REPO_URL } from "../constant";
import { useMobileScreen } from "../utils";
import { showToast } from "./ui-lib";
import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

interface SideBarProps {
  className?: string;
}

function useHotKey() {
  const chatStore = useChatStore();

  const onKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        const n = chatStore.sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = chatStore.currentSessionIndex;
        if (e.key === "ArrowUp") {
          chatStore.selectSession(limit(i - 1));
        } else if (e.key === "ArrowDown") {
          chatStore.selectSession(limit(i + 1));
        }
      }
    },
    [chatStore]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown as any); // Explicitly cast to any to avoid type error
    return () => window.removeEventListener("keydown", onKeyDown as any); // Explicitly cast to any to avoid type error
  }, [onKeyDown]);

  return { onKeyDown };
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
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

  const onDragMouseDown = useCallback(
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

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBar({ className }: SideBarProps): JSX.Element {
  const chatStore = useChatStore();
  const config = useAppConfig();
  const navigate = useNavigate();

  const { onKeyDown } = useHotKey();
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();

  const handleOpenSettings = () => {
    navigate(Path.Settings);
  };

  const handleOpenCreateSession = () => {
    navigate(Path.CreateSession);
  };

  const handleOpenPlugins = () => {
    navigate(Path.Plugins);
  };

  const handleToggleMask = () => {
    config.update((config) => {
      config.mask = !config.mask;
    });
    showToast(Locale.Tips.MaskToggle);
  };

  const sidebarClassName = shouldNarrow ? "sidebar-narrow" : "";

  useEffect(() => {
    const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

    const handleMouseMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 50) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);
      config.update((config) => {
        config.sidebarWidth = nextWidth;
      });
    };

    const handleMouseUp = () => {
      startDragWidth.current = config.sidebarWidth ?? 300;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e: MouseEvent) => {
      startX.current = e.clientX;

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const isMobileScreen = useMobileScreen();
    const shouldNarrow = !isMobileScreen && (config.sidebarWidth ?? 300) < MIN_SIDEBAR_WIDTH;

    const handleResize = () => {
      const barWidth = shouldNarrow ? NARROW_SIDEBAR_WIDTH : limit(config.sidebarWidth ?? 300);
      const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
      document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-drag-area" onMouseDown={onDragMouseDown} />
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
        <ChatList />
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
      <div className="sidebar-resize-handle" onMouseDown={onDragMouseDown}>
        <div className="handle-icon">
          <CloseIcon />
        </div>
      </div>
    </aside>
  );
}

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
import Image from "next/image";

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

function useDragSideBar(config: any) {
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
      config.setSidebarWidth(limit(startDragWidth.current + d));
    },
    [config, limit, startDragWidth]
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      startX.current = e.clientX;
      startDragWidth.current = config.sidebarWidth ?? 300;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [config, handleMouseMove, handleMouseUp]
  );

  return { handleMouseDown };
}

const Sidebar: React.FC<SideBarProps> = ({ className }) => {
  const navigate = useNavigate();
  const chatStore = useChatStore();
  const appConfig = useAppConfig();
  const { onKeyDown } = useHotKey();
  const isMobileScreen = useMobileScreen();

  const handleSettingsClick = useCallback(() => {
    navigate(Path.Settings);
  }, [navigate]);

  const handleAddChatClick = useCallback(() => {
    showToast("Not implemented yet!");
  }, []);

  const handleMaskClick = useCallback(() => {
    chatStore.selectSession(-1);
  }, [chatStore]);

  const { handleMouseDown } = useDragSideBar(appConfig);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown as any); // Explicitly cast to any to avoid type error
    return () => document.removeEventListener("keydown", onKeyDown as any); // Explicitly cast to any to avoid type error
  }, [onKeyDown]);

  return (
    <aside className={className}>
      <div className="flex items-center justify-between h-10 px-2">
        <Link to={Path.Home}>
          <Image src="/logo.png" alt="Logo" width={120} height={24} /> {/* Replace <img> with <Image> */}
        </Link>
        <IconButton
          className="w-8 h-8 ml-2"
          icon={SettingsIcon}
          title={Locale.Settings}
          onClick={handleSettingsClick}
        />
      </div>
      <ChatList />
      <div className="flex justify-center items-center py-4">
        <IconButton
          className="w-8 h-8"
          icon={AddIcon}
          title={Locale.AddChat}
          onClick={handleAddChatClick}
        />
      </div>
      <div className="flex items-center justify-center h-10 px-2">
        <IconButton
          className="w-8 h-8"
          icon={CloseIcon}
          title={Locale.Close}
          onClick={handleMaskClick}
        />
      </div>
      {isMobileScreen && (
        <div
          className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-lg cursor-move absolute right-2 bottom-2"
          onMouseDown={handleMouseDown}
        >
          <Image src={PluginIcon} alt="Drag Icon" width={16} height={16} /> {/* Replace <img> with <Image> */}
        </div>
      )}
      {!isMobileScreen && (
        <div
          className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-lg cursor-move absolute right-2 top-2"
          onMouseDown={handleMouseDown}
        >
          <Image src={PluginIcon} alt="Drag Icon" width={16} height={16} /> {/* Replace <img> with <Image> */}
        </div>
      )}
      {isMobileScreen && (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-lg cursor-move absolute right-2 bottom-10">
          <Image src={MaskIcon} alt="Mask Icon" width={16} height={16} /> {/* Replace <img> with <Image> */}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

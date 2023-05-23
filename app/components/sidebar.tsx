import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import dynamic from "next/dynamic";
import Locale from "../locales";
import { useAppConfig, useChatStore } from "../store";
import { useMobileScreen } from "../utils";
import { showToast } from "./ui-lib";
import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";
import styles from "./home.module.scss";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

const MAX_SIDEBAR_WIDTH = 400; // Placeholder value, replace it with the actual maximum sidebar width
const MIN_SIDEBAR_WIDTH = 200; // Placeholder value, replace it with the actual minimum sidebar width

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chatStore]);
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = (e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  };

  const handleMouseUp = () => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const onDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MAX_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? MIN_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty(
      "--sidebar-width",
      sideBarWidth
    );
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();

  useHotKey();

  const handleDeleteChat = () => {
    if (confirm(Locale.Home.DeleteChat)) {
      chatStore.deleteSession(chatStore.currentSessionIndex);
    }
  };

  const handleNewChat = () => {
    if (config.dontShowMaskSplashScreen) {
      chatStore.newSession();
      navigate("/chat");
    } else {
      navigate("/new-chat", { state: { fromHome: true } });
    }
  };

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-title"]}>AbhayAI SllIam 2.7 LLM Syst and oAi</div>
        <div className={styles["sidebar-sub-title"]}>©SYST</div>
      </div>

      <div className={styles["sidebar-header-bar"]}>
        <IconButton
          icon={<MaskIcon />}
          text={shouldNarrow ? undefined : Locale.Mask.Name}
          className={styles["sidebar-bar-button"]}
          onClick={handleNewChat}
          shadow
        />
        <IconButton
          icon={<PluginIcon />}
          text={shouldNarrow ? undefined : Locale.Plugin.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => showToast(Locale.WIP)}
          shadow
        />
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate("/");
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={`${styles["sidebar-action"]} ${styles.mobile}`}>
            <IconButton icon={<CloseIcon />} onClick={handleDeleteChat} />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to="/settings">
              <IconButton icon={<SettingsIcon />} shadow />
            </Link>
          </div>
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={handleNewChat}
            shadow
          />
        </div>
      </div>

      <div
        className={styles["sidebar-drag"]}
        onMouseDown={onDragMouseDown}
      ></div>
    </div>
  );
}

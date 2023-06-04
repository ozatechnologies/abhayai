import React, { useEffect, useRef, MouseEvent, KeyboardEvent } from "react";
import styles from "./home.module.scss";
import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";
import Locale from "../locales";
import { useAppConfig, useChatStore } from "../store";
import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";
import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showToast } from "./ui-lib";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
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
  }, [chatStore.sessions.length, chatStore.currentSessionIndex]);
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => {
      config.sidebarWidth = nextWidth;
    });
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && (config.sidebarWidth ?? 300) < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
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

export function SideBar(props: any) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();

  useHotKey();

  const openDocChainGPT = () => {
    window.open("https://docchaingpt.streamlit.app/", "_blank");
  };

  const openPrompts = () => {
    window.open("https://flowgpt.com/", "_blank");
  };

  const redirectToAutoGPT = () => {
    window.location.href = "https://yaaagia2.vercel.app/en";
  };

  const openAwas = () => {
    window.open("https://awas-gpt.vercel.app", "_blank");
  };

  const handleChatDelete = () => {
    if (window.confirm(Locale.Home.DeleteChat)) {
      chatStore.deleteSession(chatStore.currentSessionIndex);
    }
  };

  const handleNewChat = () => {
    if (config.dontShowMaskSplashScreen) {
      chatStore.newSession();
      navigate(Path.Chat);
    } else {
      navigate(Path.NewChat);
    }
  };

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow ? styles["narrow-sidebar"] : ""
      }`}
    >
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-title"]}>Avana</div>
        <div className={styles["sidebar-sub-title"]}>SYST</div>
      </div>

      <div className={styles["sidebar-header-bar"]}>
        <IconButton
          icon={<MaskIcon />}
          text={shouldNarrow ? undefined : Locale.Mask.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => navigate(Path.NewChat, { state: { fromHome: true } })}
          shadow
        />
        <IconButton
          icon={<PluginIcon />}
          text={shouldNarrow ? undefined : Locale.Plugin.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => showToast(Locale.WIP)}
          shadow
        />
        <IconButton
          text="DocChain GPT"
          className={styles["sidebar-bar-button"]}
          onClick={openDocChainGPT}
          shadow
        />
        <IconButton
          text="Prompts"
          className={styles["sidebar-bar-button"]}
          onClick={openPrompts}
          shadow
        />
        <IconButton
          text="Awas"
          className={styles["sidebar-bar-button"]}
          onClick={openAwas}
          shadow
        />
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={`${styles["sidebar-action"]} ${styles.mobile}`}>
            <IconButton icon={<CloseIcon />} onClick={handleChatDelete} />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
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

      <div className={styles["autogpt-button"]}>
        <button onClick={redirectToAutoGPT}>AutoGPT</button>
      </div>
    </div>
  );
}

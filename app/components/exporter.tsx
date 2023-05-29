import React from 'react';

interface ChatMessage {
  role: string;
  content: string;
}

interface ExportAvatarProps {
  avatar: string;
}

interface MarkdownProps {
  content: string;
  fontSize: number;
  defaultShow: boolean;
}

function ExportAvatar(props: ExportAvatarProps) {
  return <img src={props.avatar} alt="Avatar" />;
}

function Markdown(props: MarkdownProps) {
  return <div>{props.content}</div>;
}

function PreviewActions(props: {
  copy: () => void;
  download: () => void;
  showCopy: boolean;
  messages: ChatMessage[];
}) {
  // Implement the PreviewActions component
  return null;
}

export function ImagePreviewer(props: {
  messages: ChatMessage[];
  topic: string;
}) {
  const copy = () => {
    // Implement the copy logic
  };

  const download = () => {
    // Implement the download logic
  };

  return (
    <div className={styles["image-previewer"]}>
      <PreviewActions
        copy={copy}
        download={download}
        showCopy={!isMobile}
        messages={props.messages}
      />
      <div
        className={`${styles["preview-body"]} ${styles["default-theme"]}`}
        ref={previewRef}
      >
        <div>
          <div className={styles["main-title"]}>ABHAY</div>
          <div className={styles["sub-title"]}>SYST</div>
          <div className={styles["icons"]}>
            <ExportAvatar avatar={config.avatar} />
            <span className={styles["icon-space"]}>&</span>
            <ExportAvatar avatar={mask.avatar} />
          </div>
        </div>
        <div>
          <div className={styles["chat-info-item"]}>
            Model: {mask.modelConfig.model}
          </div>
          <div className={styles["chat-info-item"]}>
            Messages: {props.messages.length}
          </div>
          <div className={styles["chat-info-item"]}>
            Topic: {session.topic}
          </div>
          <div className={styles["chat-info-item"]}>
            Time:{" "}
            {new Date(
              props.messages.at(-1)?.date ?? Date.now()
            ).toLocaleString()}
          </div>
        </div>
        {props.messages.map((m, i) => {
          return (
            <div
              className={styles["message"] + " " + styles["message-" + m.role]}
              key={i}
            >
              <div className={styles["avatar"]}>
                <ExportAvatar
                  avatar={m.role === "user" ? config.avatar : mask.avatar}
                />
              </div>

              <div className={styles["body"]}>
                <Markdown
                  content={m.content}
                  fontSize={config.fontSize}
                  defaultShow
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarkdownPreviewer(props: {
  messages: ChatMessage[];
  topic: string;
}) {
  const mdText =
    `# ${props.topic}\n\n` +
    props.messages
      .map((m) => {
        return m.role === "user"
          ? `## ${Locale.Export.MessageFromYou}:\n${m.content}`
          : `## ${Locale.Export.MessageFromChatGPT}:\n${m.content.trim()}`;
      })
      .join("\n\n");

  const copy = () => {
    // Implement the copy logic
  };

  const download = () => {
    // Implement the download logic
  };

  return (
    <>
      <PreviewActions
        copy={copy}
        download={download}
        messages={props.messages}
      />
      <div className="markdown-body">
        <pre className={styles["export-content"]}>{mdText}</pre>
      </div>
    </>
  );
}

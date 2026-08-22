import { createMidiNoteListener } from "~/hooks/midi";
import { useNavigation } from "~/hooks/navigation";
import { t } from "~/lib/i18n";

import Menu, { type MenuItem } from "../menu";

interface PauseMenuProps {
  onClose?: () => void;
  onRestart?: () => void;
  onNext?: () => void;
  onExit?: () => void;
  showNext?: boolean;
  class?: string;
  gradient?: "gradient-sing" | "gradient-party";
}

export default function PauseMenu(props: PauseMenuProps) {
  useNavigation({
    layer: 1,
    onKeydown: (event) => {
      if (event.action === "back") {
        props.onClose?.();
      }
    },
  });

  createMidiNoteListener(1, 30, () => {
    props.onRestart?.();
  });

  createMidiNoteListener(1, 31, () => {
    props.onExit?.();
  });

  // MIDI Note 9 is the bottom left switch on the Harley Benton MP100 in Fortress Utility page
  createMidiNoteListener(1, 9, () => {
    props.onRestart?.();
  });

  // MIDI Note 10 is the bottom second switch on the Harley Benton MP100 in Fortress Utility page
  createMidiNoteListener(1, 10, () => {
    props.onExit?.();
  });

  const menuItems = (): MenuItem[] => [
    {
      type: "button",
      label: t("game.pause.resume"),
      action: () => props.onClose?.(),
    },
    {
      type: "button",
      label: t("game.pause.restart"),
      action: () => props.onRestart?.(),
    },
    ...(props.showNext
      ? [
          {
            type: "button" as const,
            label: t("game.pause.next"),
            action: () => props.onNext?.(),
          },
        ]
      : []),
    {
      type: "button",
      label: t("game.pause.exit"),
      action: () => props.onExit?.(),
    },
  ];

  return (
    <div
      class="h-full w-full p-16"
      classList={{
        [props.class || ""]: true,
      }}
    >
      <Menu items={menuItems()} layer={1} gradient={props.gradient} />
    </div>
  );
}

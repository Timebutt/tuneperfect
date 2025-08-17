import { type LinkProps, useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { sendWebsocketMessage } from "~/hooks/websocket";
import type { User } from "~/lib/types";
import type { LocalSong } from "~/lib/ultrastar/song";
import { getMaxScore, getRelativeScore } from "~/lib/utils/score";

export interface RoundSettings {
  song: LocalSong;
  players: (User | undefined)[];
  voices: number[];
  returnTo?: LinkProps["to"];
}

export interface Score {
  normal: number;
  golden: number;
  bonus: number;
}

function createRoundStore() {
  const [settings, setSettings] = createSignal<RoundSettings>();
  const [scores, setScores] = createSignal<Score[]>([]);

  const reset = () => {
    setSettings(undefined);
    setScores([]);
  };

  return {
    settings,
    scores,
    setSettings,
    setScores,
    reset,
  };
}

export const roundStore = createRoundStore();

export function useRoundActions() {
  const navigate = useNavigate();

  const startRound = (settings: RoundSettings) => {
    roundStore.setSettings(settings);
    roundStore.setScores([]);
    navigate({ to: "/game" });
  };

  const endRound = (scores: Score[], submitScores: boolean) => {
    if (submitScores) {
      roundStore.setScores(scores);

      const voicesCount = roundStore.settings()?.song?.voices.length;
      if (!voicesCount) {
        return;
      }

      sendWebsocketMessage(
        JSON.stringify({
          type: "scores",
          value: scores.map((absoluteScore, index) => {
            const voice = roundStore.settings()?.song?.voices[index + 1 > voicesCount ? 0 : index];
            if (!voice) {
              return 0;
            }

            const maxScore = getMaxScore(voice);
            const relativeScore = getRelativeScore(absoluteScore, maxScore);
            return Math.floor(relativeScore.normal + relativeScore.golden + relativeScore.bonus);
          }),
        }),
      );

      navigate({ to: "/game/score" });
    } else {
      navigate({ to: "/sing" });
    }
  };

  const returnRound = () => {
    navigate({ to: roundStore.settings()?.returnTo ?? "/sing" });
  };

  return {
    startRound,
    endRound,
    returnRound,
  };
}

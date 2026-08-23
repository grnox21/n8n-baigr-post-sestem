"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { DEFAULT_TOPIC } from "./constants";
import { checkRatioCompatibility } from "./logic";
import type {
  AspectRatio,
  ContentType,
  CreativeOSState,
  GenerationStatus,
  ModelChoice,
  Quality,
  RatioCompatibilityResult,
} from "./types";

type Action =
  | { type: "SET_CONTENT_TYPE"; value: ContentType }
  | { type: "SET_MODEL"; value: ModelChoice }
  | { type: "SET_ASPECT_RATIO"; value: AspectRatio }
  | { type: "SET_QUALITY"; value: Quality }
  | { type: "SET_TOPIC"; value: string }
  | { type: "SET_STATUS"; value: GenerationStatus }
  | { type: "SET_REVISION_NOTE"; value: string }
  | { type: "BUMP_VERSION" }
  | { type: "RESET" };

const initialState: CreativeOSState = {
  telegramChatId: "TG-88214",
  contentType: "image",
  model: "nano_banana_pro",
  aspectRatio: "4:5",
  quality: "2K",
  topic: DEFAULT_TOPIC,
  generationStatus: "idle",
  version: 1,
  revisionNote: "",
  interacted: false,
  autoplay: false,
};

function reducer(state: CreativeOSState, action: Action): CreativeOSState {
  switch (action.type) {
    case "SET_CONTENT_TYPE":
      return { ...state, contentType: action.value, interacted: true };
    case "SET_MODEL":
      return {
        ...state,
        model: action.value,
        interacted: true,
        generationStatus: "idle",
      };
    case "SET_ASPECT_RATIO":
      return {
        ...state,
        aspectRatio: action.value,
        interacted: true,
        generationStatus: "idle",
      };
    case "SET_QUALITY":
      return { ...state, quality: action.value, interacted: true };
    case "SET_TOPIC":
      return { ...state, topic: action.value, interacted: true };
    case "SET_STATUS":
      return { ...state, generationStatus: action.value };
    case "SET_REVISION_NOTE":
      return { ...state, revisionNote: action.value };
    case "BUMP_VERSION":
      return { ...state, version: state.version + 1 };
    case "RESET":
      return {
        ...initialState,
        contentType: state.contentType,
        model: state.model,
        aspectRatio: state.aspectRatio,
        quality: state.quality,
        topic: state.topic,
        interacted: true,
      };
    default:
      return state;
  }
}

interface CreativeOSContextValue {
  state: CreativeOSState;
  compatibility: RatioCompatibilityResult;
  setContentType: (value: ContentType) => void;
  setModel: (value: ModelChoice) => void;
  setAspectRatio: (value: AspectRatio) => void;
  setQuality: (value: Quality) => void;
  setTopic: (value: string) => void;
  setRevisionNote: (value: string) => void;
  runGeneration: () => void;
  approve: () => void;
  requestRevision: () => void;
  cancelProject: () => void;
  startNewProject: () => void;
}

const CreativeOSContext = createContext<CreativeOSContextValue | null>(null);

const wait = (ms: number, reduced: boolean) =>
  new Promise<void>((resolve) => setTimeout(resolve, reduced ? Math.min(ms, 120) : ms));

export function CreativeOSProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const runToken = useRef(0);

  const compatibility = useMemo(
    () => checkRatioCompatibility(state.model, state.aspectRatio),
    [state.model, state.aspectRatio]
  );

  const runGeneration = useCallback(async () => {
    const token = ++runToken.current;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const compat = checkRatioCompatibility(state.model, state.aspectRatio);
    const steps: GenerationStatus[] = compat.resizeRequired
      ? ["strategizing", "routing", "generating", "resizing", "ready"]
      : ["strategizing", "routing", "generating", "ready"];
    const timings: Record<string, number> = {
      strategizing: 1100,
      routing: 750,
      generating: 1700,
      resizing: 900,
      ready: 0,
    };

    for (const step of steps) {
      if (runToken.current !== token) return;
      dispatch({ type: "SET_STATUS", value: step });
      await wait(timings[step] ?? 800, Boolean(reduced));
    }
  }, [state.model, state.aspectRatio]);

  const approve = useCallback(() => {
    runToken.current++;
    dispatch({ type: "SET_STATUS", value: "approved" });
  }, []);

  const requestRevision = useCallback(async () => {
    runToken.current++;
    dispatch({ type: "SET_STATUS", value: "revision_requested" });
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    await wait(1000, Boolean(reduced));
    dispatch({ type: "BUMP_VERSION" });
    await runGeneration();
  }, [runGeneration]);

  const cancelProject = useCallback(() => {
    runToken.current++;
    dispatch({ type: "SET_STATUS", value: "cancelled" });
  }, []);

  const startNewProject = useCallback(() => {
    runToken.current++;
    dispatch({ type: "RESET" });
  }, []);

  const value: CreativeOSContextValue = {
    state,
    compatibility,
    setContentType: (v) => dispatch({ type: "SET_CONTENT_TYPE", value: v }),
    setModel: (v) => dispatch({ type: "SET_MODEL", value: v }),
    setAspectRatio: (v) => dispatch({ type: "SET_ASPECT_RATIO", value: v }),
    setQuality: (v) => dispatch({ type: "SET_QUALITY", value: v }),
    setTopic: (v) => dispatch({ type: "SET_TOPIC", value: v }),
    setRevisionNote: (v) => dispatch({ type: "SET_REVISION_NOTE", value: v }),
    runGeneration,
    approve,
    requestRevision,
    cancelProject,
    startNewProject,
  };

  return (
    <CreativeOSContext.Provider value={value}>{children}</CreativeOSContext.Provider>
  );
}

export function useCreativeOS() {
  const ctx = useContext(CreativeOSContext);
  if (!ctx) throw new Error("useCreativeOS must be used within CreativeOSProvider");
  return ctx;
}

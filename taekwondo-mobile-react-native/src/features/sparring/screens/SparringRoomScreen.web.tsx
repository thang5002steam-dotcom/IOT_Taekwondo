import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Edit,
  Fullscreen,
  HelpCircle,
  Logout3,
  MessageEdit,
  Minus,
  Monitor,
  Plus,
  Settings,
} from "reicon-react-native";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";
import type { SparringCommand, SparringSide } from "../domain/sparring.types";
import { formatSparringTime, isSparringRoomCode } from "../domain/sparringRoom";
import { useSparringRoom } from "../hooks/useSparringRoom";

export const BASE_CANVAS = {
  width: 1920,
  height: 1080,
} as const;

export const SPAR_COLORS = {
  red: "rgba(255,29,29,0.94)",
  blue: "rgb(24,24,212)",
  gray: "rgb(211,211,211)",
  pageBackground: "#FFFFFF",
  headerBackground: "#1C1C1E",
  clockPaused: "rgb(211,211,211)",
  clockRunning: "#FACC15",
  matchScoreBadge: "#FFE500",
  textDark: "#000000",
  fontFamily: "Arial, Helvetica, sans-serif",
} as const;

export const OPERATOR_LAYOUT = {
  headerHeight: 68,
  logoWidth: 288,
  logoHeight: 49,
  headerIconSize: 32,
  roomCodeFontSize: 20,

  matchBadgeTop: 78,
  matchBadgeRight: 20,
  matchBadgeFontSize: 44,
  matchBadgePaddingH: 20,
  matchBadgePaddingV: 6,

  roundFontSize: 54,
  roundMarginTop: 8,

  timerWidth: 576,
  timerHeight: 194.4,
  timerFontSize: 162,
  timerBorderRadius: 21.6,
  timerMarginTop: 2,
  timerMarginBottom: 10,
  timerMarginVertical: 6,

  cardWidth: 576,
  cardHeight: 434,
  cardBorderRadius: 21.6,
  nameFontSize: 54,
  nameMarginBottom: 6,
  scoreFontSize: 378,

  penaltyBarWidth: 288,
  penaltyBarHeight: 32.4,
  penaltyBarRadius: 16.2,
  penaltyFontSize: 32.4,
  penaltyContainerHeight: 48,
  penaltyMarginTop: 8,

  controllerWidth: 477,
  controllerGap: 14,
  timeInputWidth: 142,
  timeInputHeight: 60,
  pointInputWidth: 104,
  pointInputHeight: 60,
  inputFontSize: 43.2,
  circleBtnSize: 43,
  controlHeaderFontSize: 16,

  footerHeight: 60,
  footerIconSize: 36,
  toggleWidth: 44,
  toggleHeight: 24,
  toggleThumbSize: 20,
} as const;

export const DISPLAY_LAYOUT = {
  headerHeight: 0,

  matchBadgeTop: 14,
  matchBadgeRight: 20,
  matchBadgeFontSize: 46,
  matchBadgePaddingH: 22,
  matchBadgePaddingV: 6,

  roundFontSize: 54,
  roundMarginTop: 12,

  timerWidth: 576,
  timerHeight: 194.4,
  timerFontSize: 162,
  timerBorderRadius: 21.6,
  timerMarginTop: 4,
  timerMarginBottom: 16,
  timerMarginVertical: 10,

  cardWidth: 748.8,
  cardHeight: 564.2,
  cardBorderRadius: 28,
  redStartX: 161,
  blueStartX: 1010,
  nameFontSize: 54,
  nameMarginBottom: 8,
  scoreFontSize: 378,

  penaltyBarWidth: 374.4,
  penaltyBarHeight: 42.1,
  penaltyBarRadius: 21,
  penaltyFontSize: 32.4,
  penaltyContainerHeight: 48,
  penaltyMarginTop: 10,

  bottomToggleHeight: 40,
  toggleIconSize: 28,
  toggleWidth: 36,
  toggleHeight: 20,
  toggleThumbSize: 16,
} as const;

export function computeSparringLayout(
  windowWidth: number,
  windowHeight: number,
  mode: "operator" | "display",
) {
  const width = windowWidth || BASE_CANVAS.width;
  const height = windowHeight || BASE_CANVAS.height;
  const scale = Math.min(
    width / BASE_CANVAS.width,
    height / BASE_CANVAS.height,
  );
  const token = mode === "operator" ? OPERATOR_LAYOUT : DISPLAY_LAYOUT;

  return {
    scale,
    width,
    height,
    token,
  };
}

export const SPARRING_IMAGES = {
  title: require("@/assets/images/sparring/title.png"),
};

const MAX_COMPETITOR_NAME_LENGTH = 30;

function normalizeStep(value: string, maximum: number): string {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return "1";
  return String(Math.min(maximum, Math.max(1, parsed)));
}

function stepAmount(value: string, maximum: number): number {
  return Number(normalizeStep(value, maximum));
}

type StepValueInputProps = {
  accessibilityLabel: string;
  maximum: number;
  value: string;
  onChange: (value: string) => void;
  width: number;
  height: number;
  fontSize: number;
};

function StepValueInput({
  accessibilityLabel,
  maximum,
  value,
  onChange,
  width,
  height,
  fontSize,
}: StepValueInputProps) {
  const commit = () => onChange(normalizeStep(value, maximum));
  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      value={value}
      onChangeText={(nextValue) =>
        onChange(nextValue.replace(/\D/g, "").slice(0, String(maximum).length))
      }
      onBlur={commit}
      onSubmitEditing={commit}
      keyboardType="number-pad"
      inputMode="numeric"
      maxLength={String(maximum).length}
      selectTextOnFocus
      style={[
        styles.valueBox,
        styles.valueInput,
        {
          width,
          height,
          fontSize,
          lineHeight: fontSize,
        },
      ]}
    />
  );
}

type EditableTeamNameProps = {
  editable: boolean;
  name: string;
  side: SparringSide;
  fontSize: number;
  style: StyleProp<TextStyle>;
  onCommit: (side: SparringSide, name: string) => void;
};

function EditableTeamName({
  editable,
  name,
  side,
  fontSize,
  style,
  onCommit,
}: EditableTeamNameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const committingRef = React.useRef(false);

  const finishEditing = () => {
    if (committingRef.current) return;
    committingRef.current = true;
    const normalized = draft.trim();
    if (normalized && normalized !== name) onCommit(side, normalized);
    setEditing(false);
  };

  if (editing && editable) {
    return (
      <TextInput
        accessibilityLabel={`Tên võ sĩ ${side === "red" ? "đỏ" : "xanh"}`}
        autoFocus
        maxLength={MAX_COMPETITOR_NAME_LENGTH}
        onBlur={finishEditing}
        onChangeText={setDraft}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === "Escape") {
            committingRef.current = true;
            setDraft(name);
            setEditing(false);
          }
        }}
        onSubmitEditing={finishEditing}
        selectTextOnFocus
        style={[
          styles.teamNameInput,
          style,
          {
            fontSize,
            lineHeight: fontSize,
            minHeight: fontSize * 1.2,
          },
        ]}
        value={draft}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole={editable ? "button" : undefined}
      accessibilityLabel={editable ? `Sửa tên ${name}` : name}
      disabled={!editable}
      onPress={() => {
        committingRef.current = false;
        setDraft(name);
        setEditing(true);
      }}
    >
      <ThemedText
        style={[
          style,
          {
            fontSize,
            lineHeight: fontSize,
          },
        ]}
        numberOfLines={1}
      >
        {name}
      </ThemedText>
    </Pressable>
  );
}

export type SparringRoomScreenProps = {
  windowDimensions?: { width: number; height: number };
};

export function SparringRoomScreen({
  windowDimensions,
}: SparringRoomScreenProps = {}) {
  const { roomCode: raw, mode: queryMode } = useLocalSearchParams<{
    roomCode: string;
    mode?: string;
  }>();
  const roomCode = Array.isArray(raw) ? raw[0] : raw;
  const { snapshot, operator, error, connecting, send } = useSparringRoom(
    roomCode ?? "",
  );

  const realDimensions = useWindowDimensions();
  const { width: windowWidth, height: windowHeight } =
    windowDimensions ?? realDimensions;
  const initialMode = queryMode === "display" ? "display" : "operator";
  const [viewMode, setViewMode] = useState<"operator" | "display">(initialMode);
  const [showSettings, setShowSettings] = useState(false);
  const [, setIsFullscreen] = useState(false);

  // Settings form states
  const [maxJudges, setMaxJudges] = useState(3);
  const [judgesToScore, setJudgesToScore] = useState(2);
  const [secondScoringWindow, setSecondScoringWindow] = useState(2.0);
  const [roundsPerMatch, setRoundsPerMatch] = useState(3);
  const [roundTimeSeconds, setRoundTimeSeconds] = useState(120);
  const [breakTimeSeconds, setBreakTimeSeconds] = useState(30);

  const [resetScoreBetweenRounds, setResetScoreBetweenRounds] = useState(true);
  const [resetPenaltiesBetweenRounds, setResetPenaltiesBetweenRounds] =
    useState(true);
  const [trackRoundWinners, setTrackRoundWinners] = useState(true);

  const [enableDisqualify, setEnableDisqualify] = useState(true);
  const [penaltiesToDisqualify, setPenaltiesToDisqualify] = useState(10);
  const [enablePointDiff, setEnablePointDiff] = useState(true);
  const [pointDiff, setPointDiff] = useState(20);
  const [enablePointWin, setEnablePointWin] = useState(true);
  const [pointsToWin, setPointsToWin] = useState(99);

  // Step amounts for middle controller
  const [timeStep, setTimeStep] = useState("1");
  const [redScoreStep, setRedScoreStep] = useState("1");
  const [blueScoreStep, setBlueScoreStep] = useState("1");
  const [redPenaltyStep, setRedPenaltyStep] = useState("1");
  const [bluePenaltyStep, setBluePenaltyStep] = useState("1");

  // Match round score badge
  const [redRoundsWon] = useState(0);
  const [blueRoundsWon] = useState(0);

  const layoutInfo = computeSparringLayout(windowWidth, windowHeight, viewMode);
  const { scale } = layoutInfo;

  const action = useCallback(
    (command: SparringCommand) => {
      send(command);
    },
    [send],
  );

  const toggleTimer = useCallback(() => {
    action(snapshot.running ? { type: "pause" } : { type: "start" });
  }, [action, snapshot.running]);

  const adjustScore = useCallback(
    (side: SparringSide, delta: number) => {
      action({ type: "operatorAdjustScore", side, delta });
    },
    [action],
  );

  const adjustPenalty = useCallback(
    (side: SparringSide, delta: number) => {
      action({ type: "operatorAdjustPenalty", side, delta });
    },
    [action],
  );

  const adjustTime = useCallback(
    (deltaSeconds: number) => {
      const nextSeconds = Math.max(0, snapshot.remainingSeconds + deltaSeconds);
      action({ type: "setDuration", seconds: nextSeconds });
    },
    [action, snapshot.remainingSeconds],
  );

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        toggleTimer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTimer]);

  const toggleFullscreen = useCallback(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  if (!isSparringRoomCode(roomCode ?? "")) return null;

  return (
    <View style={styles.page}>
      {/* HEADER TOP BAR - Only in Operator Mode */}
      {viewMode === "operator" && (
        <View
          testID="sparring-header"
          style={[
            styles.header,
            {
              height: OPERATOR_LAYOUT.headerHeight * scale,
              paddingHorizontal: 20 * scale,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Image
              source={SPARRING_IMAGES.title}
              style={{
                width: OPERATOR_LAYOUT.logoWidth * scale,
                height: OPERATOR_LAYOUT.logoHeight * scale,
              }}
              resizeMode="contain"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Góp ý"
              style={[styles.headerIconButton, { padding: 4 * scale }]}
            >
              <AppIcon
                icon={<MessageEdit />}
                size={OPERATOR_LAYOUT.headerIconSize * scale}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Rời phòng"
              style={[styles.headerIconButton, { padding: 4 * scale }]}
            >
              <AppIcon
                icon={<Logout3 />}
                size={OPERATOR_LAYOUT.headerIconSize * scale}
                color="#FFFFFF"
              />
            </Pressable>
            <View
              style={[
                styles.roomCodeBadge,
                {
                  paddingHorizontal: 10 * scale,
                  paddingVertical: 3 * scale,
                  borderRadius: 4 * scale,
                  borderWidth: 1.5 * scale,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.roomCodeText,
                  {
                    fontSize: OPERATOR_LAYOUT.roomCodeFontSize * scale,
                    lineHeight: OPERATOR_LAYOUT.roomCodeFontSize * scale,
                  },
                ]}
              >
                {roomCode}
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* MATCH SCORE BADGE */}
      <View
        testID="match-score-badge"
        style={[
          styles.matchScoreBadge,
          {
            top:
              (viewMode === "operator"
                ? OPERATOR_LAYOUT.matchBadgeTop
                : DISPLAY_LAYOUT.matchBadgeTop) * scale,
            right:
              (viewMode === "operator"
                ? OPERATOR_LAYOUT.matchBadgeRight
                : DISPLAY_LAYOUT.matchBadgeRight) * scale,
            paddingHorizontal:
              (viewMode === "operator"
                ? OPERATOR_LAYOUT.matchBadgePaddingH
                : DISPLAY_LAYOUT.matchBadgePaddingH) * scale,
            paddingVertical:
              (viewMode === "operator"
                ? OPERATOR_LAYOUT.matchBadgePaddingV
                : DISPLAY_LAYOUT.matchBadgePaddingV) * scale,
            borderRadius: 4 * scale,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.matchScoreRed,
            {
              fontSize:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.matchBadgeFontSize
                  : DISPLAY_LAYOUT.matchBadgeFontSize) * scale,
              lineHeight:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.matchBadgeFontSize
                  : DISPLAY_LAYOUT.matchBadgeFontSize) * scale,
            },
          ]}
        >
          {redRoundsWon}
        </ThemedText>
        <ThemedText
          style={[
            styles.matchScoreDash,
            {
              fontSize:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.matchBadgeFontSize
                  : DISPLAY_LAYOUT.matchBadgeFontSize) * scale,
              lineHeight:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.matchBadgeFontSize
                  : DISPLAY_LAYOUT.matchBadgeFontSize) * scale,
            },
          ]}
        >
          {" - "}
        </ThemedText>
        <ThemedText
          style={[
            styles.matchScoreBlue,
            {
              fontSize:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.matchBadgeFontSize
                  : DISPLAY_LAYOUT.matchBadgeFontSize) * scale,
              lineHeight:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.matchBadgeFontSize
                  : DISPLAY_LAYOUT.matchBadgeFontSize) * scale,
            },
          ]}
        >
          {blueRoundsWon}
        </ThemedText>
      </View>

      {/* MAIN CANVAS CONTAINER */}
      <View
        testID="canvas-container"
        style={[
          styles.canvasContainer,
          {
            width: BASE_CANVAS.width * scale,
            height:
              (BASE_CANVAS.height -
                (viewMode === "operator" ? OPERATOR_LAYOUT.headerHeight : 0)) *
              scale,
          },
        ]}
      >
        {/* ROUND TITLE */}
        <View
          style={[
            styles.roundHeader,
            {
              marginTop:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.roundMarginTop
                  : DISPLAY_LAYOUT.roundMarginTop) * scale,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.roundText,
              {
                fontSize:
                  (viewMode === "operator"
                    ? OPERATOR_LAYOUT.roundFontSize
                    : DISPLAY_LAYOUT.roundFontSize) * scale,
                lineHeight:
                  (viewMode === "operator"
                    ? OPERATOR_LAYOUT.roundFontSize
                    : DISPLAY_LAYOUT.roundFontSize) * scale,
              },
            ]}
          >
            ROUND {snapshot.round}
          </ThemedText>
        </View>

        {/* TIMER BOX: Click or Space to Start/Pause */}
        <Pressable
          testID="timer-box"
          onPress={toggleTimer}
          accessibilityRole="button"
          accessibilityLabel="Bấm giờ thi đấu"
          style={[
            styles.clockBox,
            {
              width:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.timerWidth
                  : DISPLAY_LAYOUT.timerWidth) * scale,
              height:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.timerHeight
                  : DISPLAY_LAYOUT.timerHeight) * scale,
              borderRadius:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.timerBorderRadius
                  : DISPLAY_LAYOUT.timerBorderRadius) * scale,
              marginTop:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.timerMarginTop
                  : DISPLAY_LAYOUT.timerMarginTop) * scale,
              marginBottom:
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.timerMarginBottom
                  : DISPLAY_LAYOUT.timerMarginBottom) * scale,
            },
            snapshot.running ? styles.clockRunning : styles.clockPaused,
          ]}
        >
          <ThemedText
            style={[
              styles.clockText,
              {
                fontSize:
                  (viewMode === "operator"
                    ? OPERATOR_LAYOUT.timerFontSize
                    : DISPLAY_LAYOUT.timerFontSize) * scale,
                lineHeight:
                  (viewMode === "operator"
                    ? OPERATOR_LAYOUT.timerFontSize
                    : DISPLAY_LAYOUT.timerFontSize) * scale,
              },
              snapshot.running
                ? styles.clockTextRunning
                : styles.clockTextPaused,
            ]}
          >
            {connecting
              ? "--:--"
              : formatSparringTime(snapshot.remainingSeconds)}
          </ThemedText>
        </Pressable>

        {/* ARENA CONTAINER */}
        <View
          style={[
            styles.arenaContainer,
            viewMode === "operator"
              ? {
                  justifyContent: "center",
                  gap: 60 * scale,
                }
              : {
                  justifyContent: "center",
                  paddingLeft: DISPLAY_LAYOUT.redStartX * scale,
                  paddingRight:
                    (BASE_CANVAS.width -
                      DISPLAY_LAYOUT.blueStartX -
                      DISPLAY_LAYOUT.cardWidth) *
                    scale,
                  gap:
                    (DISPLAY_LAYOUT.blueStartX -
                      DISPLAY_LAYOUT.redStartX -
                      DISPLAY_LAYOUT.cardWidth) *
                    scale,
                },
          ]}
        >
          {/* RED SIDE */}
          <View
            style={[
              styles.teamColumn,
              {
                width:
                  (viewMode === "operator"
                    ? OPERATOR_LAYOUT.cardWidth
                    : DISPLAY_LAYOUT.cardWidth) * scale,
              },
            ]}
          >
            <EditableTeamName
              editable={operator && viewMode === "operator"}
              name={snapshot.redName}
              side="red"
              fontSize={
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.nameFontSize
                  : DISPLAY_LAYOUT.nameFontSize) * scale
              }
              style={[
                styles.teamLabel,
                styles.redLabel,
                {
                  marginBottom:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.nameMarginBottom
                      : DISPLAY_LAYOUT.nameMarginBottom) * scale,
                },
              ]}
              onCommit={(side, name) =>
                action({ type: "setCompetitorName", side, name })
              }
            />

            <View
              testID="red-card"
              style={[
                styles.scoreCard,
                styles.redScoreCard,
                {
                  width:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.cardWidth
                      : DISPLAY_LAYOUT.cardWidth) * scale,
                  height:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.cardHeight
                      : DISPLAY_LAYOUT.cardHeight) * scale,
                  borderRadius:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.cardBorderRadius
                      : DISPLAY_LAYOUT.cardBorderRadius) * scale,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.scoreNumber,
                  {
                    fontSize:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.scoreFontSize
                        : DISPLAY_LAYOUT.scoreFontSize) * scale,
                    lineHeight:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.scoreFontSize
                        : DISPLAY_LAYOUT.scoreFontSize) * scale,
                  },
                ]}
              >
                {snapshot.redScore}
              </ThemedText>
            </View>

            {/* Penalty bar & count */}
            <View
              style={[
                styles.penaltyContainer,
                {
                  marginTop:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.penaltyMarginTop
                      : DISPLAY_LAYOUT.penaltyMarginTop) * scale,
                },
              ]}
            >
              <View
                testID="red-penalty-bar"
                style={[
                  styles.penaltyBar,
                  {
                    width:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.penaltyBarWidth
                        : DISPLAY_LAYOUT.penaltyBarWidth) * scale,
                    height:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.penaltyBarHeight
                        : DISPLAY_LAYOUT.penaltyBarHeight) * scale,
                    borderRadius:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.penaltyBarRadius
                        : DISPLAY_LAYOUT.penaltyBarRadius) * scale,
                  },
                ]}
              />
              <View
                style={[
                  styles.penaltyCountBox,
                  {
                    height:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.penaltyContainerHeight
                        : DISPLAY_LAYOUT.penaltyContainerHeight) * scale,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.penaltyCountText,
                    {
                      fontSize:
                        (viewMode === "operator"
                          ? OPERATOR_LAYOUT.penaltyFontSize
                          : DISPLAY_LAYOUT.penaltyFontSize) * scale,
                      lineHeight:
                        (viewMode === "operator"
                          ? OPERATOR_LAYOUT.penaltyFontSize
                          : DISPLAY_LAYOUT.penaltyFontSize) * scale,
                    },
                  ]}
                >
                  {snapshot.redPenalties}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* MIDDLE CONTROLS - Operator mode only */}
          {viewMode === "operator" && (
            <View
              testID="middle-controller"
              style={[
                styles.middleController,
                {
                  width: OPERATOR_LAYOUT.controllerWidth * scale,
                  gap: OPERATOR_LAYOUT.controllerGap * scale,
                },
              ]}
            >
              {/* TIME ADJUST */}
              <View style={[styles.controlSection, { gap: 6 * scale }]}>
                <ThemedText
                  style={[
                    styles.controlHeader,
                    { fontSize: OPERATOR_LAYOUT.controlHeaderFontSize * scale },
                  ]}
                >
                  TIME (SEC)
                </ThemedText>
                <View style={[styles.controlRow, { gap: 8 * scale }]}>
                  <Pressable
                    accessibilityLabel="Giảm thời gian"
                    onPress={() => adjustTime(-stepAmount(timeStep, 60))}
                    style={[
                      styles.circleBtn,
                      {
                        width: OPERATOR_LAYOUT.circleBtnSize * scale,
                        height: OPERATOR_LAYOUT.circleBtnSize * scale,
                        borderRadius:
                          (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                      },
                    ]}
                  >
                    <AppIcon
                      icon={<Minus />}
                      size={24 * scale}
                      color="#000000"
                    />
                  </Pressable>
                  <StepValueInput
                    accessibilityLabel="Bước điều chỉnh thời gian"
                    maximum={60}
                    value={timeStep}
                    onChange={setTimeStep}
                    width={OPERATOR_LAYOUT.timeInputWidth * scale}
                    height={OPERATOR_LAYOUT.timeInputHeight * scale}
                    fontSize={OPERATOR_LAYOUT.inputFontSize * scale}
                  />
                  <Pressable
                    accessibilityLabel="Tăng thời gian"
                    onPress={() => adjustTime(stepAmount(timeStep, 60))}
                    style={[
                      styles.circleBtn,
                      {
                        width: OPERATOR_LAYOUT.circleBtnSize * scale,
                        height: OPERATOR_LAYOUT.circleBtnSize * scale,
                        borderRadius:
                          (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                      },
                    ]}
                  >
                    <AppIcon
                      icon={<Plus />}
                      size={24 * scale}
                      color="#000000"
                    />
                  </Pressable>
                </View>
              </View>

              {/* POINTS ADJUST ROW */}
              <View style={[styles.dualControlSection, { gap: 14 * scale }]}>
                <View style={[styles.halfControl, { gap: 6 * scale }]}>
                  <ThemedText
                    style={[
                      styles.controlHeader,
                      {
                        fontSize: OPERATOR_LAYOUT.controlHeaderFontSize * scale,
                      },
                    ]}
                  >
                    POINTS
                  </ThemedText>
                  <View style={[styles.controlRow, { gap: 6 * scale }]}>
                    <Pressable
                      accessibilityLabel="Giảm điểm đỏ"
                      onPress={() =>
                        adjustScore("red", -stepAmount(redScoreStep, 99))
                      }
                      style={[
                        styles.circleBtn,
                        {
                          width: OPERATOR_LAYOUT.circleBtnSize * scale,
                          height: OPERATOR_LAYOUT.circleBtnSize * scale,
                          borderRadius:
                            (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                        },
                      ]}
                    >
                      <AppIcon
                        icon={<Minus />}
                        size={24 * scale}
                        color="#000000"
                      />
                    </Pressable>
                    <StepValueInput
                      accessibilityLabel="Bước điều chỉnh điểm đỏ"
                      maximum={99}
                      value={redScoreStep}
                      onChange={setRedScoreStep}
                      width={OPERATOR_LAYOUT.pointInputWidth * scale}
                      height={OPERATOR_LAYOUT.pointInputHeight * scale}
                      fontSize={OPERATOR_LAYOUT.inputFontSize * scale}
                    />
                    <Pressable
                      accessibilityLabel="Tăng điểm đỏ"
                      onPress={() =>
                        adjustScore("red", stepAmount(redScoreStep, 99))
                      }
                      style={[
                        styles.circleBtn,
                        {
                          width: OPERATOR_LAYOUT.circleBtnSize * scale,
                          height: OPERATOR_LAYOUT.circleBtnSize * scale,
                          borderRadius:
                            (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                        },
                      ]}
                    >
                      <AppIcon
                        icon={<Plus />}
                        size={24 * scale}
                        color="#000000"
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={[styles.halfControl, { gap: 6 * scale }]}>
                  <ThemedText
                    style={[
                      styles.controlHeader,
                      {
                        fontSize: OPERATOR_LAYOUT.controlHeaderFontSize * scale,
                      },
                    ]}
                  >
                    POINTS
                  </ThemedText>
                  <View style={[styles.controlRow, { gap: 6 * scale }]}>
                    <Pressable
                      accessibilityLabel="Giảm điểm xanh"
                      onPress={() =>
                        adjustScore("blue", -stepAmount(blueScoreStep, 99))
                      }
                      style={[
                        styles.circleBtn,
                        {
                          width: OPERATOR_LAYOUT.circleBtnSize * scale,
                          height: OPERATOR_LAYOUT.circleBtnSize * scale,
                          borderRadius:
                            (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                        },
                      ]}
                    >
                      <AppIcon
                        icon={<Minus />}
                        size={24 * scale}
                        color="#000000"
                      />
                    </Pressable>
                    <StepValueInput
                      accessibilityLabel="Bước điều chỉnh điểm xanh"
                      maximum={99}
                      value={blueScoreStep}
                      onChange={setBlueScoreStep}
                      width={OPERATOR_LAYOUT.pointInputWidth * scale}
                      height={OPERATOR_LAYOUT.pointInputHeight * scale}
                      fontSize={OPERATOR_LAYOUT.inputFontSize * scale}
                    />
                    <Pressable
                      accessibilityLabel="Tăng điểm xanh"
                      onPress={() =>
                        adjustScore("blue", stepAmount(blueScoreStep, 99))
                      }
                      style={[
                        styles.circleBtn,
                        {
                          width: OPERATOR_LAYOUT.circleBtnSize * scale,
                          height: OPERATOR_LAYOUT.circleBtnSize * scale,
                          borderRadius:
                            (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                        },
                      ]}
                    >
                      <AppIcon
                        icon={<Plus />}
                        size={24 * scale}
                        color="#000000"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* PENALTY ADJUST ROW */}
              <View style={[styles.dualControlSection, { gap: 14 * scale }]}>
                <View style={[styles.halfControl, { gap: 6 * scale }]}>
                  <ThemedText
                    style={[
                      styles.controlHeader,
                      {
                        fontSize: OPERATOR_LAYOUT.controlHeaderFontSize * scale,
                      },
                    ]}
                  >
                    PENALTY
                  </ThemedText>
                  <View style={[styles.controlRow, { gap: 6 * scale }]}>
                    <Pressable
                      accessibilityLabel="Giảm điểm phạt đỏ"
                      onPress={() =>
                        adjustPenalty("red", -stepAmount(redPenaltyStep, 20))
                      }
                      style={[
                        styles.circleBtn,
                        {
                          width: OPERATOR_LAYOUT.circleBtnSize * scale,
                          height: OPERATOR_LAYOUT.circleBtnSize * scale,
                          borderRadius:
                            (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                        },
                      ]}
                    >
                      <AppIcon
                        icon={<Minus />}
                        size={24 * scale}
                        color="#000000"
                      />
                    </Pressable>
                    <StepValueInput
                      accessibilityLabel="Bước điều chỉnh điểm phạt đỏ"
                      maximum={20}
                      value={redPenaltyStep}
                      onChange={setRedPenaltyStep}
                      width={OPERATOR_LAYOUT.pointInputWidth * scale}
                      height={OPERATOR_LAYOUT.pointInputHeight * scale}
                      fontSize={OPERATOR_LAYOUT.inputFontSize * scale}
                    />
                    <Pressable
                      accessibilityLabel="Tăng điểm phạt đỏ"
                      onPress={() =>
                        adjustPenalty("red", stepAmount(redPenaltyStep, 20))
                      }
                      style={[
                        styles.circleBtn,
                        {
                          width: OPERATOR_LAYOUT.circleBtnSize * scale,
                          height: OPERATOR_LAYOUT.circleBtnSize * scale,
                          borderRadius:
                            (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                        },
                      ]}
                    >
                      <AppIcon
                        icon={<Plus />}
                        size={24 * scale}
                        color="#000000"
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={[styles.halfControl, { gap: 6 * scale }]}>
                  <ThemedText
                    style={[
                      styles.controlHeader,
                      {
                        fontSize: OPERATOR_LAYOUT.controlHeaderFontSize * scale,
                      },
                    ]}
                  >
                    PENALTY
                  </ThemedText>
                  <View style={[styles.controlRow, { gap: 6 * scale }]}>
                    <Pressable
                      accessibilityLabel="Giảm điểm phạt xanh"
                      onPress={() =>
                        adjustPenalty("blue", -stepAmount(bluePenaltyStep, 20))
                      }
                      style={[
                        styles.circleBtn,
                        {
                          width: OPERATOR_LAYOUT.circleBtnSize * scale,
                          height: OPERATOR_LAYOUT.circleBtnSize * scale,
                          borderRadius:
                            (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                        },
                      ]}
                    >
                      <AppIcon
                        icon={<Minus />}
                        size={24 * scale}
                        color="#000000"
                      />
                    </Pressable>
                    <StepValueInput
                      accessibilityLabel="Bước điều chỉnh điểm phạt xanh"
                      maximum={20}
                      value={bluePenaltyStep}
                      onChange={setBluePenaltyStep}
                      width={OPERATOR_LAYOUT.pointInputWidth * scale}
                      height={OPERATOR_LAYOUT.pointInputHeight * scale}
                      fontSize={OPERATOR_LAYOUT.inputFontSize * scale}
                    />
                    <Pressable
                      accessibilityLabel="Tăng điểm phạt xanh"
                      onPress={() =>
                        adjustPenalty("blue", stepAmount(bluePenaltyStep, 20))
                      }
                      style={[
                        styles.circleBtn,
                        {
                          width: OPERATOR_LAYOUT.circleBtnSize * scale,
                          height: OPERATOR_LAYOUT.circleBtnSize * scale,
                          borderRadius:
                            (OPERATOR_LAYOUT.circleBtnSize / 2) * scale,
                        },
                      ]}
                    >
                      <AppIcon
                        icon={<Plus />}
                        size={24 * scale}
                        color="#000000"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* BLUE SIDE */}
          <View
            style={[
              styles.teamColumn,
              {
                width:
                  (viewMode === "operator"
                    ? OPERATOR_LAYOUT.cardWidth
                    : DISPLAY_LAYOUT.cardWidth) * scale,
              },
            ]}
          >
            <EditableTeamName
              editable={operator && viewMode === "operator"}
              name={snapshot.blueName}
              side="blue"
              fontSize={
                (viewMode === "operator"
                  ? OPERATOR_LAYOUT.nameFontSize
                  : DISPLAY_LAYOUT.nameFontSize) * scale
              }
              style={[
                styles.teamLabel,
                styles.blueLabel,
                {
                  marginBottom:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.nameMarginBottom
                      : DISPLAY_LAYOUT.nameMarginBottom) * scale,
                },
              ]}
              onCommit={(side, name) =>
                action({ type: "setCompetitorName", side, name })
              }
            />

            <View
              testID="blue-card"
              style={[
                styles.scoreCard,
                styles.blueScoreCard,
                {
                  width:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.cardWidth
                      : DISPLAY_LAYOUT.cardWidth) * scale,
                  height:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.cardHeight
                      : DISPLAY_LAYOUT.cardHeight) * scale,
                  borderRadius:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.cardBorderRadius
                      : DISPLAY_LAYOUT.cardBorderRadius) * scale,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.scoreNumber,
                  {
                    fontSize:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.scoreFontSize
                        : DISPLAY_LAYOUT.scoreFontSize) * scale,
                    lineHeight:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.scoreFontSize
                        : DISPLAY_LAYOUT.scoreFontSize) * scale,
                  },
                ]}
              >
                {snapshot.blueScore}
              </ThemedText>
            </View>

            {/* Penalty bar & count */}
            <View
              style={[
                styles.penaltyContainer,
                {
                  marginTop:
                    (viewMode === "operator"
                      ? OPERATOR_LAYOUT.penaltyMarginTop
                      : DISPLAY_LAYOUT.penaltyMarginTop) * scale,
                },
              ]}
            >
              <View
                testID="blue-penalty-bar"
                style={[
                  styles.penaltyBar,
                  {
                    width:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.penaltyBarWidth
                        : DISPLAY_LAYOUT.penaltyBarWidth) * scale,
                    height:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.penaltyBarHeight
                        : DISPLAY_LAYOUT.penaltyBarHeight) * scale,
                    borderRadius:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.penaltyBarRadius
                        : DISPLAY_LAYOUT.penaltyBarRadius) * scale,
                  },
                ]}
              />
              <View
                style={[
                  styles.penaltyCountBox,
                  {
                    height:
                      (viewMode === "operator"
                        ? OPERATOR_LAYOUT.penaltyContainerHeight
                        : DISPLAY_LAYOUT.penaltyContainerHeight) * scale,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.penaltyCountText,
                    {
                      fontSize:
                        (viewMode === "operator"
                          ? OPERATOR_LAYOUT.penaltyFontSize
                          : DISPLAY_LAYOUT.penaltyFontSize) * scale,
                      lineHeight:
                        (viewMode === "operator"
                          ? OPERATOR_LAYOUT.penaltyFontSize
                          : DISPLAY_LAYOUT.penaltyFontSize) * scale,
                    },
                  ]}
                >
                  {snapshot.bluePenalties}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER BOTTOM BAR */}
        {viewMode === "operator" ? (
          <View
            style={[
              styles.footer,
              {
                height: OPERATOR_LAYOUT.footerHeight * scale,
                paddingHorizontal: 24 * scale,
              },
            ]}
          >
            <View style={[styles.footerLeft, { gap: 16 * scale }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Trợ giúp"
                style={[styles.footerIconBtn, { padding: 4 * scale }]}
              >
                <AppIcon
                  icon={<HelpCircle />}
                  size={OPERATOR_LAYOUT.footerIconSize * scale}
                  color="#000000"
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cài đặt"
                onPress={() => setShowSettings(true)}
                style={[styles.footerIconBtn, { padding: 4 * scale }]}
              >
                <AppIcon
                  icon={<Settings />}
                  size={OPERATOR_LAYOUT.footerIconSize * scale}
                  color="#000000"
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Toàn màn hình"
                onPress={toggleFullscreen}
                style={[styles.footerIconBtn, { padding: 4 * scale }]}
              >
                <AppIcon
                  icon={<Fullscreen />}
                  size={OPERATOR_LAYOUT.footerIconSize * scale}
                  color="#000000"
                />
              </Pressable>
            </View>

            {/* Center toggle switch: Operator active */}
            <View style={styles.footerCenter}>
              <Pressable
                testID="view-toggle-btn"
                accessibilityRole="button"
                accessibilityLabel="Chuyển chế độ hiển thị"
                onPress={() => setViewMode("display")}
                style={[styles.viewToggleBtn, { gap: 8 * scale }]}
              >
                <AppIcon
                  icon={<Edit />}
                  size={OPERATOR_LAYOUT.footerIconSize * scale}
                  color="#000000"
                />
                <View
                  style={[
                    styles.toggleTrack,
                    {
                      width: OPERATOR_LAYOUT.toggleWidth * scale,
                      height: OPERATOR_LAYOUT.toggleHeight * scale,
                      borderRadius: (OPERATOR_LAYOUT.toggleHeight / 2) * scale,
                      backgroundColor: "#22C55E",
                      paddingHorizontal: 2 * scale,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        width: OPERATOR_LAYOUT.toggleThumbSize * scale,
                        height: OPERATOR_LAYOUT.toggleThumbSize * scale,
                        borderRadius:
                          (OPERATOR_LAYOUT.toggleThumbSize / 2) * scale,
                        backgroundColor: "#FFFFFF",
                        alignSelf: "flex-end",
                      },
                    ]}
                  />
                </View>
              </Pressable>
            </View>

            {/* Right footer buttons */}
            <View style={[styles.footerRight, { gap: 10 * scale }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kết thúc trận đấu"
                onPress={() => action({ type: "end" })}
                style={[
                  styles.footerActionBtn,
                  {
                    paddingHorizontal: 16 * scale,
                    paddingVertical: 8 * scale,
                    borderRadius: 8 * scale,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.footerActionText,
                    { fontSize: 14 * scale, lineHeight: 18 * scale },
                  ]}
                >
                  End Match
                </ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Debug"
                style={[
                  styles.footerActionBtn,
                  {
                    paddingHorizontal: 16 * scale,
                    paddingVertical: 8 * scale,
                    borderRadius: 8 * scale,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.footerActionText,
                    { fontSize: 14 * scale, lineHeight: 18 * scale },
                  ]}
                >
                  Debug
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Display mode bottom center switch */
          <View style={[styles.displayBottomCenter, { bottom: 10 * scale }]}>
            <Pressable
              testID="view-toggle-btn"
              accessibilityRole="button"
              accessibilityLabel="Quay lại chế độ điều khiển"
              onPress={() => setViewMode("operator")}
              style={[styles.viewToggleBtn, { gap: 6 * scale }]}
            >
              <AppIcon
                icon={<Monitor />}
                size={DISPLAY_LAYOUT.toggleIconSize * scale}
                color="#000000"
              />
              <View
                style={[
                  styles.toggleTrack,
                  {
                    width: DISPLAY_LAYOUT.toggleWidth * scale,
                    height: DISPLAY_LAYOUT.toggleHeight * scale,
                    borderRadius: (DISPLAY_LAYOUT.toggleHeight / 2) * scale,
                    backgroundColor: "#D1D5DB",
                    paddingHorizontal: 2 * scale,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      width: DISPLAY_LAYOUT.toggleThumbSize * scale,
                      height: DISPLAY_LAYOUT.toggleThumbSize * scale,
                      borderRadius:
                        (DISPLAY_LAYOUT.toggleThumbSize / 2) * scale,
                      backgroundColor: "#FFFFFF",
                      alignSelf: "flex-start",
                    },
                  ]}
                />
              </View>
            </Pressable>
          </View>
        )}
      </View>

      {error ? (
        <View style={styles.errorToast}>
          <ThemedText style={styles.errorToastText}>{error}</ThemedText>
        </View>
      ) : null}

      {/* SETTINGS MODAL */}
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <ThemedText style={styles.modalTitle}>CÀI ĐẶT</ThemedText>

              {/* SECTION: TRỌNG TÀI */}
              <View style={styles.settingSection}>
                <ThemedText style={styles.sectionHeader}>TRỌNG TÀI</ThemedText>

                <View style={styles.settingRow}>
                  <View style={styles.stepControls}>
                    <Pressable
                      onPress={() => setMaxJudges((v) => Math.max(1, v - 1))}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.stepVal}>{maxJudges}</ThemedText>
                    <Pressable
                      onPress={() => setMaxJudges((v) => v + 1)}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>+</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Số lượng giám định tối đa
                  </ThemedText>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.stepControls}>
                    <Pressable
                      onPress={() =>
                        setJudgesToScore((v) => Math.max(1, v - 1))
                      }
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.stepVal}>
                      {judgesToScore}
                    </ThemedText>
                    <Pressable
                      onPress={() => setJudgesToScore((v) => v + 1)}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>+</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Số giám định đồng thuận để tính điểm
                  </ThemedText>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.stepControls}>
                    <Pressable
                      onPress={() =>
                        setSecondScoringWindow((v) =>
                          Math.max(0.5, +(v - 0.25).toFixed(2)),
                        )
                      }
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.stepVal}>
                      {secondScoringWindow.toFixed(2)}
                    </ThemedText>
                    <Pressable
                      onPress={() =>
                        setSecondScoringWindow((v) => +(v + 0.25).toFixed(2))
                      }
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>+</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Độ trễ tính điểm đồng thuận (giây)
                  </ThemedText>
                </View>
              </View>

              {/* SECTION: HIỆP ĐẤU */}
              <View style={styles.settingSection}>
                <ThemedText style={styles.sectionHeader}>HIỆP ĐẤU</ThemedText>

                <View style={styles.settingRow}>
                  <View style={styles.stepControls}>
                    <Pressable
                      onPress={() =>
                        setRoundsPerMatch((v) => Math.max(1, v - 1))
                      }
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.stepVal}>
                      {roundsPerMatch}
                    </ThemedText>
                    <Pressable
                      onPress={() => setRoundsPerMatch((v) => v + 1)}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>+</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Số hiệp mỗi trận đấu
                  </ThemedText>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.stepControls}>
                    <Pressable
                      onPress={() =>
                        setRoundTimeSeconds((v) => Math.max(10, v - 10))
                      }
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.stepVal}>
                      {roundTimeSeconds}
                    </ThemedText>
                    <Pressable
                      onPress={() => setRoundTimeSeconds((v) => v + 10)}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>+</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Thời gian mỗi hiệp (giây)
                  </ThemedText>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.stepControls}>
                    <Pressable
                      onPress={() =>
                        setBreakTimeSeconds((v) => Math.max(5, v - 5))
                      }
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.stepVal}>
                      {breakTimeSeconds}
                    </ThemedText>
                    <Pressable
                      onPress={() => setBreakTimeSeconds((v) => v + 5)}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>+</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Thời gian nghỉ giữa hiệp (giây)
                  </ThemedText>
                </View>

                <Pressable
                  onPress={() => setResetScoreBetweenRounds((v) => !v)}
                  style={styles.checkboxRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      resetScoreBetweenRounds && styles.checkboxActive,
                    ]}
                  >
                    {resetScoreBetweenRounds && (
                      <Check size={16} color="#fff" />
                    )}
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Reset điểm số khi chuyển hiệp
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => setResetPenaltiesBetweenRounds((v) => !v)}
                  style={styles.checkboxRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      resetPenaltiesBetweenRounds && styles.checkboxActive,
                    ]}
                  >
                    {resetPenaltiesBetweenRounds && (
                      <Check size={16} color="#fff" />
                    )}
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Reset điểm phạt khi chuyển hiệp
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => setTrackRoundWinners((v) => !v)}
                  style={styles.checkboxRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      trackRoundWinners && styles.checkboxActive,
                    ]}
                  >
                    {trackRoundWinners && <Check size={16} color="#fff" />}
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Ghi nhận người thắng theo hiệp (Round Winners)
                  </ThemedText>
                </Pressable>
              </View>

              {/* SECTION: ĐIỀU KIỆN KẾT THÚC */}
              <View style={styles.settingSection}>
                <ThemedText style={styles.sectionHeader}>
                  ĐIỀU KIỆN KẾT THÚC
                </ThemedText>

                <View style={styles.checkboxWithStepRow}>
                  <Pressable
                    onPress={() => setEnableDisqualify((v) => !v)}
                    style={[
                      styles.checkbox,
                      enableDisqualify && styles.checkboxActive,
                    ]}
                  >
                    {enableDisqualify && <Check size={16} color="#fff" />}
                  </Pressable>
                  <View style={styles.stepControls}>
                    <Pressable
                      onPress={() =>
                        setPenaltiesToDisqualify((v) => Math.max(1, v - 1))
                      }
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.stepVal}>
                      {penaltiesToDisqualify}
                    </ThemedText>
                    <Pressable
                      onPress={() => setPenaltiesToDisqualify((v) => v + 1)}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>+</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Bật truất quyền thi đấu theo số lỗi (Disqualification)
                  </ThemedText>
                </View>

                <View style={styles.checkboxWithStepRow}>
                  <Pressable
                    onPress={() => setEnablePointDiff((v) => !v)}
                    style={[
                      styles.checkbox,
                      enablePointDiff && styles.checkboxActive,
                    ]}
                  >
                    {enablePointDiff && <Check size={16} color="#fff" />}
                  </Pressable>
                  <View style={styles.stepControls}>
                    <Pressable
                      onPress={() => setPointDiff((v) => Math.max(1, v - 1))}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.stepVal}>{pointDiff}</ThemedText>
                    <Pressable
                      onPress={() => setPointDiff((v) => v + 1)}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>+</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Cách biệt điểm số để thắng hiệp (Point Gap)
                  </ThemedText>
                </View>

                <View style={styles.checkboxWithStepRow}>
                  <Pressable
                    onPress={() => setEnablePointWin((v) => !v)}
                    style={[
                      styles.checkbox,
                      enablePointWin && styles.checkboxActive,
                    ]}
                  >
                    {enablePointWin && <Check size={16} color="#fff" />}
                  </Pressable>
                  <View style={styles.stepControls}>
                    <Pressable
                      onPress={() => setPointsToWin((v) => Math.max(1, v - 1))}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.stepVal}>
                      {pointsToWin}
                    </ThemedText>
                    <Pressable
                      onPress={() => setPointsToWin((v) => v + 1)}
                      style={styles.stepBtn}
                    >
                      <ThemedText style={styles.stepBtnText}>+</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText style={styles.settingLabel}>
                    Điểm số tối đa để thắng ngay
                  </ThemedText>
                </View>
              </View>

              {/* ACTION BUTTONS */}
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setShowSettings(false)}
                  style={styles.cancelBtn}
                >
                  <ThemedText style={styles.cancelBtnText}>Hủy</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    action({ type: "setDuration", seconds: roundTimeSeconds });
                    setShowSettings(false);
                  }}
                  style={styles.saveBtn}
                >
                  <ThemedText style={styles.saveBtnText}>
                    Lưu và bắt đầu trận mới
                  </ThemedText>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    height: "100vh" as any,
    width: "100vw" as any,
    overflow: "hidden",
    backgroundColor: SPAR_COLORS.pageBackground,
    alignItems: "center",
    justifyContent: "flex-start",
    userSelect: "none" as any,
  },
  header: {
    alignSelf: "stretch",
    backgroundColor: SPAR_COLORS.headerBackground,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerIconButton: {
    cursor: "pointer" as any,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  roomCodeBadge: {
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  roomCodeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: SPAR_COLORS.fontFamily,
    fontVariant: ["tabular-nums"],
  },
  matchScoreBadge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SPAR_COLORS.matchScoreBadge,
    zIndex: 10,
  },
  matchScoreRed: {
    color: SPAR_COLORS.red,
    fontFamily: SPAR_COLORS.fontFamily,
  },
  matchScoreDash: {
    color: SPAR_COLORS.textDark,
    fontFamily: SPAR_COLORS.fontFamily,
  },
  matchScoreBlue: {
    color: SPAR_COLORS.blue,
    fontFamily: SPAR_COLORS.fontFamily,
  },
  canvasContainer: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundHeader: {
    alignItems: "center",
  },
  roundText: {
    color: SPAR_COLORS.textDark,
    fontFamily: SPAR_COLORS.fontFamily,
    textAlign: "center",
  },
  clockBox: {
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer" as any,
    userSelect: "none" as any,
  },
  clockPaused: {
    backgroundColor: SPAR_COLORS.clockPaused,
  },
  clockRunning: {
    backgroundColor: SPAR_COLORS.clockRunning,
  },
  clockText: {
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
    fontFamily: SPAR_COLORS.fontFamily,
    textAlign: "center",
  },
  clockTextPaused: {
    color: SPAR_COLORS.textDark,
  },
  clockTextRunning: {
    color: SPAR_COLORS.textDark,
  },
  arenaContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
  },
  teamColumn: {
    alignItems: "center",
    justifyContent: "center",
  },
  teamLabel: {
    letterSpacing: 0.5,
    fontFamily: SPAR_COLORS.fontFamily,
    textAlign: "center",
  },
  teamNameInput: {
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    fontFamily: SPAR_COLORS.fontFamily,

    outlineStyle: "none" as any,
  },
  redLabel: {
    color: SPAR_COLORS.red,
  },
  blueLabel: {
    color: SPAR_COLORS.blue,
  },
  scoreCard: {
    justifyContent: "center",
    alignItems: "center",
  },
  redScoreCard: {
    backgroundColor: SPAR_COLORS.red,
  },
  blueScoreCard: {
    backgroundColor: SPAR_COLORS.blue,
  },
  scoreNumber: {
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
    fontFamily: SPAR_COLORS.fontFamily,
    textAlign: "center",
  },
  penaltyContainer: {
    alignItems: "center",
  },
  penaltyBar: {
    backgroundColor: SPAR_COLORS.gray,
  },
  penaltyCountBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  penaltyCountText: {
    color: SPAR_COLORS.textDark,
    fontFamily: SPAR_COLORS.fontFamily,
    textAlign: "center",
  },
  middleController: {
    alignItems: "center",
    justifyContent: "center",
  },
  controlSection: {
    alignItems: "center",
  },
  dualControlSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfControl: {
    flex: 1,
    alignItems: "center",
  },
  controlHeader: {
    color: "#000000",
    letterSpacing: 0.5,
    fontFamily: SPAR_COLORS.fontFamily,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  circleBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1D5DB",
    cursor: "pointer" as any,
  },
  valueBox: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
  },
  valueInput: {
    color: "#000000",
    textAlign: "center",
    fontFamily: SPAR_COLORS.fontFamily,
    outlineStyle: "none" as any,
  },
  footer: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  footerIconBtn: {
    cursor: "pointer" as any,
  },
  footerCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  displayBottomCenter: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    cursor: "pointer" as any,
  },
  toggleTrack: {
    justifyContent: "center",
  },
  toggleThumb: {},
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  footerActionBtn: {
    backgroundColor: "#E5E7EB",
    cursor: "pointer" as any,
  },
  footerActionText: {
    fontWeight: "700",
    color: "#374151",
    fontFamily: SPAR_COLORS.fontFamily,
  },
  errorToast: {
    position: "absolute",
    bottom: 52,
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "center",
    zIndex: 100,
  },
  errorToastText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: SPAR_COLORS.fontFamily,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
  },
  modalScroll: {
    gap: 20,
  },
  modalTitle: {
    fontSize: 26,

    color: "#111827",
    fontFamily: SPAR_COLORS.fontFamily,
  },
  settingSection: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 14,

    color: "#111827",
    letterSpacing: 0.5,
    fontFamily: SPAR_COLORS.fontFamily,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    cursor: "pointer" as any,
  },
  checkboxWithStepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer" as any,
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 18,
    fontFamily: SPAR_COLORS.fontFamily,
  },
  stepVal: {
    minWidth: 44,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    fontFamily: SPAR_COLORS.fontFamily,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    flexShrink: 1,
    fontFamily: SPAR_COLORS.fontFamily,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    cursor: "pointer" as any,
  },
  checkboxActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
  },
  cancelBtn: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    cursor: "pointer" as any,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    fontFamily: SPAR_COLORS.fontFamily,
  },
  saveBtn: {
    backgroundColor: "#9CA3AF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    cursor: "pointer" as any,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    fontFamily: SPAR_COLORS.fontFamily,
  },
} as any);

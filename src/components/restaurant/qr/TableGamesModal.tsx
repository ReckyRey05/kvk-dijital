"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Trophy,
  Dices,
  Zap,
  HelpCircle,
  Users,
  Sparkles,
  Flame,
  ChevronRight,
  Plus,
} from "lucide-react";
import { TableParticipant } from "@/types/restaurant";

interface TableGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  participants: TableParticipant[];
  currentParticipant?: TableParticipant | null;
  lang?: "TR" | "EN";
}

type GameMode = "HUB" | "STAKES_WHEEL" | "DICE_BATTLE" | "REFLEX_TAP" | "TRIVIA_DUEL";

interface StakeItem {
  id: string;
  labelTr: string;
  labelEn: string;
  icon: string;
  descriptionTr: string;
  descriptionEn: string;
}

const DEFAULT_STAKES: StakeItem[] = [
  {
    id: "bill",
    labelTr: "Hesabı Öder! 💸",
    labelEn: "Pays the Bill! 💸",
    icon: "receipt",
    descriptionTr: "Kaybeden masanın tüm hesabını üstlenir.",
    descriptionEn: "The loser pays the full check for the table.",
  },
  {
    id: "coffee",
    labelTr: "Kahveler Ondan! ☕",
    labelEn: "Treats Everyone to Coffee! ☕",
    icon: "coffee",
    descriptionTr: "Kaybeden masadaki herkese Türk kahvesi / filtre kahve ısmarlar.",
    descriptionEn: "The loser treats everyone to coffee.",
  },
  {
    id: "dessert",
    labelTr: "Tatlıyı Söyler! 🍰",
    labelEn: "Orders the Dessert! 🍰",
    icon: "cake",
    descriptionTr: "Masaya gelecek enfes tatlıyı kaybeden ısmarlar.",
    descriptionEn: "The loser orders dessert for the table.",
  },
  {
    id: "drinks",
    labelTr: "İçecek Turu! 🥤",
    labelEn: "Drinks Round! 🥤",
    icon: "drink",
    descriptionTr: "Masadaki bir sonraki içecek turunu kaybeden öder.",
    descriptionEn: "The loser buys the next round of drinks.",
  },
  {
    id: "custom",
    labelTr: "Masa İçi Özel Ceza / İtiraf! 🎯",
    labelEn: "Table Custom Dare / Truth! 🎯",
    icon: "custom",
    descriptionTr: "Masadakilerin belirleyeceği eğlenceli bir ceza veya itiraf.",
    descriptionEn: "A fun dare or truth decided by the table.",
  },
];

const TRIVIA_QUESTIONS = [
  {
    qTr: "Dünyanın en pahalı baharatı hangisidir?",
    qEn: "What is the world's most expensive spice?",
    options: ["Safran", "Kakule", "Vanilya", "Trüf"],
    correct: 0,
  },
  {
    qTr: "İtalyan mutfağında 'Al Dente' tam olarak ne anlama gelir?",
    qEn: "What does 'Al Dente' literally mean in Italian cuisine?",
    options: ["Dişe gelir / diri", "Çok pişmiş", "Fırınlanmış", "Soslu"],
    correct: 0,
  },
  {
    qTr: "Geleneksel Türk kahvesi pişirilirken kullanılan kaba ne ad verilir?",
    qEn: "What is the traditional pot used to make Turkish coffee called?",
    options: ["Cezve", "Çaydanlık", "Kupür", "Dubleks"],
    correct: 0,
  },
  {
    qTr: "Acı biberdeki yakıcı hissi veren kimyasal bileşenin adı nedir?",
    qEn: "What chemical gives hot peppers their spicy kick?",
    options: ["Kapsaisin", "Kafein", "Glukoz", "Asit"],
    correct: 0,
  },
  {
    qTr: "Bir pizzada mozarella, fesleğen ve domates bir araya geldiğinde hangi klasik pizza oluşur?",
    qEn: "Mozzarella, basil, and tomato create which classic pizza?",
    options: ["Margherita", "Pepperoni", "Quattro Formaggi", "Calzone"],
    correct: 0,
  },
];

export default function TableGamesModal({
  isOpen,
  onClose,
  tableNumber,
  participants,
  currentParticipant,
  lang = "TR",
}: TableGamesModalProps) {
  const [activeGame, setActiveGame] = useState<GameMode>("HUB");

  // Selected stake
  const [selectedStake, setSelectedStake] = useState<StakeItem>(DEFAULT_STAKES[0]);
  const [customStakeText, setCustomStakeText] = useState("");

  // Players in the game
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [newPlayerInput, setNewPlayerInput] = useState("");

  // Initialize players from table participants if available
  useEffect(() => {
    if (participants && participants.length > 0) {
      const names = participants.map((p) => p.name || `Misafir ${p.id.slice(-4)}`);
      setPlayerList(Array.from(new Set(names)));
    } else {
      setPlayerList([
        currentParticipant?.name || (lang === "TR" ? "Ben" : "Me"),
        lang === "TR" ? "Arkadaş 1" : "Friend 1",
      ]);
    }
  }, [participants, currentParticipant, lang]);

  // Audio / Sound trigger helper
  const playBeep = (freq: number, duration: number = 0.08) => {
    try {
      if (typeof window !== "undefined") {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          gain.gain.value = 0.1;
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }
      }
    } catch {
      // Ignore if browser restricts audio
    }
  };

  // Vibrate phone if mobile supports it
  const triggerHaptic = (ms: number = 40) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch {
      // ignore
    }
  };

  // --- GAME 1: STAKES WHEEL (Şans Çarkı / Kurban Seçimi) ---
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelLoser, setWheelLoser] = useState<string | null>(null);

  const handleSpinStakesWheel = () => {
    if (playerList.length < 2 || wheelSpinning) return;
    setWheelSpinning(true);
    setWheelLoser(null);
    triggerHaptic(60);
    playBeep(440, 0.1);

    const randomIndex = Math.floor(Math.random() * playerList.length);
    const extraRounds = 5 * 360;
    const segmentAngle = 360 / playerList.length;
    const finalAngle = extraRounds + randomIndex * segmentAngle + segmentAngle / 2;

    setWheelRotation((prev) => prev + finalAngle);

    setTimeout(() => {
      setWheelSpinning(false);
      setWheelLoser(playerList[randomIndex]);
      triggerHaptic(200);
      playBeep(220, 0.3);
    }, 3200);
  };

  // --- GAME 2: DICE BATTLE (Zar Düellosu) ---
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceScores, setDiceScores] = useState<{ [player: string]: number }>({});
  const [diceResultLoser, setDiceResultLoser] = useState<string | null>(null);
  const [diceResultWinner, setDiceResultWinner] = useState<string | null>(null);

  const handleRollDice = () => {
    if (playerList.length < 2 || diceRolling) return;
    setDiceRolling(true);
    setDiceResultLoser(null);
    setDiceResultWinner(null);

    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      playBeep(520 + ticks * 20, 0.04);
      triggerHaptic(20);
      if (ticks > 8) clearInterval(interval);
    }, 100);

    setTimeout(() => {
      const scores: { [player: string]: number } = {};
      playerList.forEach((p) => {
        scores[p] = Math.floor(Math.random() * 6) + 1;
      });
      setDiceScores(scores);
      setDiceRolling(false);

      let minVal = 7;
      let minP = playerList[0];
      let maxVal = 0;
      let maxP = playerList[0];

      Object.entries(scores).forEach(([player, val]) => {
        if (val < minVal) {
          minVal = val;
          minP = player;
        }
        if (val > maxVal) {
          maxVal = val;
          maxP = player;
        }
      });

      setDiceResultLoser(minP);
      setDiceResultWinner(maxP);
      triggerHaptic(150);
      playBeep(660, 0.2);
    }, 1200);
  };

  // --- GAME 3: REFLEX TAP CHALLENGE (Hızlı Refleks Tıklama) ---
  const [reflexState, setReflexState] = useState<"IDLE" | "WAITING" | "READY" | "CLICKED" | "TOO_EARLY">("IDLE");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const reflexTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reflexStartRef = useRef<number>(0);

  const startReflexGame = () => {
    setReflexState("WAITING");
    setReactionTime(null);
    const delay = Math.floor(Math.random() * 2500) + 1500;

    reflexTimerRef.current = setTimeout(() => {
      reflexStartRef.current = Date.now();
      setReflexState("READY");
      triggerHaptic(80);
      playBeep(880, 0.15);
    }, delay);
  };

  const handleReflexClick = () => {
    if (reflexState === "WAITING") {
      if (reflexTimerRef.current) clearTimeout(reflexTimerRef.current);
      setReflexState("TOO_EARLY");
      triggerHaptic(100);
      playBeep(200, 0.2);
    } else if (reflexState === "READY") {
      const elapsed = Date.now() - reflexStartRef.current;
      setReactionTime(elapsed);
      setReflexState("CLICKED");
      triggerHaptic(120);
      playBeep(990, 0.25);
    }
  };

  // --- GAME 4: FOOD & RESTAURANT TRIVIA DUEL ---
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [answeredState, setAnsweredState] = useState<number | null>(null);
  const [triviaComplete, setTriviaComplete] = useState(false);

  const handleSelectAnswer = (index: number) => {
    if (answeredState !== null) return;
    setAnsweredState(index);
    const isCorrect = index === TRIVIA_QUESTIONS[currentQIndex].correct;
    if (isCorrect) {
      setTriviaScore((s) => s + 1);
      playBeep(880, 0.15);
      triggerHaptic(50);
    } else {
      playBeep(240, 0.25);
      triggerHaptic(150);
    }

    setTimeout(() => {
      if (currentQIndex + 1 < TRIVIA_QUESTIONS.length) {
        setCurrentQIndex((i) => i + 1);
        setAnsweredState(null);
      } else {
        setTriviaComplete(true);
      }
    }, 1200);
  };

  const resetTrivia = () => {
    setCurrentQIndex(0);
    setTriviaScore(0);
    setAnsweredState(null);
    setTriviaComplete(false);
  };

  // Helper to add player
  const handleAddPlayer = () => {
    if (!newPlayerInput.trim()) return;
    if (!playerList.includes(newPlayerInput.trim())) {
      setPlayerList([...playerList, newPlayerInput.trim()]);
    }
    setNewPlayerInput("");
  };

  // Helper to remove player
  const handleRemovePlayer = (name: string) => {
    if (playerList.length <= 2) return;
    setPlayerList(playerList.filter((p) => p !== name));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-neutral-950 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-foreground my-auto overflow-hidden">
        {/* Background glow styling */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/30 via-purple-500/20 to-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide">
                  {lang === "TR" ? "Masa İddia & Oyunları" : "Table Games & Challenges"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase border border-amber-500/30">
                  {tableNumber}
                </span>
              </div>
              <p className="text-[11px] text-foreground/60">
                {lang === "TR"
                  ? "İddianı seç, oyunu başlat; kaybeden hesabı veya kahveyi ödesin!"
                  : "Choose stakes, play games; loser buys the coffee or pays!"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-foreground/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-4 relative z-10">
          {/* Active Stake Badge & Player Bar */}
          <div className="bg-gradient-to-r from-amber-500/10 via-white/[0.04] to-purple-500/10 border border-amber-500/25 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                {lang === "TR" ? "Masadaki İddia:" : "Table Stake:"}
              </span>
              <span className="text-[10px] text-foreground/60">
                {playerList.length} {lang === "TR" ? "Oyuncu" : "Players"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-black text-white truncate">
                {selectedStake.id === "custom" && customStakeText
                  ? customStakeText
                  : lang === "TR"
                  ? selectedStake.labelTr
                  : selectedStake.labelEn}
              </p>
              {activeGame !== "HUB" && (
                <button
                  onClick={() => setActiveGame("HUB")}
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer shrink-0"
                >
                  {lang === "TR" ? "Değiştir" : "Change"}
                </button>
              )}
            </div>

            {/* Quick Player Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/5">
              {playerList.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] text-foreground/80 flex items-center gap-1"
                >
                  <Users className="w-2.5 h-2.5 text-foreground/50" />
                  {p}
                  {playerList.length > 2 && activeGame === "HUB" && (
                    <button
                      onClick={() => handleRemovePlayer(p)}
                      className="text-red-400 hover:text-red-300 ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              {activeGame === "HUB" && (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder={lang === "TR" ? "+ İsim..." : "+ Name..."}
                    value={newPlayerInput}
                    onChange={(e) => setNewPlayerInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                    className="w-20 px-2 py-0.5 text-[10px] bg-white/5 border border-white/10 rounded-lg text-white focus:outline-hidden focus:border-amber-400"
                  />
                  {newPlayerInput.trim() && (
                    <button
                      onClick={handleAddPlayer}
                      className="p-1 rounded-md bg-amber-500 text-black cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MAIN VIEW: HUB */}
          {activeGame === "HUB" && (
            <div className="space-y-4 animate-fade-in">
              {/* Step 1: Select Stake */}
              <div>
                <label className="text-xs font-bold text-foreground/80 mb-2 block">
                  {lang === "TR" ? "1. Adım: İddiayı Belirleyin" : "Step 1: Pick the Stake"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_STAKES.map((stake) => (
                    <button
                      key={stake.id}
                      onClick={() => setSelectedStake(stake)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedStake.id === stake.id
                          ? "bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-500/10"
                          : "bg-white/[0.02] border-white/10 text-foreground/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">
                          {lang === "TR" ? stake.labelTr : stake.labelEn}
                        </span>
                      </div>
                      <span className="text-[10px] text-foreground/50 line-clamp-2">
                        {lang === "TR" ? stake.descriptionTr : stake.descriptionEn}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedStake.id === "custom" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder={lang === "TR" ? "Özel iddia yazın (Örn: Kazananın tatlısını söyler)" : "Enter custom dare/stake..."}
                      value={customStakeText}
                      onChange={(e) => setCustomStakeText(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-foreground/40 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Step 2: Choose Mini-Game */}
              <div>
                <label className="text-xs font-bold text-foreground/80 mb-2 block">
                  {lang === "TR" ? "2. Adım: Kapışma Oyununu Seçin" : "Step 2: Choose the Challenge Game"}
                </label>
                <div className="space-y-2">
                  {/* Option 1: Stakes Wheel */}
                  <button
                    onClick={() => setActiveGame("STAKES_WHEEL")}
                    className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-white">
                          {lang === "TR" ? "🎡 Şans Çarkı (Kurbanı Seç)" : "🎡 Stakes Wheel (Pick the Loser)"}
                        </h4>
                        <p className="text-[10px] text-foreground/60">
                          {lang === "TR"
                            ? "Masadaki oyuncular çarka dizilir, çark döner ve kaybedeni şans belirler!"
                            : "Spin the wheel with table members to randomly pick who pays!"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:text-amber-400 transition-colors" />
                  </button>

                  {/* Option 2: Dice Battle */}
                  <button
                    onClick={() => setActiveGame("DICE_BATTLE")}
                    className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Dices className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-white">
                          {lang === "TR" ? "🎲 Zar Düellosu" : "🎲 Dice Roll Battle"}
                        </h4>
                        <p className="text-[10px] text-foreground/60">
                          {lang === "TR"
                            ? "Herkes zar atar. En yüksek zarı atan kazanır, en düşük zar atan iddiayı öder!"
                            : "Everyone rolls. Highest roll wins, lowest roll pays the stake!"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:text-purple-400 transition-colors" />
                  </button>

                  {/* Option 3: Reflex Tap */}
                  <button
                    onClick={() => {
                      setActiveGame("REFLEX_TAP");
                      setReflexState("IDLE");
                    }}
                    className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-white">
                          {lang === "TR" ? "⚡ Hızlı Refleks Tık Kapışması" : "⚡ Reflex Tap Challenge"}
                        </h4>
                        <p className="text-[10px] text-foreground/60">
                          {lang === "TR"
                            ? "Ekran yeşil olduğunda ilk tıklayan rekor kırar, en yavaş kalan hesabı öder!"
                            : "Tap as fast as possible when it turns green. Slowest pays!"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:text-emerald-400 transition-colors" />
                  </button>

                  {/* Option 4: Trivia */}
                  <button
                    onClick={() => {
                      setActiveGame("TRIVIA_DUEL");
                      resetTrivia();
                    }}
                    className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-white">
                          {lang === "TR" ? "🧠 Lezzet & Gurme Trivia Quiz" : "🧠 Gourmet Food Trivia Quiz"}
                        </h4>
                        <p className="text-[10px] text-foreground/60">
                          {lang === "TR"
                            ? "5 soruluk restoran ve lezzet bilgi yarışması; en az puanı alan tatlıyı ısmarlar!"
                            : "5 food trivia questions; lowest scorer buys dessert!"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:text-blue-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GAME 1: STAKES WHEEL */}
          {activeGame === "STAKES_WHEEL" && (
            <div className="space-y-4 text-center animate-fade-in">
              <div className="relative w-52 h-52 mx-auto my-2 flex items-center justify-center">
                <div className="absolute -top-3 z-30 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-lg" />

                <div
                  className="w-full h-full rounded-full border-4 border-amber-400/60 shadow-2xl relative overflow-hidden transition-transform duration-[3000ms] ease-out bg-black/60"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  {playerList.map((player, idx) => {
                    const angle = 360 / playerList.length;
                    const rotate = idx * angle;
                    const bgColors = [
                      "from-amber-600/60 to-amber-900/60",
                      "from-purple-600/60 to-purple-900/60",
                      "from-emerald-600/60 to-emerald-900/60",
                      "from-blue-600/60 to-blue-900/60",
                      "from-pink-600/60 to-pink-900/60",
                      "from-red-600/60 to-red-900/60",
                    ];
                    return (
                      <div
                        key={player + idx}
                        className="absolute w-full h-full top-0 left-0"
                        style={{
                          transform: `rotate(${rotate}deg)`,
                          transformOrigin: "50% 50%",
                        }}
                      >
                        <div
                          className={`w-full h-1/2 bg-gradient-to-t ${bgColors[idx % bgColors.length]} flex items-center justify-center pt-2 border-r border-white/10`}
                          style={{
                            clipPath: `polygon(50% 100%, 0 0, 100% 0)`,
                          }}
                        >
                          <span className="text-[10px] font-extrabold text-white uppercase tracking-wider transform -rotate-90 sm:rotate-0 truncate max-w-[70px]">
                            {player}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-neutral-900 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-extrabold text-xs shadow-lg z-20">
                    🎲
                  </div>
                </div>
              </div>

              {wheelLoser ? (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl animate-bounce">
                  <span className="text-[10px] uppercase font-bold text-red-400">
                    {lang === "TR" ? "🚨 İddiayı Kaybeden Kişi:" : "🚨 The One Who Pays:"}
                  </span>
                  <p className="text-base font-black text-white mt-0.5">
                    {wheelLoser} 🎯
                  </p>
                  <p className="text-xs text-amber-300 font-bold mt-1">
                    {selectedStake.labelTr}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-foreground/60">
                  {lang === "TR"
                    ? "Çevir butonuna bas, şans kurbanı seçsin!"
                    : "Hit Spin to let fate decide who pays!"}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setActiveGame("HUB")}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground/70 cursor-pointer"
                >
                  {lang === "TR" ? "Menüye Dön" : "Back"}
                </button>
                <button
                  onClick={handleSpinStakesWheel}
                  disabled={wheelSpinning}
                  className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {wheelSpinning
                    ? lang === "TR"
                      ? "Dönüyor..."
                      : "Spinning..."
                    : lang === "TR"
                    ? "Çarkı Çevir!"
                    : "Spin the Wheel!"}
                </button>
              </div>
            </div>
          )}

          {/* GAME 2: DICE BATTLE */}
          {activeGame === "DICE_BATTLE" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-2.5">
                {playerList.map((player) => (
                  <div
                    key={player}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center flex flex-col items-center justify-between"
                  >
                    <span className="text-xs font-bold text-foreground/80 truncate max-w-full">
                      {player}
                    </span>
                    <div className="my-2 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-black border border-purple-500/30 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                      {diceRolling ? (
                        <span className="animate-spin">🎲</span>
                      ) : diceScores[player] !== undefined ? (
                        diceScores[player]
                      ) : (
                        "-"
                      )}
                    </div>
                    <span className="text-[10px] text-foreground/50">
                      {diceScores[player] !== undefined
                        ? `${diceScores[player]} ${lang === "TR" ? "Girdi" : "Points"}`
                        : lang === "TR"
                        ? "Hazır"
                        : "Ready"}
                    </span>
                  </div>
                ))}
              </div>

              {diceResultLoser && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-center animate-fade-in">
                  <div className="text-[10px] uppercase font-bold text-red-400">
                    {lang === "TR" ? "Kaybeden:" : "Loser:"} <strong className="text-white text-sm">{diceResultLoser}</strong> ({diceScores[diceResultLoser]} puan)
                  </div>
                  <div className="text-[10px] font-bold text-emerald-400 mt-0.5">
                    {lang === "TR" ? "Kazanan:" : "Winner:"} <strong className="text-white text-xs">{diceResultWinner}</strong> ({diceScores[diceResultWinner!]} puan)
                  </div>
                  <p className="text-xs text-amber-300 font-extrabold mt-1">
                    {selectedStake.labelTr}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setActiveGame("HUB")}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground/70 cursor-pointer"
                >
                  {lang === "TR" ? "Menüye Dön" : "Back"}
                </button>
                <button
                  onClick={handleRollDice}
                  disabled={diceRolling}
                  className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {diceRolling
                    ? lang === "TR"
                      ? "Zarlar Atılıyor..."
                      : "Rolling..."
                    : lang === "TR"
                    ? "Zarları At!"
                    : "Roll Dices!"}
                </button>
              </div>
            </div>
          )}

          {/* GAME 3: REFLEX TAP CHALLENGE */}
          {activeGame === "REFLEX_TAP" && (
            <div className="space-y-4 text-center animate-fade-in">
              <div
                onClick={handleReflexClick}
                className={`w-full h-44 rounded-3xl border flex flex-col items-center justify-center p-4 transition-all cursor-pointer select-none shadow-xl ${
                  reflexState === "IDLE"
                    ? "bg-white/[0.04] border-white/10 hover:border-amber-400/40"
                    : reflexState === "WAITING"
                    ? "bg-rose-950/40 border-rose-500/50 text-rose-300 animate-pulse"
                    : reflexState === "READY"
                    ? "bg-emerald-500 border-emerald-300 text-black font-black scale-[1.02]"
                    : reflexState === "TOO_EARLY"
                    ? "bg-red-900/60 border-red-500 text-white"
                    : "bg-amber-500/20 border-amber-500/40 text-white"
                }`}
              >
                {reflexState === "IDLE" && (
                  <>
                    <Zap className="w-10 h-10 text-amber-400 mb-2" />
                    <span className="text-sm font-extrabold text-white">
                      {lang === "TR" ? "Kapışmayı Başlatmak İçin Tıkla" : "Tap to Start Challenge"}
                    </span>
                    <span className="text-[10px] text-foreground/60 mt-1">
                      {lang === "TR" ? "Ekran yeşil olduğunda olabildiğince hızlı dokun!" : "Tap as fast as possible when screen turns green!"}
                    </span>
                  </>
                )}

                {reflexState === "WAITING" && (
                  <>
                    <span className="text-2xl font-black text-rose-400">🔴 BEKLE...</span>
                    <span className="text-xs text-foreground/70 mt-1">
                      {lang === "TR" ? "Yeşil olana kadar dokunma!" : "Don't tap until it turns green!"}
                    </span>
                  </>
                )}

                {reflexState === "READY" && (
                  <>
                    <span className="text-3xl font-black text-black animate-bounce">⚡ ŞİMDİ TIKLA! ⚡</span>
                  </>
                )}

                {reflexState === "TOO_EARLY" && (
                  <>
                    <span className="text-xl font-black text-red-400">❌ ÇOK ERKEN!</span>
                    <span className="text-xs text-foreground/70 mt-1">
                      {lang === "TR" ? "Yeşil yanmadan tıkladın! Tekrar dene." : "You tapped before green! Try again."}
                    </span>
                  </>
                )}

                {reflexState === "CLICKED" && reactionTime !== null && (
                  <>
                    <span className="text-3xl font-black text-amber-300">{reactionTime} ms</span>
                    <span className="text-xs font-bold text-white mt-1">
                      {reactionTime < 250
                        ? lang === "TR"
                          ? "🔥 Şimşek Hızında!"
                          : "🔥 Lightning Fast!"
                        : reactionTime < 400
                        ? lang === "TR"
                          ? "⚡ Harika Refleks!"
                          : "⚡ Great Reflex!"
                        : lang === "TR"
                        ? "🐢 Biraz Yavaş Kaldın, Hesap Riskte!"
                        : "🐢 A bit slow, check is on you!"}
                    </span>
                  </>
                )}
              </div>

              {reflexState === "IDLE" && (
                <button
                  onClick={startReflexGame}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {lang === "TR" ? "Hazırım, Başlat!" : "Ready, Start!"}
                </button>
              )}

              {(reflexState === "CLICKED" || reflexState === "TOO_EARLY") && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveGame("HUB")}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground/70 cursor-pointer"
                  >
                    {lang === "TR" ? "Menüye Dön" : "Back"}
                  </button>
                  <button
                    onClick={startReflexGame}
                    className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    {lang === "TR" ? "Sıradaki Oyuncu / Tekrar" : "Next Player / Retry"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAME 4: TRIVIA DUEL */}
          {activeGame === "TRIVIA_DUEL" && (
            <div className="space-y-3 animate-fade-in">
              {!triviaComplete ? (
                <>
                  <div className="flex items-center justify-between text-[11px] text-foreground/60 pb-1">
                    <span>
                      {lang === "TR" ? "Soru" : "Question"} {currentQIndex + 1} / {TRIVIA_QUESTIONS.length}
                    </span>
                    <span className="font-bold text-amber-400">
                      {triviaScore} {lang === "TR" ? "Doğru" : "Correct"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 min-h-[70px] flex items-center">
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {lang === "TR"
                        ? TRIVIA_QUESTIONS[currentQIndex].qTr
                        : TRIVIA_QUESTIONS[currentQIndex].qEn}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {TRIVIA_QUESTIONS[currentQIndex].options.map((opt, oIdx) => {
                      const isCorrect = oIdx === TRIVIA_QUESTIONS[currentQIndex].correct;
                      const isChosen = answeredState === oIdx;

                      let btnStyle = "bg-white/[0.02] border-white/10 text-foreground/80 hover:bg-white/[0.06]";
                      if (answeredState !== null) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-extrabold";
                        } else if (isChosen) {
                          btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-extrabold";
                        } else {
                          btnStyle = "opacity-40 border-white/5";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={answeredState !== null}
                          onClick={() => handleSelectAnswer(oIdx)}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {answeredState !== null && isCorrect && <span>✓</span>}
                          {answeredState !== null && isChosen && !isCorrect && <span>✗</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 mx-auto flex items-center justify-center text-xl font-black">
                    🏆
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    {lang === "TR" ? "Trivia Tamamlandı!" : "Trivia Complete!"}
                  </h4>
                  <p className="text-xs text-foreground/70">
                    {lang === "TR"
                      ? `Toplam Skor: 5 soruda ${triviaScore} doğru cevap!`
                      : `Total Score: ${triviaScore} / 5 correct answers!`}
                  </p>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs font-bold text-amber-300">
                    {triviaScore >= 4
                      ? lang === "TR"
                        ? "🎉 Gurme Seviyesi! İddiayı kaybetmedin, masadakiler düşünsün!"
                        : "🎉 Gourmet Master! You're safe from paying!"
                      : lang === "TR"
                      ? "☕ Puan düşük kaldı! Masanın kahveleri senden olabilir mi?"
                      : "☕ Score is a bit low! Might be your turn to treat coffee!"}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveGame("HUB")}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground/70 cursor-pointer"
                    >
                      {lang === "TR" ? "Menüye Dön" : "Back"}
                    </button>
                    <button
                      onClick={resetTrivia}
                      className="flex-2 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                      {lang === "TR" ? "Tekrar Oyna" : "Play Again"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

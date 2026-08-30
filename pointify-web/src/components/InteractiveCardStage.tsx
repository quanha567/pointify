import * as React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import {
  Sparkles,
  Shuffle,
  RotateCcw,
  Hand,
  Layers,
  LayoutGrid,
  Maximize2,
  CheckCircle2,
  Undo2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type DeckType } from '@/store/useAppStore';

type FormationMode = 'fan' | 'stack' | 'grid';

interface CardItem {
  id: string;
  value: string;
  label: string;
  accent: string;
}

const DECK_CARDS_MAP: Record<DeckType, CardItem[]> = {
  fibonacci: [
    { id: 'f0', value: '0', label: 'Done', accent: 'from-blue-500/20 to-cyan-500/20' },
    { id: 'f1', value: '1', label: 'Trivial', accent: 'from-emerald-500/20 to-teal-500/20' },
    { id: 'f2', value: '2', label: 'Simple', accent: 'from-teal-500/20 to-indigo-500/20' },
    { id: 'f3', value: '3', label: 'Quick', accent: 'from-indigo-500/20 to-violet-500/20' },
    { id: 'f5', value: '5', label: 'Medium', accent: 'from-violet-500/20 to-purple-500/20' },
    { id: 'f8', value: '8', label: 'Complex', accent: 'from-purple-500/20 to-pink-500/20' },
    { id: 'f13', value: '13', label: 'Epic', accent: 'from-pink-500/20 to-rose-500/20' },
    { id: 'f21', value: '21', label: 'Split', accent: 'from-rose-500/20 to-amber-500/20' },
    { id: 'f-coffee', value: '☕', label: 'Pause', accent: 'from-amber-500/20 to-yellow-500/20' },
    { id: 'f-question', value: '?', label: 'Unsure', accent: 'from-slate-500/20 to-zinc-500/20' },
  ],
  'modified-fibonacci': [
    { id: 'mf0', value: '0', label: 'Zero', accent: 'from-blue-500/20 to-cyan-500/20' },
    { id: 'mf-half', value: '½', label: 'Tiny', accent: 'from-emerald-500/20 to-teal-500/20' },
    { id: 'mf1', value: '1', label: 'Trivial', accent: 'from-teal-500/20 to-indigo-500/20' },
    { id: 'mf2', value: '2', label: 'Simple', accent: 'from-indigo-500/20 to-violet-500/20' },
    { id: 'mf3', value: '3', label: 'Quick', accent: 'from-violet-500/20 to-purple-500/20' },
    { id: 'mf5', value: '5', label: 'Medium', accent: 'from-purple-500/20 to-pink-500/20' },
    { id: 'mf8', value: '8', label: 'Complex', accent: 'from-pink-500/20 to-rose-500/20' },
    { id: 'mf13', value: '13', label: 'Large', accent: 'from-rose-500/20 to-amber-500/20' },
    { id: 'mf20', value: '20', label: 'X-Large', accent: 'from-amber-500/20 to-orange-500/20' },
    { id: 'mf40', value: '40', label: 'Epic', accent: 'from-orange-500/20 to-red-500/20' },
    { id: 'mf100', value: '100', label: 'Huge', accent: 'from-red-500/20 to-zinc-500/20' },
    { id: 'mf-q', value: '?', label: 'Unsure', accent: 'from-slate-500/20 to-zinc-500/20' },
  ],
  't-shirt': [
    {
      id: 'ts-xs',
      value: 'XS',
      label: 'Extra Small',
      accent: 'from-emerald-500/20 to-teal-500/20',
    },
    { id: 'ts-s', value: 'S', label: 'Small', accent: 'from-teal-500/20 to-blue-500/20' },
    { id: 'ts-m', value: 'M', label: 'Medium', accent: 'from-blue-500/20 to-indigo-500/20' },
    { id: 'ts-l', value: 'L', label: 'Large', accent: 'from-indigo-500/20 to-purple-500/20' },
    { id: 'ts-xl', value: 'XL', label: 'Extra Large', accent: 'from-purple-500/20 to-pink-500/20' },
    { id: 'ts-xxl', value: 'XXL', label: 'Huge', accent: 'from-pink-500/20 to-rose-500/20' },
    { id: 'ts-q', value: '?', label: 'Unsure', accent: 'from-slate-500/20 to-zinc-500/20' },
  ],
  'powers-of-2': [
    { id: 'p0', value: '0', label: 'Zero', accent: 'from-blue-500/20 to-cyan-500/20' },
    { id: 'p1', value: '1', label: 'Trivial', accent: 'from-emerald-500/20 to-teal-500/20' },
    { id: 'p2', value: '2', label: 'Simple', accent: 'from-teal-500/20 to-indigo-500/20' },
    { id: 'p4', value: '4', label: 'Quick', accent: 'from-indigo-500/20 to-violet-500/20' },
    { id: 'p8', value: '8', label: 'Medium', accent: 'from-violet-500/20 to-purple-500/20' },
    { id: 'p16', value: '16', label: 'Complex', accent: 'from-purple-500/20 to-pink-500/20' },
    { id: 'p32', value: '32', label: 'Epic', accent: 'from-pink-500/20 to-rose-500/20' },
    { id: 'p64', value: '64', label: 'Huge', accent: 'from-rose-500/20 to-amber-500/20' },
    { id: 'p-q', value: '?', label: 'Unsure', accent: 'from-slate-500/20 to-zinc-500/20' },
  ],
};

interface InteractiveCardStageProps {
  selectedDeck?: DeckType;
}

export function InteractiveCardStage({ selectedDeck = 'fibonacci' }: InteractiveCardStageProps) {
  const { t } = useTranslation();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [formation, setFormation] = React.useState<FormationMode>('fan');
  const [cards, setCards] = React.useState<CardItem[]>(DECK_CARDS_MAP[selectedDeck]);
  const [selectedCard, setSelectedCard] = React.useState<CardItem | null>(null);
  const [flippedCards, setFlippedCards] = React.useState<Record<string, boolean>>({});
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);
  const [isShuffling, setIsShuffling] = React.useState(false);

  // Sync cards with selectedDeck prop
  React.useEffect(() => {
    setCards(DECK_CARDS_MAP[selectedDeck] || DECK_CARDS_MAP.fibonacci);
    setSelectedCard(null);
  }, [selectedDeck]);

  const handleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
      setIsShuffling(false);
    }, 450);
  };

  const handleResetPositions = () => {
    setCards(DECK_CARDS_MAP[selectedDeck] || DECK_CARDS_MAP.fibonacci);
    setSelectedCard(null);
    setFlippedCards({});
  };

  // Formation calculations
  const getCardLayoutProps = (index: number, total: number) => {
    const mid = (total - 1) / 2;
    const offset = index - mid;

    if (formation === 'stack') {
      return {
        x: offset * 3,
        y: offset * -2,
        rotate: offset * 1.5,
        scale: 1 - Math.abs(offset) * 0.015,
        zIndex: total - Math.abs(offset),
      };
    }

    if (formation === 'grid') {
      const cols = 5;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const colOffset = (col - (cols - 1) / 2) * 85;
      const rowOffset = (row - 0.5) * 115;
      return {
        x: colOffset,
        y: rowOffset,
        rotate: 0,
        scale: 0.95,
        zIndex: 10 + index,
      };
    }

    // Default: 'fan' layout
    const rotateDeg = isShuffling ? (Math.random() - 0.5) * 50 : offset * 6.5;
    const translateX = isShuffling ? 0 : offset * 46;
    const translateY = isShuffling ? 0 : Math.abs(offset) * 8;

    return {
      x: translateX,
      y: translateY,
      rotate: rotateDeg,
      scale: 1,
      zIndex: 10 + index,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl border border-border/80 bg-gradient-to-b from-white/95 via-card to-background/90 dark:from-card/90 dark:via-card/50 dark:to-background p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-primary/5 overflow-hidden transition-all"
    >
      {/* Motion.dev style decorative grid mesh & kinetic ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none absolute -top-32 -left-32 size-80 rounded-full bg-gradient-to-br from-primary/15 via-indigo-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-80 rounded-full bg-gradient-to-tl from-violet-500/15 via-pink-500/10 to-transparent blur-3xl" />

      {/* Top Controls Bar with Motion.dev Style Layout Tabs */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-3 text-xs font-semibold rounded-full bg-primary/10 text-primary border-primary/20 shadow-2xs"
            >
              <Sparkles className="size-3 text-primary animate-pulse" />
              <span>Motion Physics Playground</span>
            </Badge>
            <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
              <Hand className="size-3 text-primary/70" />
              <span>Drag & fling anywhere</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {t('interactiveDeck.title')}
          </h2>
        </div>

        {/* Formation Switcher (Morphing layoutId pill) & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Formation Modes */}
          <LayoutGroup id="formation-modes">
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60">
              {(
                [
                  { id: 'fan', label: 'Fan', icon: Layers },
                  { id: 'stack', label: 'Stack', icon: Maximize2 },
                  { id: 'grid', label: 'Grid', icon: LayoutGrid },
                ] as const
              ).map((mode) => {
                const isActive = formation === mode.id;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFormation(mode.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-formation-pill"
                        className="absolute inset-0 rounded-lg bg-background border border-border/80 shadow-xs"
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className="size-3.5" />
                      <span>{mode.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          {/* Shuffle & Reset Buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
              disabled={isShuffling}
              className="h-9 px-3 gap-1.5 rounded-xl border-border/80 bg-background hover:bg-primary/5 text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <motion.div
                animate={{ rotate: isShuffling ? 360 : 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <Shuffle className="size-3.5 text-primary" />
              </motion.div>
              <span>{t('interactiveDeck.shuffleButton')}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetPositions}
              className="size-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
              title="Reset Cards"
            >
              <Undo2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Physics Stage Area */}
      <div className="relative min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center py-6 select-none overflow-visible">
        {/* Selected Card Estimate Showcase Banner */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute top-2 z-30 inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md shadow-lg"
            >
              <CheckCircle2 className="size-4 text-primary" />
              <span className="text-xs font-medium text-foreground">
                Selected Estimate:{' '}
                <strong className="font-extrabold text-primary text-sm">
                  {selectedCard.value}
                </strong>{' '}
                ({selectedCard.label})
              </span>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground ml-2 underline cursor-pointer"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Cards Canvas */}
        <div className="relative flex items-center justify-center w-full max-w-2xl h-60">
          <LayoutGroup id="poker-deck-cards">
            {cards.map((card, index) => {
              const total = cards.length;
              const layoutProps = getCardLayoutProps(index, total);
              const isHovered = hoveredCard === card.id;
              const isFlipped = !!flippedCards[card.id];
              const isChosen = selectedCard?.id === card.id;

              return (
                <motion.div
                  key={card.id}
                  layout
                  drag
                  dragConstraints={containerRef}
                  dragElastic={0.25}
                  dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}
                  whileDrag={{
                    scale: 1.15,
                    rotate: 8,
                    zIndex: 100,
                    cursor: 'grabbing',
                  }}
                  initial={{ opacity: 0, scale: 0.5, y: 40 }}
                  animate={{
                    opacity: 1,
                    x: layoutProps.x,
                    y: isHovered ? layoutProps.y - 32 : layoutProps.y,
                    rotate: isHovered ? 0 : layoutProps.rotate,
                    scale: isChosen ? 1.15 : isHovered ? 1.1 : layoutProps.scale,
                    zIndex: isChosen ? 90 : isHovered ? 80 : layoutProps.zIndex,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 26,
                    mass: 0.7,
                  }}
                  onHoverStart={() => setHoveredCard(card.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => setSelectedCard(card)}
                  className="absolute cursor-grab active:cursor-grabbing"
                  style={{ perspective: 1000 }}
                >
                  {/* 3D Card Shell */}
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="relative w-22 h-34 sm:w-26 sm:h-38 rounded-2xl p-1 [transform-style:preserve-3d] shadow-lg transition-shadow duration-300"
                  >
                    {/* Front Face */}
                    <div
                      className={`absolute inset-0 rounded-2xl border-2 flex flex-col justify-between p-2.5 sm:p-3 [backface-visibility:hidden] transition-colors duration-200 ${
                        isChosen
                          ? 'border-primary ring-2 ring-primary/50 bg-gradient-to-br from-white via-primary/5 to-primary/20 dark:from-card dark:to-primary/30 shadow-xl shadow-primary/30'
                          : isHovered
                            ? 'border-primary/80 bg-gradient-to-br from-white via-white to-primary/10 dark:from-card dark:via-card dark:to-primary/20 shadow-xl shadow-primary/20'
                            : 'border-border/90 bg-gradient-to-br from-white to-slate-50 dark:from-card dark:to-background shadow-md'
                      }`}
                    >
                      {/* Top Corner Value & Flip Trigger */}
                      <div className="flex items-center justify-between pointer-events-auto">
                        <span className="text-xs sm:text-sm font-black text-foreground">
                          {card.value}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleFlip(card.id, e)}
                          title="Flip 3D"
                          className="size-5 rounded-md hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          <RotateCcw className="size-3" />
                        </button>
                      </div>

                      {/* Giant Central Value */}
                      <div className="flex flex-col items-center justify-center my-auto">
                        <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-br from-foreground via-primary to-violet-600 bg-clip-text text-transparent drop-shadow-2xs">
                          {card.value}
                        </span>
                      </div>

                      {/* Bottom Label & Visual Suit */}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold border-t border-border/50 pt-1">
                        <span className="truncate max-w-[55px]">{card.label}</span>
                        <span className="text-[8px] font-mono uppercase text-primary/80">PT</span>
                      </div>
                    </div>

                    {/* Back Face (3D Flip) */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-primary via-indigo-700 to-violet-900 p-3 text-white flex flex-col items-center justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-xl shadow-primary/30">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                          Pointify
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleFlip(card.id, e)}
                          className="size-5 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                        >
                          <RotateCcw className="size-3" />
                        </button>
                      </div>
                      <div className="flex flex-col items-center justify-center my-auto">
                        <div className="size-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                          <Sparkles className="size-4 text-amber-300 animate-spin-slow" />
                        </div>
                        <span className="text-xs font-black tracking-wider uppercase mt-1.5">
                          Poker Card
                        </span>
                      </div>
                      <span className="text-[9px] text-white/70 text-center font-mono">
                        Scrum Estimation
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}

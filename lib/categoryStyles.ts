import { CategoryColor } from "./types";

export interface ColorDefinition {
  color: CategoryColor;
  label: string;
  emoji: string;
  dotClass: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  bgLightClass: string;
}

export const CATEGORY_COLORS: Record<CategoryColor, ColorDefinition> = {
  blue: {
    color: "blue",
    label: "Blue",
    emoji: "🔵",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    borderClass: "border-blue-500/30",
    textClass: "text-blue-600 dark:text-blue-400",
    bgLightClass: "bg-blue-500/10",
  },
  green: {
    color: "green",
    label: "Green",
    emoji: "🟢",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    borderClass: "border-emerald-500/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgLightClass: "bg-emerald-500/10",
  },
  amber: {
    color: "amber",
    label: "Amber",
    emoji: "🟡",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    borderClass: "border-amber-500/30",
    textClass: "text-amber-600 dark:text-amber-400",
    bgLightClass: "bg-amber-500/10",
  },
  rose: {
    color: "rose",
    label: "Rose",
    emoji: "🔴",
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    borderClass: "border-rose-500/30",
    textClass: "text-rose-600 dark:text-rose-400",
    bgLightClass: "bg-rose-500/10",
  },
  purple: {
    color: "purple",
    label: "Purple",
    emoji: "🟣",
    dotClass: "bg-purple-500",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    borderClass: "border-purple-500/30",
    textClass: "text-purple-600 dark:text-purple-400",
    bgLightClass: "bg-purple-500/10",
  },
  neutral: {
    color: "neutral",
    label: "Neutral",
    emoji: "⚪",
    dotClass: "bg-neutral-400 dark:bg-neutral-500",
    badgeClass: "bg-tag text-muted-foreground border-line",
    borderClass: "border-line",
    textClass: "text-muted-foreground",
    bgLightClass: "bg-tag",
  },
};

export const AVAILABLE_COLORS: CategoryColor[] = ["blue", "green", "amber", "rose", "purple", "neutral"];

export function getCategoryColorDef(color?: string): ColorDefinition {
  if (color && color in CATEGORY_COLORS) {
    return CATEGORY_COLORS[color as CategoryColor];
  }
  return CATEGORY_COLORS.neutral;
}

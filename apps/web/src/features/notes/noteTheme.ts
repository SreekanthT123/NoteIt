export const NOTE_THEMES = {
  lavender: {
    bg: "bg-[#F3CFFD]",
    subBg: "bg-[#F7E0FD]",
    accent: "ring-purple-300",
    selection: "selection:bg-purple-200",
  },
  mint: {
    bg: "bg-[#DFFFE2]",
    subBg: "bg-[#ECFFF0]",
    accent: "ring-green-300",
    selection: "selection:bg-green-200",
  },
  sky: {
    bg: "bg-[#D6EFFF]",
    subBg: "bg-[#EAF6FF]",
    accent: "ring-blue-300",
    selection: "selection:bg-blue-200",
  },
  peach: {
    bg: "bg-[#FFE4D6]",
    subBg: "bg-[#FFF1EA]",
    accent: "ring-orange-300",
    selection: "selection:bg-orange-200",
  },
  gray: {
    bg: "bg-[#F1F1F1]",
    subBg: "bg-[#FAFAFA]",
    accent: "ring-gray-300",
    selection: "selection:bg-gray-200",
  },
} as const;

export type NoteThemeKey = keyof typeof NOTE_THEMES;

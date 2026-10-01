import { useId } from "react";
import type { Construction, Silhouette } from "@/lib/types";

/**
 * Technical flats: the line drawings a garment technologist sends to a factory.
 * Each silhouette is an outline (filled with the colourway) plus construction
 * details (seams, ribs, buttons) drawn on top. viewBox is 200 x 240.
 */
type Shape = { body: string[]; details: string[]; buttons?: [number, number][]; open?: string[] };

const SHAPES: Record<Silhouette, Shape> = {
  crew: {
    body: ["M72 30 Q100 44 128 30 L158 40 Q170 44 174 60 L190 150 L170 156 L150 86 L150 206 L50 206 L50 86 L30 156 L10 150 L26 60 Q30 44 42 40 Z"],
    details: ["M72 30 Q100 52 128 30", "M76 32 Q100 48 124 32", "M50 192 L150 192", "M12 140 L30 146", "M188 140 L170 146", "M50 86 L46 62", "M150 86 L154 62"],
  },
  turtleneck: {
    body: [
      "M72 34 Q100 46 128 34 L158 42 Q170 46 174 62 L190 152 L170 158 L150 88 L150 206 L50 206 L50 88 L30 158 L10 152 L26 62 Q30 46 42 42 Z",
      "M78 8 L122 8 L126 36 Q100 46 74 36 Z",
    ],
    details: ["M84 8 L82 38", "M92 8 L91 41", "M100 8 L100 42", "M108 8 L109 41", "M116 8 L118 38", "M50 192 L150 192", "M12 142 L30 148", "M188 142 L170 148"],
  },
  cardigan: {
    body: ["M70 28 L100 96 L130 28 L158 38 Q170 42 174 58 L192 156 L172 162 L152 86 L152 210 L48 210 L48 86 L28 162 L8 156 L26 58 Q30 42 42 38 Z"],
    details: ["M70 28 L100 96 L130 28", "M76 30 L100 86 L124 30", "M100 96 L100 210", "M48 196 L152 196", "M60 150 L86 150 L86 176 L60 176 Z", "M114 150 L140 150 L140 176 L114 176 Z", "M10 146 L28 152", "M190 146 L172 152"],
    buttons: [[100, 112], [100, 134], [100, 156], [100, 178]],
  },
  tee: {
    body: ["M70 30 Q100 44 130 30 L166 46 L180 86 L156 96 L146 76 L146 204 L54 204 L54 76 L44 96 L20 86 L34 46 Z"],
    details: ["M70 30 Q100 52 130 30", "M75 32 Q100 47 125 32", "M54 76 L52 48", "M146 76 L148 48", "M25 80 L48 90", "M175 80 L152 90"],
  },
  shirt: {
    body: [
      "M74 26 L126 26 L158 38 Q168 42 172 56 L192 164 L172 168 L150 86 L150 214 Q100 222 50 214 L50 86 L28 168 L8 164 L28 56 Q32 42 42 38 Z",
      "M74 26 L100 50 L126 26 L120 14 L80 14 Z",
    ],
    details: ["M100 50 L100 216", "M106 50 L106 216", "M80 14 L100 34 L120 14", "M60 70 L84 70 L84 92 L60 92 Z", "M10 152 L30 158", "M190 152 L170 158", "M50 86 L46 58", "M150 86 L154 58"],
    buttons: [[103, 64], [103, 94], [103, 124], [103, 154], [103, 184]],
  },
  coat: {
    body: ["M66 20 Q100 32 134 20 L164 32 Q174 36 178 52 L196 172 L176 178 L156 90 L162 234 L38 234 L44 90 L24 178 L4 172 L22 52 Q26 36 36 32 Z"],
    details: ["M66 20 L92 84 L100 74 L108 84 L134 20", "M100 74 L104 234", "M44 132 L156 132", "M56 158 L82 156", "M118 156 L144 158", "M6 158 L24 164", "M194 158 L176 164"],
    buttons: [[112, 100], [112, 160], [88, 100], [88, 160]],
  },
  blazer: {
    body: ["M68 22 Q100 32 132 22 L160 32 Q170 36 174 50 L192 160 L172 166 L152 86 L156 196 Q100 204 44 196 L48 86 L28 166 L8 160 L26 50 Q30 36 40 32 Z"],
    details: ["M68 22 L90 104 L100 96 L110 104 L132 22", "M100 96 L100 200", "M58 150 L84 150", "M116 150 L142 150", "M116 66 L134 64", "M10 146 L28 152", "M190 146 L172 152"],
    buttons: [[104, 128], [104, 156]],
  },
  "slip-dress": {
    body: ["M76 16 L80 16 L86 64 Q100 74 114 64 L120 16 L124 16 L130 70 L150 230 Q100 238 50 230 L70 70 Z"],
    details: ["M70 70 Q100 82 130 70", "M86 64 L76 16", "M114 64 L124 16", "M74 110 Q100 116 126 110"],
  },
  "knit-dress": {
    body: ["M72 24 Q100 38 128 24 L156 34 Q168 38 172 54 L190 152 L170 158 L150 84 L146 120 L162 232 Q100 240 38 232 L54 120 L50 84 L30 158 L10 152 L28 54 Q32 38 44 34 Z"],
    details: ["M72 24 Q100 46 128 24", "M54 120 L146 120", "M40 220 Q100 228 160 220", "M12 142 L30 148", "M188 142 L170 148"],
  },
  "wide-trouser": {
    body: ["M58 18 L142 18 L172 228 L112 228 L100 84 L88 228 L28 228 Z"],
    details: ["M58 32 L142 32", "M100 32 L100 84", "M76 32 L72 120", "M124 32 L128 120", "M84 32 L84 54", "M116 32 L116 54", "M62 46 Q72 52 70 64"],
    buttons: [[100, 25]],
  },
  "straight-trouser": {
    body: ["M62 18 L138 18 L148 228 L106 228 L100 86 L94 228 L52 228 Z"],
    details: ["M62 32 L138 32", "M100 32 L100 86", "M78 32 L74 226", "M122 32 L126 226", "M64 46 Q74 52 72 64", "M136 46 Q126 52 128 64"],
    buttons: [[100, 25]],
  },
  "midi-skirt": {
    body: ["M66 22 L134 22 L164 214 Q100 224 36 214 Z"],
    details: ["M66 36 L134 36", "M82 36 L70 216", "M100 36 L100 220", "M118 36 L130 216", "M66 36 L52 120", "M134 36 L148 120"],
  },
  scarf: {
    body: ["M64 16 L136 16 L136 70 L120 70 L120 214 L84 214 L84 70 L64 70 Z"],
    details: ["M64 16 L84 70", "M136 16 L120 70", "M86 214 L86 230", "M92 214 L92 230", "M98 214 L98 230", "M104 214 L104 230", "M110 214 L110 230", "M116 214 L116 230"],
  },
  tote: {
    body: ["M42 92 L158 92 L166 222 L34 222 Z"],
    details: ["M44 108 L156 108", "M74 140 L126 140 L126 176 L74 176 Z"],
    open: ["M70 92 Q70 30 100 30 Q130 30 130 92", "M80 92 Q80 42 100 42 Q120 42 120 92"],
  },
  beanie: {
    body: ["M52 150 Q48 64 100 60 Q152 64 148 150 Z", "M44 146 L156 146 L158 190 L42 190 Z"],
    details: ["M60 152 L60 188", "M72 152 L72 188", "M84 152 L84 188", "M96 152 L96 188", "M108 152 L108 188", "M120 152 L120 188", "M132 152 L132 188", "M144 152 L144 188", "M100 60 L100 146", "M76 70 L70 146", "M124 70 L130 146"],
  },
};

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

type Props = {
  silhouette: Silhouette;
  construction: Construction;
  color: string;
  className?: string;
  title?: string;
};

export default function FlatSketch({ silhouette, construction, color, className, title }: Props) {
  const id = useId().replace(/:/g, "");
  const shape = SHAPES[silhouette];
  const dark = luminance(color) < 0.35;
  const line = dark ? "rgba(255,255,255,0.55)" : "rgba(17,17,17,0.75)";
  const texture = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)";

  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={title ?? `${silhouette} technical flat`}>
      <defs>
        <pattern id={`knit-${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0.5 0.5 L3 5 L5.5 0.5" fill="none" stroke={texture} strokeWidth="0.8" />
        </pattern>
        <pattern id={`rib-${id}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M1 0 L1 4" stroke={texture} strokeWidth="1.2" />
        </pattern>
        <pattern id={`twill-${id}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 L0 5" stroke={texture} strokeWidth="1.4" />
        </pattern>
        <pattern id={`plain-weave-${id}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 2 L4 2 M2 0 L2 4" stroke={texture} strokeWidth="0.6" />
        </pattern>
        <pattern id={`canvas-${id}`} width="3" height="3" patternUnits="userSpaceOnUse">
          <path d="M0 1.5 L3 1.5 M1.5 0 L1.5 3" stroke={texture} strokeWidth="0.9" />
        </pattern>
        <linearGradient id={`satin-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {shape.open?.map((d) => (
        <path key={d} d={d} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
      ))}
      {shape.body.map((d) => (
        <g key={d}>
          <path d={d} fill={color} />
          <path d={d} fill={`url(#${construction}-${id})`} />
          <path d={d} fill="none" stroke={line} strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      ))}
      {shape.details.map((d) => (
        <path key={d} d={d} fill="none" stroke={line} strokeWidth="0.9" strokeDasharray={d.includes("Q") ? undefined : "3 2"} strokeLinecap="round" />
      ))}
      {shape.buttons?.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" fill="none" stroke={line} strokeWidth="1" />
      ))}
    </svg>
  );
}

import type { Construction } from "@/lib/types";

/**
 * Draws a tileable greyscale texture for a fabric construction. Used as both
 * the bump map (relief) and, multiplied with the colourway, the colour map.
 * White = raised yarn, black = the gaps between yarns.
 */
export function drawFabric(ctx: CanvasRenderingContext2D, construction: Construction, size: number) {
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  ctx.lineCap = "round";

  const stroke = (shade: number, width: number) => {
    ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
    ctx.lineWidth = width;
  };

  switch (construction) {
    case "knit": {
      // stockinette: columns of interlocking V-shaped loops
      const w = size / 16;
      const h = size / 20;
      for (let row = -1; row <= 20; row++) {
        for (let col = 0; col < 16; col++) {
          const x = col * w;
          const y = row * h;
          for (const [from, to] of [
            [x + w * 0.08, x + w * 0.5],
            [x + w * 0.92, x + w * 0.5],
          ]) {
            stroke(70, w * 0.42);
            ctx.beginPath();
            ctx.moveTo(from, y);
            ctx.quadraticCurveTo((from + to) / 2, y + h * 0.9, to, y + h * 1.25);
            ctx.stroke();
            stroke(220, w * 0.26);
            ctx.stroke();
          }
        }
      }
      break;
    }
    case "rib": {
      const w = size / 24;
      for (let i = 0; i < 24; i++) {
        const g = ctx.createLinearGradient(i * w, 0, (i + 1) * w, 0);
        g.addColorStop(0, "#3a3a3a");
        g.addColorStop(0.5, i % 2 ? "#6a6a6a" : "#f0f0f0");
        g.addColorStop(1, "#3a3a3a");
        ctx.fillStyle = g;
        ctx.fillRect(i * w, 0, w, size);
      }
      break;
    }
    case "twill": {
      // 2/2 twill: diagonal ribs at 45°
      const step = size / 28;
      stroke(215, step * 0.55);
      for (let i = -28; i < 56; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step + size, size);
        ctx.stroke();
      }
      break;
    }
    case "plain-weave":
    case "canvas": {
      // over-under weave: alternating warp and weft floats
      const n = construction === "canvas" ? 24 : 40;
      const s = size / n;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const warpUp = (x + y) % 2 === 0;
          const g = warpUp ? ctx.createLinearGradient(x * s, 0, (x + 1) * s, 0) : ctx.createLinearGradient(0, y * s, 0, (y + 1) * s);
          g.addColorStop(0, "#505050");
          g.addColorStop(0.5, "#e8e8e8");
          g.addColorStop(1, "#505050");
          ctx.fillStyle = g;
          ctx.fillRect(x * s, y * s, s, s);
        }
      }
      // linen and canvas have uneven, slubby yarns
      for (let i = 0; i < n * 3; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.08 + ((i * 37) % 10) / 100})`;
        ctx.fillRect(0, ((i * 53) % n) * s + s * 0.3, size, s * 0.25);
      }
      break;
    }
    case "satin": {
      // long, smooth floats with barely visible structure
      ctx.fillStyle = "#c8c8c8";
      ctx.fillRect(0, 0, size, size);
      stroke(185, 1);
      for (let y = 0; y < size; y += size / 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }
      break;
    }
  }
}

/** Surface response per construction: how matte, fuzzy and bumpy it looks. */
export const fabricFinish: Record<Construction, { roughness: number; sheen: number; bump: number; repeat: number }> = {
  knit: { roughness: 0.95, sheen: 1, bump: 3, repeat: 3 },
  rib: { roughness: 0.92, sheen: 0.9, bump: 3.5, repeat: 3 },
  twill: { roughness: 0.85, sheen: 0.6, bump: 1.6, repeat: 6 },
  "plain-weave": { roughness: 0.9, sheen: 0.3, bump: 1.4, repeat: 5 },
  satin: { roughness: 0.32, sheen: 0.2, bump: 0.3, repeat: 6 },
  canvas: { roughness: 0.97, sheen: 0.1, bump: 2.2, repeat: 4 },
};

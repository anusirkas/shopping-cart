import type { Metadata } from "next";
import Link from "next/link";
import FlatSketch from "@/components/FlatSketch";
import { getCatalogue } from "@/lib/repository";
import "./passport.css";

export const metadata: Metadata = { title: "Product passports" };

export default async function PassportIndex() {
  const catalogue = await getCatalogue();
  const avgCo2 = catalogue.reduce((n, p) => n + p.passport.footprint.co2Kg, 0) / catalogue.length;
  const recycled = catalogue.filter((p) => p.passport.fibres.some((f) => f.fibre.startsWith("Recycled"))).length;
  const countries = new Set(catalogue.flatMap((p) => p.passport.stages.map((s) => s.country))).size;

  return (
    <div className="page narrow passport">
      <header className="passport-intro">
        <p className="eyebrow">Transparency</p>
        <h1>Every piece has a passport.</h1>
        <p className="lead">
          The EU is introducing digital product passports for textiles. Auro already gives every garment one: what it is made of,
          where each step happened, how to care for it and what to do when it wears out. Scan the QR code on the care label or browse them all below.
        </p>
        <dl className="stats">
          <div><dt>Products</dt><dd>{catalogue.length}</dd></div>
          <div><dt>Countries in the chain</dt><dd>{countries}</dd></div>
          <div><dt>With recycled fibre</dt><dd>{recycled}</dd></div>
          <div><dt>Avg. footprint</dt><dd>{avgCo2.toFixed(1)} kg CO₂e</dd></div>
        </dl>
      </header>

      <ul className="passport-list">
        {catalogue.map((p) => (
          <li key={p.id}>
            <Link href={`/passport/${p.passport.id}`}>
              <span className="pl-flat">
                <FlatSketch silhouette={p.silhouette} construction={p.construction} color={p.colorways[0].hex} />
              </span>
              <span className="mono">{p.passport.id}</span>
              <span>{p.name}</span>
              <span className="muted">{p.passport.fibres.map((f) => f.fibre).join(" / ")}</span>
              <span className="muted">{p.passport.stages.at(-1)?.country}</span>
              <span className="mono">{p.passport.footprint.co2Kg} kg</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

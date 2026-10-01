import type { Metadata } from "next";
import StoreLocator from "@/components/StoreLocator";
import { stores } from "@/data/editorial";
import "./stores.css";

export const metadata: Metadata = { title: "Stores" };

type Props = { searchParams: Promise<{ city?: string }> };

export default async function StoresPage({ searchParams }: Props) {
  const { city } = await searchParams;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Visit us</p>
          <h1>Stores</h1>
        </div>
        <p className="muted">{stores.length} stores · repairs and take-back in every one</p>
      </div>
      <StoreLocator stores={stores} initialCity={city} />
    </div>
  );
}

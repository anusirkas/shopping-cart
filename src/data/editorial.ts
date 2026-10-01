export type Store = {
  city: string;
  country: string;
  address: string;
  coords: [number, number];
  hours: string;
  note: string;
};

export const stores: Store[] = [
  { city: "Tallinn", country: "Estonia", address: "Viru 3", coords: [59.437, 24.7536], hours: "Mon–Sat 10–19", note: "Flagship and knit studio. See the machines through the window." },
  { city: "Copenhagen", country: "Denmark", address: "Strøget 12", coords: [55.6781, 12.5753], hours: "Mon–Sat 10–18", note: "Repair desk: free darning on Auro knitwear." },
  { city: "Paris", country: "France", address: "Galerie Vivienne 4", coords: [48.8665, 2.3398], hours: "Tue–Sun 11–19", note: "AuroSphere: a gallery for fashion, art and publishing under the arcades." },
  { city: "London", country: "United Kingdom", address: "45 Regent Street", coords: [51.5101, -0.1366], hours: "Mon–Sun 10–20", note: "Take-back point for worn Auro pieces." },
  { city: "New York", country: "United States", address: "789 5th Avenue", coords: [40.7638, -73.9729], hours: "Mon–Sun 11–19", note: "Made-to-measure appointments for coats and tailoring." },
];

export type Story = { title: string; text: string; image: string; href: string };

/** Journal stories from the original Auro front page. */
export const journal: Story[] = [
  { title: "Free shipping & returns", text: "Fast delivery and easy returns or exchanges on every order.", image: "https://picsum.photos/id/420/800/1000", href: "/shop" },
  { title: "Our sustainability promise", text: "Every piece ships with a digital passport. Read where yours was made.", image: "https://picsum.photos/id/325/800/1000", href: "/passport" },
  { title: "AuroSphere, Paris", text: "A permanent gallery merging fashion, art and publishing beneath the arcades.", image: "https://picsum.photos/id/405/800/1000", href: "/stores?city=Paris" },
  { title: "AW26 collection", text: "Double-faced coats, fine-rib cashmere and knitwear made in Tallinn.", image: "https://picsum.photos/id/21/800/1000", href: "/shop?sort=newest" },
  { title: "Discover our stores", text: "Find your nearest Auro store and see the collection in person.", image: "https://picsum.photos/id/409/800/1000", href: "/stores" },
];

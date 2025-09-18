function News() {
  const newsArray = [
    {
      id: 1,
      title: "Free Shipping & Returns",
      text: "Fast delivery and easy returns or exchanges on all orders.",
      img: "https://picsum.photos//id/420/4825/3217",
    },
    {
      id: 2,
      title: "Sustainability Promise",
      text: "We care about you, so we care about our planet. Read our promises.",
      img:  "https://picsum.photos/id/325/4928/3264",
    },
    {
      id: 3,
      title: "AuroSphere in Royal Queen Street",
      text: "A permanent gallery merging fashion, art and publishing beneath Paris arcades.",
      img: "https://picsum.photos/id/405/3000/1688",
    },
    {
      id: 4,
      title: "FW25 Runway",
      text: "Explore the Women’s FW25 runway collection.",
      img: "https://picsum.photos/id/21/3008/2008",
    },
    {
      id: 5,
      title: "Discover Our Stores",
      text: "Find your nearest Lux store and experience timeless design.",
      img: "https://picsum.photos/id/409/4368/2912",
    },
  ];

  return (
    <section className="bg-white py-24 px-20 m-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-12">
          Latest News
        </h2>

        {/* Grid container */}
        <div className="grid grid-cols-5 md:grid-cols-1 lg:grid-cols-5 gap-12">
          {newsArray.map((news) => (
            <a
              key={news.id}
              href={`/news/${news.id}`}
              className="group flex flex-col text-center"
            >
              <div className="overflow-hidden">
                <img
                  src={news.img}
                  alt={news.title}
                  className="w-full h-[450px] object-cover mb-4 transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-lg font-bold mb-2 ">
                {news.title}
              </h3>
              <p className="text-sm text-gray-600 font-sans">{news.text}</p>
            </a>
          ))}
        </div>
      </div>

    </section>
  );
}

export default News;

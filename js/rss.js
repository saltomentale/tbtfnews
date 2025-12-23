// TODO: Carico da qualche parte le immagini profilo

const FEEDS = [
  {
    url: 'https://finanzacafona.it/feed/',
    author: 'Vittorio',
    img: 'https://example.com/img/vittorio.jpg'
  },
  {
    url: 'https://theitalianleathersofa.com/feed/',
    author: 'Nicola',
    img: 'https://example.com/img/nicola.jpg'
  },
  {
    url: 'https://saltomentale.it/feed/',
    author: 'Alain',
    img: 'https://example.com/img/alain.jpg'
  }
];

async function loadBlogs() {
  const allPosts = [];
  const now = new Date();

  for (const feed of FEEDS) {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
    const res = await fetch(api);
    const data = await res.json();

    data.items.forEach(item => {
      const date = new Date(item.pubDate);
      const diff = (now - date) / (1000 * 60 * 60 * 24);

      if (diff <= 7) {
        allPosts.push({
          title: item.title,
          link: item.link,
          excerpt: item.description,
          author: feed.author,
          img: feed.img
        });
      }
    });
  }

  state.blogs = allPosts.slice(0, 6);
  renderBlogsPreview();
}


const EPISODE_FEED = 'https://feeds.acast.com/public/shows/too-big-to-fail';

async function loadLatestEpisode() {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(EPISODE_FEED)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || !data.items.length) return;

  const ep = data.items[0];

  state.episode.id = ep.guid || ep.acast_episodeId || '';
  state.episode.title = ep.title || '';
  state.episode.description = ep.description || '';
  state.episode.link = ep.link || '';

  state.showNotes = state.episode.description;

  state.playerEmbed = `
<iframe src="https://embed.acast.com/663e29e5cede820013fbb1a2/${state.episode.id}"
frameBorder="0" width="100%" height="190px"></iframe>
  `.trim();

  document.getElementById('showNotes').value = state.showNotes;
  document.getElementById('playerEmbed').value = state.playerEmbed;
}

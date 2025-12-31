// TODO: Carico da qualche parte le immagini profilo

const FEEDS = [
  {
    url: 'https://finanzacafona.it/feed/',
    author: 'Vittorio',
    img: 'https://saltomentale.github.io/tbtfnews/assets/authors/vittorio.jpg'
  },
  {
    url: 'https://theitalianleathersofa.com/feed/',
    author: 'Nicola',
    img: 'https://saltomentale.github.io/tbtfnews/assets/authors/nicola.jpg'
  },
  {
    url: 'https://saltomentale.it/feed/',
    author: 'Alain',
    img: 'https://saltomentale.github.io/tbtfnews/assets/authors/alain.jpg'
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
  state.episode.description = cleanShowNotes(ep.description || '');
  state.episode.link = ep.link || '';
  state.episode.image = (ep.enclosure && ep.enclosure.image) || '';

  state.episode.links.spotify = "https://open.spotify.com/show/6beSNv77mWZ0oL9LdW3JLp";
  state.episode.links.apple   = "https://podcasts.apple.com/it/podcast/too-big-to-fail/id1746169285";
  state.episode.links.acast   = state.episode.link;
  state.showNotes = state.episode.description;

  document.getElementById('showNotes').value = state.showNotes;

  const promo = extractPromo(ep.description || '');
  if (promo.text || promo.cta) {
    state.sponsor.text = promo.text;
    state.sponsor.cta = promo.cta;

    const sponsorText = document.getElementById('sponsorText');
    const sponsorCta = document.getElementById('sponsorCta');
    if (sponsorText) sponsorText.value = promo.text;
    if (sponsorCta) sponsorCta.value = promo.cta;
  }

  renderEpisodePreview();
}

function cleanShowNotes(html) {
  if (!html) return '';

  let out = html;

  // 1. rimuovi tutti i <br>
  out = out.replace(/<br\s*\/?>/gi, '');

  // 2. tronca tutto dopo la CTA TooBiggie
  const marker = '🫵 TooBiggie, abbiamo bisogno di te:';
  const idx = out.indexOf(marker);

  if (idx !== -1) {
    out = out.substring(0, idx);
  }

  return out.trim();
}

function extractPromo(html) {
  if (!html) return { text: '', cta: '' };

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const promoStrong = Array.from(doc.querySelectorAll('strong'))
    .find(el => /LA PROMO/i.test(el.textContent || ''));

  if (!promoStrong) return { text: '', cta: '' };

  let promoParagraph = promoStrong.closest('p');
  if (promoParagraph && promoParagraph.nextElementSibling) {
    promoParagraph = promoParagraph.nextElementSibling;
  }

  if (!promoParagraph || promoParagraph.tagName !== 'P') {
    return { text: '', cta: '' };
  }

  const link = promoParagraph.querySelector('a');
  const cta = link ? link.getAttribute('href') || '' : '';

  const clone = promoParagraph.cloneNode(true);
  clone.querySelectorAll('a').forEach(a => {
    const textNode = doc.createTextNode(a.textContent || '');
    a.replaceWith(textNode);
  });

  const text = (clone.textContent || '').trim();
  return { text, cta };
}

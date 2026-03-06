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

async function fetchRssAsJson(rssUrl) {
  // Fetch raw XML via CORS proxies and parse locally to avoid external service outages
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`
  ];

  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy);
      if (!res.ok) continue;
      
      const text = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      
      const nodes = Array.from(xml.querySelectorAll('item, entry'));
      const items = nodes.map(item => {
        const isAtom = item.tagName.toLowerCase() === 'entry';
        
        const title = item.querySelector('title')?.textContent || '';
        
        // Link handling
        let link = '';
        if (isAtom) {
          const linkEl = item.querySelector('link[rel="alternate"]') || item.querySelector('link');
          link = linkEl ? linkEl.getAttribute('href') || '' : '';
        } else {
          link = item.querySelector('link')?.textContent || '';
        }
        
        // Handle content vs description
        let description = '';
        if (isAtom) {
          description = item.querySelector('content')?.textContent || item.querySelector('summary')?.textContent || '';
        } else {
          const encodedContent = item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent;
          description = encodedContent || item.querySelector('description')?.textContent || '';
        }
        
        // Publication date
        const dateNode = isAtom ? (item.querySelector('published') || item.querySelector('updated')) : item.querySelector('pubDate');
        const pubDate = dateNode?.textContent || '';
        
        // Guid/id
        const _guid = isAtom ? item.querySelector('id') : item.querySelector('guid');
        const guid = _guid?.textContent || '';
        
        // Podcast parsing specifics
        const acast_episodeId = item.getElementsByTagNameNS('*', 'episodeId')[0]?.textContent || '';
        const enclosureEl = item.querySelector('enclosure');
        
        // rss2json maps itunes:image to enclosure.image
        const itunesImage = item.getElementsByTagNameNS('*', 'image')[0]?.getAttribute('href') || '';
        
        const enclosure = enclosureEl ? {
          link: enclosureEl.getAttribute('url') || '',
          type: enclosureEl.getAttribute('type') || '',
          image: itunesImage
        } : (itunesImage ? { image: itunesImage } : null);

        return { title, link, description, pubDate, guid, acast_episodeId, enclosure };
      });

      return { items };
    } catch (e) {
      console.warn(`Proxy ${proxy} failed`, e);
    }
  }

  console.error("All RSS fetch attempts failed for", rssUrl);
  return { items: [] };
}

async function loadBlogs() {
  const allPosts = [];
  const now = new Date();

  for (const feed of FEEDS) {
    const data = await fetchRssAsJson(feed.url);
    if (!data || !data.items) continue;

    data.items.forEach(item => {
      const date = new Date(item.pubDate);
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      console.log(feed, item.title, date, diff);

      if (diff <= 7) {
        allPosts.push({
          title: item.title,
          link: item.link,
          excerpt: item.description,
          author: feed.author,
          img: feed.img,
          date: date // Store date for sorting
        });
      }
    });
  }

  // Sort by date from newer to older
  allPosts.sort((a, b) => b.date - a.date);

  state.blogs = allPosts.slice(0, 6);
  renderBlogsPreview();
}


const EPISODE_FEED = 'https://feeds.acast.com/public/shows/too-big-to-fail';

async function loadLatestEpisode() {
  const data = await fetchRssAsJson(EPISODE_FEED);

  if (!data || !data.items || !data.items.length) return;

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

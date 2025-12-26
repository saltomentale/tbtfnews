function truncate(text, limit = 120) {
  var result = ""
  if (!text) result = '';
  if (text.length <= limit) result = text;
  result = text.substring(0, limit) + '...';

  return result;
}

async function loadTemplate(name) {
  const res = await fetch(`templates/${name}.html`);
  return res.text();
}

function renderShowNotes() {
  return state.showNotes
    ? templateShowNotes.replace('{{SHOW_NOTES}}', state.showNotes)
    : '';
}

function renderEpisodeCard() {
  if (!state.episode.title) return '';

  return templateEpisodeCard
    .replace('{{EP_IMAGE}}', state.episode.image)
    .replace('{{EP_TITLE}}', state.episode.title)
    .replace('{{SPOTIFY}}', state.episode.links.spotify)
    .replace('{{APPLE}}', state.episode.links.apple)
    .replace('{{ACAST}}', state.episode.links.acast);
}

function renderEpisodePreview() {
  const container = document.getElementById('episodePreview');
  if (!container) return;

  if (!state.episode.title) {
    container.innerHTML = '<p>Nessuna puntata caricata.</p>';
    return;
  }

  container.innerHTML = `
    <div style="
      display:flex;
      gap:16px;
      align-items:center;
      background:rgba(255,255,255,0.03);
      border:1px solid rgba(255,255,255,0.12);
      border-radius:14px;
      padding:16px;
    ">
      <img src="${state.episode.image}"
           width="96"
           style="border-radius:12px;border:1px solid rgba(255,255,255,0.2);">

      <div>
        <strong style="font-size:15px;">${state.episode.title}</strong>
        <div style="margin-top:8px;font-size:13px;opacity:.8;">
          Ascoltala su:
          Spotify · Apple Podcast · Acast
        </div>
      </div>
    </div>
  `;
}


function renderBlogs() {
  if (!state.blogs.length) return '';

  const items = state.blogs.map(p => `
    <tr>
      <td style="padding:20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="48" valign="top">
              <img src="${p.img}" width="48" height="48"
                   style="border-radius:50%;display:block;">
            </td>
            <td style="padding-left:10px;font-family:Arial,sans-serif;font-size:13px;">
              <div style="font-family:Arial,Helvetica,sans-serif;">
                <a href="${p.link}"
                   style="display:block;
                          font-weight:700;
                          font-size:17px;
                          line-height:1.3;
                          color:#000000;
                          text-decoration:underline;">
                  ${p.title}
                </a>

                <div class="blog-post" style="margin-top: 0px;
                            font-size:15px;
                            line-height:1.45;
                            color:#555555;
                            margin-block-start: 0px !important;
                            margin-block-end: 0px !important;
                            ">
                  ${truncate(p.excerpt)}
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return templateBlogs.replace('{{BLOG_ITEMS}}', items);
}


function renderMiniPost() {
  if (!state.miniPost.title) return '';
  return templateMiniPost
    .replace('{{TITLE}}', state.miniPost.title)
    .replace('{{BODY}}', state.miniPost.body);
}

function renderSlides() {
  if (!state.slides.pdf) return '';
  return templateSlides
    .replace('{{PDF}}', state.slides.pdf)
}

function normalizeCTA(html) {
  if (!html) return '';
  return html
    .replace(/<div>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>');
}

function renderCTA() {
  if (!state.cta.title || !state.cta.text) return '';

  return templateCTA
    .replace('{{CTA_TITLE}}', state.cta.title)
    .replace('{{CTA_TEXT}}', normalizeCTA(state.cta.text))
}

function renderBlogsPreview() {
  const container = document.getElementById('blogsPreview');
  container.innerHTML = '';

  state.blogs.forEach(post => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '12px';

    div.innerHTML = `
      <img src="${post.img}" width="48" height="48" style="border-radius:50%;">
      <div>
        <a href="${post.link}" target="_blank">
          <strong>${post.title}</strong>
        </a><br>
        <small>${truncate(post.excerpt)}</small>
      </div>
    `;

    container.appendChild(div);
  });
}

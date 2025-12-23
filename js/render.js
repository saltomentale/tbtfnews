function truncate(text, limit = 120) {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.substring(0, limit) + '...';
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

function renderPlayer() {
  return state.playerEmbed
    ? templatePlayer.replace('{{PLAYER}}', state.playerEmbed)
    : '';
}

function renderBlogs() {
  if (!state.blogs.length) return '';

  const items = state.blogs.map(p => `
    <tr>
      <td style="padding:10px 0;">
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
                          font-size:13px;
                          line-height:1.3;
                          color:#000000;
                          text-decoration:underline;">
                  ${p.title}
                </a>

                <div style="margin-top:4px;
                            font-size:12.5px;
                            line-height:1.45;
                            color:#555555;">
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

let templateShell,
    templateEpisodeCard,
    templateShowNotes,
    templateBlogs,
    templateMiniPost,
    templateCTA,
    templateSlides;

(async function init() {
  templateShell = await loadTemplate('shell');
  templateShowNotes = await loadTemplate('show-notes');
  templateBlogs = await loadTemplate('blogs');
  templateMiniPost = await loadTemplate('mini-post');
  templateSlides = await loadTemplate('slides');
  templateCTA = await loadTemplate('cta');
  templateEpisodeCard = await loadTemplate('episode-card');

  await loadLatestEpisode();
  await loadBlogs();
})();

document.getElementById('loadBlogs').onclick = loadBlogs;
document.getElementById('loadEpisode').onclick = loadLatestEpisode;

document.getElementById('build').onclick = () => {
  state.showNotes = showNotes.value;
  state.miniPost.title = miniTitle.value;
  state.miniPost.body = miniBody.value;
  state.slides.pdf = slidesPdf.value;
  state.cta.title = ctaTitle.value;
  state.cta.text = ctaEditor.innerHTML;

  const html = templateShell
    .replace('{{EPISODE_CARD}}', renderEpisodeCard())
    .replace('{{SHOW_NOTES}}', renderShowNotes())
    .replace('{{MINI_POST}}', renderMiniPost())
    .replace('{{BLOGS}}', renderBlogs())
    .replace('{{CTA}}', renderCTA())
    .replace('{{SLIDES}}', renderSlides());

  output.value = html;
};

document.getElementById('ctaLink').onclick = () => {
  const url = prompt('Inserisci URL del link');
  if (!url) return;

  document.execCommand('createLink', false, url);
};
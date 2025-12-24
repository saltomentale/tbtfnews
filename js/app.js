let templateShell,
    templateEpisodeCard,
    templateShowNotes,
    templateBlogs,
    templateMiniPost,
    templateSlides;

(async function init() {
  templateShell = await loadTemplate('shell');
  templateShowNotes = await loadTemplate('show-notes');
  templateBlogs = await loadTemplate('blogs');
  templateMiniPost = await loadTemplate('mini-post');
  templateSlides = await loadTemplate('slides');
  templateEpisodeCard = await loadTemplate('episode-card');
})();

document.getElementById('loadBlogs').onclick = loadBlogs;
document.getElementById('loadEpisode').onclick = loadLatestEpisode;

document.getElementById('build').onclick = () => {
  state.showNotes = showNotes.value;
  state.miniPost.title = miniTitle.value;
  state.miniPost.body = miniBody.value;
  state.slides.pdf = slidesPdf.value;

  const html = templateShell
    .replace('{{EPISODE_CARD}}', renderEpisodeCard())
    .replace('{{SHOW_NOTES}}', renderShowNotes())
    .replace('{{MINI_POST}}', renderMiniPost())
    .replace('{{BLOGS}}', renderBlogs())
    .replace('{{SLIDES}}', renderSlides());

  output.value = html;
};

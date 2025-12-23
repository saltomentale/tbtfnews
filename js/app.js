let templateShell,
    templateShowNotes,
    templatePlayer,
    templateBlogs,
    templateMiniPost,
    templateSlides;

(async function init() {
  templateShell = await loadTemplate('shell');
  templateShowNotes = await loadTemplate('show-notes');
  templatePlayer = await loadTemplate('player');
  templateBlogs = await loadTemplate('blogs');
  templateMiniPost = await loadTemplate('mini-post');
  templateSlides = await loadTemplate('slides');
})();

document.getElementById('loadBlogs').onclick = loadBlogs;
document.getElementById('loadEpisode').onclick = loadLatestEpisode;

document.getElementById('build').onclick = () => {
  state.showNotes = showNotes.value;
  state.playerEmbed = playerEmbed.value;
  state.miniPost.title = miniTitle.value;
  state.miniPost.body = miniBody.value;
  state.slides.pdf = slidesPdf.value;

  const html = templateShell
    .replace('{{EP_TITLE}}', state.episode.title)
    .replace('{{EP_LINK}}', state.episode.link)
    .replace('{{PLAYER}}', renderPlayer())
    .replace('{{SHOW_NOTES}}', renderShowNotes())
    .replace('{{MINI_POST}}', renderMiniPost())
    .replace('{{BLOGS}}', renderBlogs())
    .replace('{{SLIDES}}', renderSlides());

  output.value = html;
};

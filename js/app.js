let templateShell,
    templateEpisodeCard,
    templateShowNotes,
    templateBlogs,
    templateMiniPost,
    templateCTA,
    templateSponsor,
    templateSlides;

(async function init() {
  templateShell = await loadTemplate('shell');
  templateShowNotes = await loadTemplate('show-notes');
  templateBlogs = await loadTemplate('blogs');
  templateMiniPost = await loadTemplate('mini-post');
  templateSlides = await loadTemplate('slides');
  templateCTA = await loadTemplate('cta');
  templateSponsor = await loadTemplate('sponsor');
  templateEpisodeCard = await loadTemplate('episode-card');

  await loadLatestEpisode();
  await loadBlogs();
})();

document.getElementById('loadBlogs').onclick = loadBlogs;
document.getElementById('loadEpisode').onclick = loadLatestEpisode;

document.getElementById('build').onclick = () => {
  state.showNotes = showNotes.value;
  state.miniPost.title = miniTitle.value;
  state.miniPost.body = miniEditor.innerHTML;
  state.sponsor.text = sponsorText.value;
  state.sponsor.cta = sponsorCta.value;
  state.slides.pdf = slidesPdf.value;

  const html = templateShell
    .replace('{{EPISODE_CARD}}', renderEpisodeCard())
    .replace('{{SHOW_NOTES}}', renderShowNotes())
    .replace('{{MINI_POST}}', renderMiniPost())
    .replace('{{BLOGS}}', renderBlogs())
    .replace('{{SPONSOR}}', renderSponsor())
    .replace('{{CTA}}', renderCTA())
    .replace('{{SLIDES}}', renderSlides());

  output.value = html;
};

/* DIAMONDS - lógica compartida. Cada página define window.D = { badge, search, games } antes de cargar este archivo. */
(() => {
  const { badge, search, games } = window.D;
  const $ = id => document.getElementById(id);
  const grid = $('gamesGrid'), modal = $('gameModal'), box = $('modalContainer'),
        frame = $('gameFrame'), title = $('modalTitle'), input = $('searchInput');

  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // ignora tildes
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function render(list) {
    $('count').textContent = `(${list.length})`;
    grid.innerHTML = list.length
      ? list.map(g => `<div class="game-card" tabindex="0" role="button" data-i="${games.indexOf(g)}">
          <img src="${esc(g.image)}" alt="${esc(g.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
          <div class="game-title">${esc(g.title)}</div></div>`).join('')
      : `<p class="empty">No se encontraron juegos de ${search}.</p>`;
  }

  // Si una portada falla, se cambia por una tarjeta de color con la inicial
  grid.addEventListener('error', e => {
    if (e.target.tagName !== 'IMG') return;
    const ph = document.createElement('div');
    ph.className = 'ph';
    ph.textContent = e.target.alt.charAt(0);
    e.target.replaceWith(ph);
  }, true);

  function open(i) {
    const g = games[i];
    title.textContent = g.title + ' (' + badge + ')';
    frame.src = g.url;
    modal.classList.add('open');
    setTimeout(() => { frame.focus(); frame.contentWindow && frame.contentWindow.focus(); }, 150);
  }

  function close() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    modal.classList.remove('open');
    box.classList.remove('fullscreen');
    frame.src = '';
  }

  // Un solo listener para todas las tarjetas
  grid.addEventListener('click', e => { const c = e.target.closest('.game-card'); if (c) open(+c.dataset.i); });
  grid.addEventListener('keydown', e => { const c = e.target.closest('.game-card'); if (c && e.key === 'Enter') open(+c.dataset.i); });

  $('closeModal').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open') && !document.fullscreenElement) close(); });
  $('fullscreenBtn').addEventListener('click', e => {
    e.currentTarget.blur();
    if (!document.fullscreenElement) box.requestFullscreen().catch(() => box.classList.toggle('fullscreen'));
    else document.exitFullscreen();
  });

  let t;
  input.addEventListener('input', () => {   // búsqueda con pequeña pausa para no renderizar de más
    clearTimeout(t);
    t = setTimeout(() => { const q = norm(input.value.trim()); render(games.filter(g => norm(g.title).includes(q))); }, 120);
  });

  render(games);
})();

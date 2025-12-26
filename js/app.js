let currentVersion = 'wg';
let tanks = [];

const grid = document.getElementById('tankGrid');
const count = document.getElementById('count');

document.getElementById('search').oninput = render;
document.getElementById('nation').onchange = render;
document.getElementById('type').onchange = render;
document.getElementById('tier').onchange = render;

function setVersion(v) {
  currentVersion = v;
  document.querySelectorAll('.version-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  load();
}

function load() {
  fetch(`data/wot_${currentVersion}.json`)
    .then(r => r.json())
    .then(data => {
      tanks = data;
      render();
    });
}

function render() {
  const s = search.value.toLowerCase();
  const n = nation.value;
  const t = type.value;
  const tr = tier.value;

  const filtered = tanks.filter(x =>
    (!s || x.name.toLowerCase().includes(s)) &&
    (!n || x.nation === n) &&
    (!t || x.type === t) &&
    (!tr || x.tier == tr)
  );

  count.textContent = `Найдено танков: ${filtered.length}`;

  grid.innerHTML = filtered.map(tank => `
    <div class="tank-card" onclick="openTank(${tank.id})">
      <strong>[${tank.tier}] ${tank.name}</strong><br>
      ${tank.nation.toUpperCase()} · ${tank.type}
    </div>
  `).join('');
}

function openTank(id) {
  location.href = `tank.html?id=${id}&version=${currentVersion}`;
}

load();

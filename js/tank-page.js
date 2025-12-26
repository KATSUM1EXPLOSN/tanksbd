const p = new URLSearchParams(location.search);
const id = Number(p.get('id'));
const version = p.get('version');

fetch(`data/wot_${version}.json`)
  .then(r => r.json())
  .then(tanks => {
    const t = tanks.find(x => x.id === id);
    if (!t) return;

    tankName.textContent = `[${t.tier}] ${t.name}`;
    tankDesc.textContent = t.description;

    stats.innerHTML = `
      HP: ${t.hp}<br>
      Урон: ${t.damage}<br>
      Пробитие: ${t.penetration}<br>
      Скорость: ${t.speed}
    `;

    guide.innerHTML = `
      <h3>Тактика</h3><p>${t.guide.tactics}</p>
      <h3>Оборудование</h3><ul>${t.guide.equipment.map(e=>`<li>${e}</li>`).join('')}</ul>
    `;

    setupArmor(t);
  });

function setupArmor(tank) {
  const zones = {
    front: tank.armor.hull.front,
    lower: tank.armor.hull.lower,
    side: tank.armor.hull.side,
    rear: tank.armor.hull.rear,
    turret: tank.armor.turret.front
  };

  document.querySelectorAll('.armor-zone').forEach(z => {
    z.onmouseenter = () => {
      armorInfo.textContent = `Броня: ${zones[z.dataset.zone]} мм`;
      z.classList.add('active');
    };
    z.onmouseleave = () => {
      armorInfo.textContent = 'Наведи курсор на броню';
      z.classList.remove('active');
    };
  });
}

document.querySelectorAll('.tab-btn').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.tab-btn,.tab-content')
      .forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById(b.dataset.tab).classList.add('active');
  };
});

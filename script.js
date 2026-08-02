// reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:0.15 });
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));

  // ---- cardapio interativo ----
  const MENU = [
    { key:'sucos', label:'Sucos', note:'Copos de 400ml', items:[
      { n:'Suco da casa Guararema', d:'Água de coco, frutas vermelhas e laranja', p:'R$ 22,00', featured:true },
      { n:'Abacaxi', p:'R$ 10,00' }, { n:'Abacaxi c/ Hortelã', p:'R$ 10,00' },
      { n:'Acerola', p:'R$ 10,00' }, { n:'Açaí', p:'R$ 10,00' },
      { n:'Caju', p:'R$ 10,00' }, { n:'Goiaba', p:'R$ 10,00' },
      { n:'Manga', p:'R$ 10,00' }, { n:'Melancia', p:'R$ 10,00' },
      { n:'Morango', p:'R$ 10,00' }, { n:'Melão', p:'R$ 10,00' },
      { n:'Maracujá', p:'R$ 10,00' }, { n:'Laranja', p:'R$ 10,00' },
      { n:'Amora', p:'R$ 10,00' }, { n:'Framboesa', p:'R$ 10,00' },
      { n:'Frutas vermelhas', p:'R$ 10,00' }, { n:'Frutas amarelas', p:'R$ 10,00' },
      { n:'Mirtilo', p:'R$ 10,00' }, { n:'Pitaya', p:'R$ 10,00' },
      { n:'Kiwi', p:'R$ 10,00' }, { n:'Cupuaçu', p:'R$ 10,00' },
      { n:'Graviola', p:'R$ 10,00' }, { n:'Cajá', p:'R$ 10,00' }
    ]},
    { key:'especiais', label:'Especiais', groups:[
      { title:'Vitaminas', items:[
        { n:'Vitamina mix', p:'R$ 13,00' }, { n:'Mamão', p:'R$ 13,00' },
        { n:'Fruta/polpa', p:'R$ 13,00' }, { n:'Açaí e banana', p:'R$ 15,00' }
      ]},
      { title:'Detox', items:[
        { n:'Detox', d:'Abacaxi, couve, hortelã, maçã e gengibre', p:'R$ 12,00' },
        { n:'Detox vermelho', d:'Beterraba, cenoura, laranja e gengibre', p:'R$ 12,00' }
      ]},
      { title:'Suco c/ Whey', items:[
        { n:'1 fruta c/ água', p:'R$ 19,00' }, { n:'1 fruta c/ leite', p:'R$ 22,00' }
      ]},
      { title:'Suco de milho', items:[
        { n:'Suco de milho', p:'R$ 14,00' }
      ]}
    ]},
    { key:'bebidas', label:'Cafés & bebidas', groups:[
      { title:'Quentes', items:[
        { n:'Café coado pq', p:'R$ 3,00' }, { n:'Café c/ leite coado', p:'R$ 5,00' },
        { n:'Café espresso', p:'R$ 5,00' }, { n:'Café espresso duplo', p:'R$ 8,00' },
        { n:'Café c/ leite espresso', p:'R$ 6,00' }, { n:'Capuccino', p:'R$ 8,00' },
        { n:'Chocolate quente', p:'R$ 6,00' },
        { n:'Capuccino Guararema', d:'Calda de chocolate e chantilly', p:'R$ 14,00' },
        { n:'Chocolate suíço', p:'R$ 12,00' }, { n:'Chá', d:'Erva doce ou camomila', p:'R$ 6,00' }
      ]},
      { title:'Geladas', note:'Copo 400ml', items:[
        { n:'Capuccino gelado', p:'R$ 14,00' }, { n:'Chocolate gelado', p:'R$ 14,00' },
        { n:'Capuccino Guararema', d:'Caseiro, calda de chocolate e chantilly', p:'R$ 20,00' }
      ]}
    ]},
    { key:'comer', label:'Salgados & lanches', groups:[
      { title:'Salgados', items:[
        { n:'Pão de queijo', p:'R$ 5,00' }, { n:'Coxinha', p:'R$ 8,00' },
        { n:'Risoles', p:'R$ 9,00' }, { n:'Croissant', p:'R$ 10,00' },
        { n:'Esfiha', p:'R$ 10,00' }, { n:'Trouxinha', p:'R$ 10,00' },
        { n:'Enroladinho', p:'R$ 14,00' }, { n:'Hambúrgão', p:'R$ 10,00' },
        { n:'Pão de batata', p:'R$ 10,00' }, { n:'Empadinha', p:'R$ 10,00' },
        { n:'Pizza brotinho', p:'R$ 12,00' }, { n:'Tortinha', p:'R$ 10,00' },
        { n:'Pastel assado', p:'R$ 10,00' }, { n:'Quiche', p:'R$ 15,00' }
      ]},
      { title:'Pães e lanches', items:[
        { n:'Pão na chapa', d:'Pão francês com manteiga', p:'R$ 6,00' },
        { n:'Saída requeijão', d:'Pão francês com requeijão', p:'R$ 9,00' },
        { n:'Bauru', d:'Pão de forma, mussarela, presunto e tomate', p:'R$ 12,00' },
        { n:'Misto', d:'Pão de forma, mussarela e presunto', p:'R$ 10,00' },
        { n:'Pão de queijo recheado', d:'Opções: Mussarela, queijo branco, presunto e queijo ou nutella', p:'R$ 12,00' },
        { n:'Sanduíche peito de peru', d:'Pão de forma, alface, tomate, cenoura, maionese, queijo e peru defumado', p:'R$ 14,00' },
        { n:'Linguiça Bragança', d:'Pão francês, hambúrguer, linguiça, mussarela, tomate e maionese', p:'R$ 29,00' }
      ]}
    ]},
    { key:'doces', label:'Doces', items:[
      { n:'Docinhos', p:'R$ 5,00' }, { n:'Donuts', p:'R$ 10,00' },
      { n:'Bombom no pote', p:'R$ 18,00' }, { n:'Bolo gelado', p:'R$ 14,00' },
      { n:'Copo da felicidade', p:'R$ 22,00' }, { n:'Banoffe', p:'R$ 18,00' },
      { n:'Torta no pote', p:'R$ 18,00' }, { n:'Muffin', p:'R$ 10,00' },
      { n:'Bolo simples, pedaço', p:'R$ 8,00' }, { n:'Pudim da casa', p:'R$ 18,00' }
    ]},
    { key:'adicionais', label:'Adicionais', items:[
      { n:'Água de coco no suco', p:'R$ 8,00' }, { n:'Yakult', p:'R$ 6,00' },
      { n:'Banana', p:'R$ 2,00' }, { n:'Fruta/polpa', p:'R$ 6,00' },
      { n:'Nutella', p:'R$ 6,00' }, { n:'Chantilly', p:'R$ 5,00' }
    ]}
  ];

  const menuTabs = document.getElementById('menuTabs');
  const menuList = document.getElementById('menuList');
  const menuNote = document.getElementById('menuNote');

  function itemHTML(item){
    const desc = item.d ? `<div class="menu-item-desc">${item.d}</div>` : '';
    const badge = item.featured ? '<span class="badge">Suco da casa</span>' : '';
    return `<div class="menu-item${item.featured ? ' featured' : ''}">
              <span class="menu-item-name">${item.n}</span> ${badge}
              <span class="menu-item-leader"></span>
              <span class="menu-item-price">${item.p}</span>
              ${desc}
            </div>`;
  }

  function renderMenu(key){
    const cat = MENU.find(c => c.key === key) || MENU[0];
    menuTabs.querySelectorAll('.menu-tab').forEach(btn=>{
      btn.classList.toggle('active', btn.dataset.key === cat.key);
    });
    if(cat.note){ menuNote.textContent = cat.note; menuNote.hidden = false; }
    else { menuNote.hidden = true; }

    if(cat.groups){
      menuList.innerHTML = cat.groups.map(g => {
        const gnote = g.note ? `<div class="menu-group-note">${g.note}</div>` : '';
        return `<div class="menu-group">
                  <h3 class="menu-group-title">${g.title}</h3>
                  ${gnote}
                  ${g.items.map(itemHTML).join('')}
                </div>`;
      }).join('');
    } else {
      menuList.innerHTML = cat.items.map(itemHTML).join('');
    }
  }

  menuTabs.innerHTML = MENU.map((cat,i) =>
    `<button class="menu-tab${i===0?' active':''}" data-key="${cat.key}">${cat.label}</button>`
  ).join('');

  menuTabs.addEventListener('click', (e)=>{
    const btn = e.target.closest('.menu-tab');
    if(!btn) return;
    renderMenu(btn.dataset.key);
  });

  renderMenu(MENU[0].key);

  // ---- copo interativo: despeja e enche conforme o scroll ----
  const heroScroll = document.querySelector('.hero-scroll');
  const liquidPath = document.getElementById('liquidPath');
  const liquidClipPath = document.getElementById('liquidClipPath');
  const fillReadout = document.getElementById('fillReadout');
  const scrollCue = document.getElementById('scrollCue');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const EMPTY_Y = 452; // nivel do liquido quando vazio
  const FULL_Y  = 148; // nivel do liquido quando cheio (perto da boca)

  let targetFill = 0;
  let currentY = EMPTY_Y;
  let t = 0;

  function clamp(n,a,b){ return Math.min(Math.max(n,a),b); }

  function computeProgress(){
    const rect = heroScroll.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = -rect.top;
    let p = total > 0 ? scrolled / total : 0;
    p = clamp(p, 0, 1);
    targetFill = p;
    fillReadout.textContent = Math.round(p * 100) + '%';
    if (scrollCue) scrollCue.classList.toggle('hide', p > 0.06);
  }
  window.addEventListener('scroll', computeProgress, { passive:true });
  window.addEventListener('resize', computeProgress);
  computeProgress();

  const parallaxSection = document.querySelector('.parallax-nature');
  const parallaxBg = document.getElementById('parallaxBg');
  function updateParallax(){
    if(!parallaxSection || !parallaxBg) return;
    const rect = parallaxSection.getBoundingClientRect();
    const center = rect.top + rect.height/2 - window.innerHeight/2;
    const shift = prefersReduced ? 0 : center * -0.16;
    parallaxBg.style.transform = `translateY(${shift.toFixed(1)}px)`;
  }

  function drawWave(y){
    const amp = prefersReduced ? 0 : 5;
    const segments = 8;
    const width = 320;
    let d = `M0,480 L0,${y.toFixed(1)} `;
    for(let i=0;i<=segments;i++){
      const x = (width/segments)*i;
      const yy = y + Math.sin((i/segments)*Math.PI*2 + t) * amp;
      d += `L${x.toFixed(1)},${yy.toFixed(1)} `;
    }
    d += `L${width},480 Z`;
    liquidPath.setAttribute('d', d);
    liquidClipPath.setAttribute('d', d);
  }

  function tick(){
    const targetY = EMPTY_Y - targetFill * (EMPTY_Y - FULL_Y);
    currentY += (targetY - currentY) * 0.08;
    if(!prefersReduced) t += 0.03;
    drawWave(currentY);
    updateParallax();
    requestAnimationFrame(tick);
  }
  tick();

// header scroll state
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive:true });

  // reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // mobile nav
  const navToggle = document.getElementById('navToggle');
  const mobilePanel = document.getElementById('mobilePanel');
  const scrim = document.getElementById('scrim');
  function closeMenu(){ mobilePanel.classList.remove('open'); scrim.classList.remove('show'); }
  navToggle.addEventListener('click', () => {
    mobilePanel.classList.toggle('open');
    scrim.classList.toggle('show');
  });
  scrim.addEventListener('click', closeMenu);
  mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // hero connector lines (+ their end nodes) follow the floating labels in real time
  (function(){
    const svg = document.querySelector('.hero-visual svg');
    if(!svg) return;
    const center = { x:260, y:220 }; // logo center, in the svg's own coordinate space
    const trios = [
      { label: document.querySelector('.ol-1'), path: document.getElementById('conn-1'), node: document.getElementById('node-1') },
      { label: document.querySelector('.ol-2'), path: document.getElementById('conn-2'), node: document.getElementById('node-2') },
      { label: document.querySelector('.ol-3'), path: document.getElementById('conn-3'), node: document.getElementById('node-3') },
    ];

    function toSvgPoint(clientX, clientY){
      const pt = svg.createSVGPoint();
      pt.x = clientX; pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if(!ctm) return null;
      return pt.matrixTransform(ctm.inverse());
    }

    function update(){
      trios.forEach(({ label, path, node }) => {
        if(!label || !path) return;
        const rect = label.getBoundingClientRect();
        if(rect.width === 0 || rect.height === 0) return; // hidden (e.g. mobile)

        const centerScreen = toSvgPoint(rect.left + rect.width/2, rect.top + rect.height/2);
        const edgeScreen = toSvgPoint(rect.left + rect.width/2, rect.top);
        if(!centerScreen || !edgeScreen) return;

        // px-to-svg-unit scale, derived from the label's own height
        const scale = Math.abs(centerScreen.y - edgeScreen.y) / (rect.height/2) || 1;
        const halfW = (rect.width/2) * scale;
        const halfH = (rect.height/2) * scale;

        // direction from the label's center back toward the logo
        const dx = center.x - centerScreen.x;
        const dy = center.y - centerScreen.y;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx/dist, uy = dy/dist;

        // land the line (and its node dot) on the pill's edge (treated as an ellipse) facing the logo
        const denom = Math.sqrt((ux*ux)/(halfW*halfW) + (uy*uy)/(halfH*halfH)) || 1;
        const r = 1/denom;
        const endX = centerScreen.x + ux*r;
        const endY = centerScreen.y + uy*r;

        const midX = (center.x + endX)/2;
        const midY = (center.y + endY)/2;
        path.setAttribute('d', `M${center.x} ${center.y} Q ${midX} ${midY} ${endX} ${endY}`);
        if(node){ node.setAttribute('cx', endX); node.setAttribute('cy', endY); }
      });
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  })();

/* ─────────────────────────────────────────
   Garcia Intelligence — main.js
   ───────────────────────────────────────── */

(function () {

  /* ══════════════════════════════════════
     1. CANVAS HERO — monitores com código
     ══════════════════════════════════════ */

  var canvas = document.getElementById('hero-canvas');
  var ctx    = canvas.getContext('2d');
  var frame  = 0;

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Snippets de código que aparecem nas telas
  var snippets = [
    'const ai = new GarciaAI()',
    'await model.predict(input)',
    'function automate(flow) {',
    '  return flow.execute()',
    '}',
    'import { claude } from "@ai"',
    'const res = await fetch(api)',
    'pipeline.run({ stream: true })',
    'export default handler',
    'db.connect(process.env.URL)',
    'const [data, setData] = useState()',
    'router.post("/webhook", fn)',
    'trigger.on("message", send)',
    'stripe.checkout.create(plan)',
    'supabase.from("users").select()',
    'llm.complete({ prompt, max })',
    'vercel deploy --prod',
    'git commit -m "feat: ai"',
    'process.env.CLAUDE_API_KEY',
    'return { status: 200 }',
    'agent.think(ctx).act()',
    '// garcia intelligence 2025',
  ];

  // Posição e ângulo de cada monitor (coordenadas relativas 0-1)
  var monitors = [
    { rx: 0.08, ry: 0.10, rw: 0.25, rh: 0.44, angle:  0.055 },
    { rx: 0.36, ry: 0.04, rw: 0.28, rh: 0.49, angle:  0.0   },
    { rx: 0.66, ry: 0.10, rw: 0.25, rh: 0.44, angle: -0.055 },
  ];

  // Estado de scroll de cada monitor
  var states = monitors.map(function () {
    var lines = [];
    for (var i = 0; i < 32; i++) {
      lines.push({
        text:   snippets[Math.floor(Math.random() * snippets.length)],
        indent: Math.floor(Math.random() * 3) * 2,
        bright: Math.random() > 0.72,
        kind:   Math.random() > 0.82 ? 'comment' : (Math.random() > 0.55 ? 'key' : 'normal'),
      });
    }
    return { lines: lines, offset: Math.random() * 180, speed: 0.28 + Math.random() * 0.2 };
  });

  // Helper: retângulo com bordas arredondadas
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawMonitor(m, s) {
    var W = canvas.width, H = canvas.height;
    var x = m.rx * W, y = m.ry * H, w = m.rw * W, h = m.rh * H;
    var cx = x + w / 2, cy = y + h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(m.angle);
    ctx.translate(-cx, -cy);

    // Bezel externo
    ctx.fillStyle   = '#0c1010';
    ctx.strokeStyle = 'rgba(74,222,128,0.2)';
    ctx.lineWidth   = 1.5;
    roundRect(x - 7, y - 7, w + 14, h + 14, 7);
    ctx.fill();
    ctx.stroke();

    // Clip na área da tela
    ctx.save();
    roundRect(x, y, w, h, 3);
    ctx.clip();
    ctx.fillStyle = '#050a07';
    ctx.fillRect(x, y, w, h);

    // Scanlines sutis
    for (var sy = y; sy < y + h; sy += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(x, sy, w, 1);
    }

    // Linhas de código
    var fs     = Math.max(8, w * 0.036);
    var lh     = fs * 1.72;
    var scrollY = s.offset % lh;
    var start  = Math.floor(s.offset / lh);
    var vis    = Math.ceil(h / lh) + 2;

    ctx.font = fs + 'px monospace';

    for (var li = 0; li < vis; li++) {
      var idx = (start + li) % s.lines.length;
      var ln  = s.lines[idx];
      var ly  = y + (li * lh) - scrollY + 4;
      if (ly > y + h) break;

      var alpha = ln.bright ? 0.85 : 0.5;

      // Número da linha
      ctx.fillStyle = 'rgba(74,222,128,0.13)';
      ctx.fillText(String(((start + li) % 99) + 1).padStart(2, '0'), x + 4, ly + fs);

      // Texto do código
      if      (ln.kind === 'comment') ctx.fillStyle = 'rgba(90,150,90,'  + (alpha * 0.6) + ')';
      else if (ln.kind === 'key')     ctx.fillStyle = 'rgba(74,222,128,' + alpha         + ')';
      else                            ctx.fillStyle = 'rgba(170,210,170,' + (alpha * 0.8) + ')';

      ctx.fillText(ln.text, x + fs * 1.9 + ln.indent * (fs * 0.55), ly + fs);
    }

    // Highlight na linha ativa
    var al = Math.floor(vis / 2);
    ctx.fillStyle = 'rgba(34,197,94,0.04)';
    ctx.fillRect(x, y + al * lh - scrollY, w, lh);

    // Cursor piscando
    if (frame % 60 < 34) {
      ctx.fillStyle = 'rgba(74,222,128,0.9)';
      ctx.fillRect(x + fs * 1.9 + 55, y + al * lh - scrollY + 3, 2, fs + 2);
    }

    // Glow interno da tela
    var g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0,   'rgba(34,197,94,0.06)');
    g.addColorStop(0.5, 'transparent');
    g.addColorStop(1,   'rgba(34,197,94,0.03)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);

    ctx.restore(); // fim do clip

    // Suporte do monitor
    var sw = w * 0.1, sh = h * 0.13;
    ctx.fillStyle   = '#0c1010';
    ctx.strokeStyle = 'rgba(74,222,128,0.1)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(cx - sw, y + h);
    ctx.lineTo(cx + sw, y + h);
    ctx.lineTo(cx + sw * 0.7, y + h + sh);
    ctx.lineTo(cx - sw * 0.7, y + h + sh);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Base do suporte
    ctx.beginPath();
    ctx.ellipse(cx, y + h + sh, sw * 1.5, sh * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawDesk() {
    var W = canvas.width, H = canvas.height;
    var dy = H * 0.76;
    var g = ctx.createLinearGradient(0, dy, 0, H);
    g.addColorStop(0, 'rgba(14,20,16,0.96)');
    g.addColorStop(1, 'rgba(7,8,10,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, dy, W, H - dy);

    // Linha borda da mesa com glow verde
    ctx.strokeStyle = 'rgba(34,197,94,0.12)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, dy);
    ctx.lineTo(W, dy);
    ctx.stroke();
  }

  function drawPerson() {
    var W = canvas.width, H = canvas.height;
    var cx = W * 0.5, dy = H * 0.76;
    var sh = H * 0.44, sy = dy - sh;

    ctx.save();
    ctx.fillStyle   = 'rgba(4,6,5,0.97)';
    ctx.strokeStyle = 'rgba(4,6,5,0.97)';

    // Torso
    var tw = W * 0.11, th = sh * 0.42;
    var tx = cx - tw / 2, ty = sy + sh * 0.32;
    ctx.beginPath();
    ctx.moveTo(tx + tw * 0.12, ty);
    ctx.lineTo(tx - tw * 0.12, ty + th);
    ctx.lineTo(tx + tw * 1.12, ty + th);
    ctx.lineTo(tx + tw * 0.88, ty);
    ctx.closePath();
    ctx.fill();

    // Cabeça
    var hr = W * 0.031;
    ctx.beginPath();
    ctx.arc(cx, ty - hr * 0.4, hr, 0, Math.PI * 2);
    ctx.fill();

    // Pescoço
    ctx.fillRect(cx - hr * 0.28, ty - hr * 0.4, hr * 0.56, hr * 0.9);

    // Braços
    ctx.lineWidth = W * 0.022;
    ctx.lineCap   = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty + th * 0.28);
    ctx.quadraticCurveTo(cx - W * 0.11, dy - H * 0.015, cx - W * 0.13, dy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx + tw, ty + th * 0.28);
    ctx.quadraticCurveTo(cx + W * 0.11, dy - H * 0.015, cx + W * 0.13, dy);
    ctx.stroke();

    ctx.restore();

    // Rim light verde nas bordas da silhueta
    ctx.save();
    var rg1 = ctx.createRadialGradient(cx - tw * 0.48, ty + th * 0.3, 0, cx - tw * 0.48, ty + th * 0.3, tw * 0.18);
    rg1.addColorStop(0, 'rgba(34,197,94,0.18)');
    rg1.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.fillStyle = rg1;
    ctx.fillRect(cx - tw, ty, tw * 0.25, th);

    var rg2 = ctx.createRadialGradient(cx + tw * 0.48, ty + th * 0.3, 0, cx + tw * 0.48, ty + th * 0.3, tw * 0.18);
    rg2.addColorStop(0, 'rgba(34,197,94,0.18)');
    rg2.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.fillStyle = rg2;
    ctx.fillRect(cx + tw * 0.75, ty, tw * 0.25, th);
    ctx.restore();
  }

  function drawVignette() {
    var W = canvas.width, H = canvas.height;

    var l = ctx.createLinearGradient(0, 0, W * 0.28, 0);
    l.addColorStop(0, 'rgba(7,8,10,0.88)');
    l.addColorStop(1, 'transparent');
    ctx.fillStyle = l;
    ctx.fillRect(0, 0, W * 0.28, H);

    var r = ctx.createLinearGradient(W, 0, W * 0.72, 0);
    r.addColorStop(0, 'rgba(7,8,10,0.88)');
    r.addColorStop(1, 'transparent');
    ctx.fillStyle = r;
    ctx.fillRect(W * 0.72, 0, W * 0.28, H);

    var t = ctx.createLinearGradient(0, 0, 0, H * 0.22);
    t.addColorStop(0, 'rgba(7,8,10,0.92)');
    t.addColorStop(1, 'transparent');
    ctx.fillStyle = t;
    ctx.fillRect(0, 0, W, H * 0.22);

    var b = ctx.createLinearGradient(0, H, 0, H * 0.78);
    b.addColorStop(0, 'rgba(7,8,10,1)');
    b.addColorStop(1, 'transparent');
    ctx.fillStyle = b;
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
  }

  function animate() {
    var W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#07080a';
    ctx.fillRect(0, 0, W, H);

    states.forEach(function (s, i) {
      s.offset += s.speed;
      drawMonitor(monitors[i], s);
    });

    drawDesk();
    drawPerson();
    drawVignette();
    frame++;
    requestAnimationFrame(animate);
  }

  animate();


  /* ══════════════════════════════════════
     2. TYPEWRITER — logo garcia.intelligence
     ══════════════════════════════════════ */

  var logoEl  = document.getElementById('nav-logo');
  var logoTxt = 'garcia.intelligence';
  var charIdx = 0;

  function typeChar() {
    charIdx++;
    var out = '';
    for (var c = 0; c < charIdx; c++) {
      out += logoTxt[c] === '.' ? '<em>.</em>' : logoTxt[c];
    }
    if (charIdx < logoTxt.length) {
      out += '<span class="logo-cursor">|</span>';
    }
    logoEl.innerHTML = out;
    if (charIdx < logoTxt.length) {
      setTimeout(typeChar, charIdx < 7 ? 95 : 72);
    }
  }

  setTimeout(typeChar, 500);


  /* ══════════════════════════════════════
     3. FADE UP — animação ao rolar a página
     ══════════════════════════════════════ */

  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function () {
          entry.target.classList.add('in');
        }, i * 70);
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(function (el) {
    fadeObserver.observe(el);
  });


  /* ══════════════════════════════════════
     4. NAV — borda ao rolar
     ══════════════════════════════════════ */

  window.addEventListener('scroll', function () {
    document.querySelector('nav').style.borderBottomColor =
      window.scrollY > 30
        ? 'rgba(255,255,255,0.13)'
        : 'rgba(255,255,255,0.08)';
  });

})();

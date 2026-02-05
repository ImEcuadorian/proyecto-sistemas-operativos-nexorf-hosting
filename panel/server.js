const express = require("express");
const { exec } = require("child_process");
const crypto = require("crypto");

const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use("/static", express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Panel Nexorf - Admin System</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    :root {
      /* PALETA NEURAL (Cyan) */
      --neon-blue: #00d9ff;
      --bg-dark: #020205;
      --text-main: #ffffff;
      --glass-bg: rgba(2, 10, 20, 0.7);
      --glass-border: rgba(0, 217, 255, 0.3);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      margin: 0;
      font-family: 'Segoe UI', sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden; /* Importante para el canvas */
    }

    /* CANVAS FONDO */
    #neural-canvas {
      position: fixed; top: 0; left: 0; z-index: -1;
    }

    /* TARJETA FORMULARIO (Glassmorphism) */
    .card {
      width: 100%;
      max-width: 450px;
      padding: 3.5rem 2.5rem;
      background: var(--glass-bg);
      backdrop-filter: blur(15px);
      border: 1px solid var(--glass-border);
      border-radius: 25px;
      box-shadow: 0 0 50px rgba(0, 217, 255, 0.1);
      text-align: center;
      position: relative;
      z-index: 10;
    }

    /* LOGO CON FILTRO CIAN */
    .logo-header {
      height: 80px;
      margin-bottom: 1.5rem;
      /* Convierte rojo a cian y añade brillo */
      filter: hue-rotate(180deg) drop-shadow(0 0 20px var(--neon-blue));
      animation: floatLogo 4s ease-in-out infinite;
    }
    @keyframes floatLogo { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

    h1 {
      font-size: 2rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 2.5rem;
      background: linear-gradient(to right, #fff, var(--neon-blue));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }

    /* FORMULARIOS ESTILO NEURAL */
    label {
      display: block;
      text-align: left;
      font-size: 0.9rem;
      color: var(--neon-blue);
      margin-bottom: 0.8rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-left: 15px; /* Alineado con el input redondeado */
    }

    input {
      width: 100%;
      padding: 15px 25px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 217, 255, 0.3);
      color: #fff;
      border-radius: 50px; /* Redondeado estilo cápsula */
      outline: none;
      font-family: 'Segoe UI', sans-serif;
      font-size: 1rem;
      margin-bottom: 2.5rem;
      transition: 0.3s;
    }

    input:focus {
      border-color: var(--neon-blue);
      box-shadow: 0 0 20px rgba(0, 217, 255, 0.2);
      background: rgba(0, 217, 255, 0.05);
    }

    /* BOTÓN NEURAL */
    button {
      width: 100%;
      padding: 16px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      border: 1px solid var(--neon-blue);
      color: var(--neon-blue);
      background: rgba(0, 217, 255, 0.05);
      border-radius: 50px;
      cursor: pointer;
      transition: 0.3s;
      font-size: 1rem;
    }

    button:hover {
      background: var(--neon-blue);
      color: #000;
      box-shadow: 0 0 30px var(--neon-blue);
      transform: translateY(-2px);
    }

  </style>
</head>
<body>

<canvas id="neural-canvas"></canvas>

<form method="POST" class="card">
  <img src="/static/nexorf_1.png" alt="Nexorf" class="logo-header">

  <h1>PANEL NEXORF</h1>

  <label>USUARIO DEL SISTEMA</label>
  <input
          name="user"
          required
          placeholder="Ingrese nombre de usuario..."
          autocomplete="off"
  />

  <button type="submit">
    Inicializar Hosting
  </button>

</form>

<script>
  const canvas = document.getElementById('neural-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  const particleCount = 100;

  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 1.0;
      this.vy = (Math.random() - 0.5) * 1.0;
      this.size = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if(this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if(this.y < 0 || this.y > canvas.height) this.vy *= -1;

      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx*dx + dy*dy);
      if (distance < mouse.radius) {
        if (mouse.x < this.x && this.x < canvas.width - 10) this.x += 1;
        if (mouse.x > this.x && this.x > 10) this.x -= 1;
        if (mouse.y < this.y && this.y < canvas.height - 10) this.y += 1;
        if (mouse.y > this.y && this.y > 10) this.y -= 1;
      }
    }
    draw() {
      ctx.fillStyle = '#00d9ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for(let i=0; i<particleCount; i++) particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i<particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for(let j=i; j<particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if(distance < 130) {
          ctx.strokeStyle = \`rgba(0, 217, 255, \${1 - distance/130})\`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  init();
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
  });

  window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });
</script>

</body>
</html>  `);
});

app.post("/", (req, res) => {
  const user = req.body.user;


  exec(
    `docker exec nexorf-hosting /scripts/create_hosting.sh ${user}`,
    (err, stdout, stderr) => {
      if (err) {
        return res.send(`<pre class="text-red-500">${stderr}</pre>`);
      }

    const password = crypto.randomBytes(8).toString("base64");
      const dbPass = crypto.randomBytes(10).toString("hex");
      const mailPass = crypto.randomBytes(8).toString("base64");

      exec(
        `docker exec nexorf-mail setup email add ${user}@nexorf.com '${mailPass}'`,
        (mailErr, mailOut, mailErrOut) => {
          if (mailErr) {
            console.error("Error creando correo:", mailErrOut);
          }
        }
      );

      exec(
          `docker exec nexorf-db mariadb -uroot -proot -e "
          DROP USER IF EXISTS '${user}'@'%';
          DROP USER IF EXISTS '${user}'@'localhost';
          DROP USER IF EXISTS '${user}'@'172.%';

          FLUSH PRIVILEGES;

          CREATE DATABASE IF NOT EXISTS \`${user}_db\`
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci;

          CREATE USER '${user}'@'%'
            IDENTIFIED BY '${dbPass}';

          GRANT ALL PRIVILEGES ON \`${user}_db\`.* TO '${user}'@'%';

          FLUSH PRIVILEGES;
          "`,
          (dbErr, dbOut, dbErrOut) => {
            if (dbErr) {
              console.error("❌ MYSQL ERROR:", dbErrOut);
              return res.send("Error creando base de datos");
            }

            // AQUÍ ya es seguro responder
            console.log("✅ DB creada correctamente");
          }
        );


          // ✅ SOLO AQUÍ RESPONDES
           res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Hosting Creado - Estado OK</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    :root {
      /* PALETA NEURAL (Cyan) */
      --neon-blue: #00d9ff;
      --bg-dark: #020205;
      --text-main: #ffffff;
      --glass-bg: rgba(2, 10, 20, 0.85); /* Un poco más opaco para legibilidad */
      --glass-border: rgba(0, 217, 255, 0.3);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      margin: 0;
      font-family: 'Segoe UI', sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-x: hidden;
      padding: 40px 20px;
    }

    /* CANVAS FONDO */
    #neural-canvas {
      position: fixed; top: 0; left: 0; z-index: -1;
    }

    /* TARJETA PRINCIPAL */
    .card {
      width: 100%;
      max-width: 800px;
      padding: 3rem;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      box-shadow: 0 0 60px rgba(0, 217, 255, 0.1);
      position: relative;
      animation: zoomIn 0.5s ease-out;
    }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    /* TITULO */
    h1 {
      font-size: 2.2rem;
      text-align: center;
      margin-bottom: 2.5rem;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 15px rgba(0, 217, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }

    .icon-success {
      width: 40px; height: 40px;
      stroke: var(--neon-blue); stroke-width: 3; fill: none;
      filter: drop-shadow(0 0 10px var(--neon-blue));
    }

    /* GRID DE DATOS */
    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .data-item {
      background: rgba(0, 20, 40, 0.6);
      padding: 1.2rem;
      border-left: 4px solid var(--neon-blue);
      border-radius: 0 10px 10px 0;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: 0.3s;
    }
    .data-item:hover { background: rgba(0, 217, 255, 0.1); transform: translateX(5px); }

    .data-icon {
      width: 28px; height: 28px;
      stroke: var(--neon-blue); fill: none; stroke-width: 2; flex-shrink: 0;
      filter: drop-shadow(0 0 5px var(--neon-blue));
    }

    .data-content { display: flex; flex-direction: column; overflow: hidden; }

    .label {
      font-size: 0.75rem; text-transform: uppercase;
      color: var(--neon-blue); letter-spacing: 1px; font-weight: 700; margin-bottom: 3px;
    }
    .value {
      font-family: 'Consolas', monospace; font-size: 1.05rem;
      color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* TERMINAL LOG */
    .terminal-window {
      background: #050a10;
      border: 1px solid rgba(0, 217, 255, 0.2);
      border-radius: 10px;
      margin-bottom: 2.5rem;
      font-family: 'Consolas', monospace;
      font-size: 0.9rem;
      color: #00ff88; /* Verde terminal para logs */
      padding: 1.5rem;
      max-height: 200px;
      overflow-y: auto;
      white-space: pre-wrap;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
    }

    .terminal-header {
      background: #0a1520;
      padding: 8px 15px;
      font-size: 0.75rem; color: #557799;
      border-bottom: 1px solid rgba(0, 217, 255, 0.1);
      margin: -1.5rem -1.5rem 1rem -1.5rem;
      border-radius: 10px 10px 0 0;
      text-transform: uppercase; letter-spacing: 1px; font-weight: 700;
    }

    /* BOTÓN */
    .center-btn { text-align: center; }

    .btn {
      display: inline-block;
      padding: 15px 40px;
      font-weight: bold; text-transform: uppercase; letter-spacing: 1px;
      text-decoration: none;
      border: 1px solid var(--neon-blue); color: var(--neon-blue);
      background: rgba(0, 217, 255, 0.05);
      border-radius: 50px;
      transition: 0.3s;
    }
    .btn:hover {
      background: var(--neon-blue); color: #000;
      box-shadow: 0 0 30px var(--neon-blue);
      transform: translateY(-3px);
    }

  </style>
</head>
<body>

<canvas id="neural-canvas"></canvas>

<div class="card">

  <h1>
    <svg class="icon-success" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    HOSTING DESPLEGADO
  </h1>

  <div class="data-grid">
    <div class="data-item">
      <svg class="data-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      <div class="data-content"><span class="label">FTP Usuario</span><span class="value">${user}</span></div>
    </div>
    <div class="data-item">
      <svg class="data-icon" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
      <div class="data-content"><span class="label">FTP Clave</span><span class="value">${password}</span></div>
    </div>

    <div class="data-item">
      <svg class="data-icon" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
      <div class="data-content"><span class="label">Base de Datos</span><span class="value">${user}_db</span></div>
    </div>
    <div class="data-item">
      <svg class="data-icon" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
      <div class="data-content"><span class="label">Clave DB</span><span class="value">${dbPass}</span></div>
    </div>

    <div class="data-item" style="grid-column: 1 / -1;">
      <svg class="data-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      <div class="data-content"><span class="label">phpMyAdmin</span><span class="value">http://phpmyadmin.nexorf.com</span></div>
    </div>

    <div class="data-item">
      <svg class="data-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      <div class="data-content"><span class="label">Correo</span><span class="value">${user}@nexorf.com</span></div>
    </div>
    <div class="data-item">
      <svg class="data-icon" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
      <div class="data-content"><span class="label">Clave Correo</span><span class="value">${mailPass}</span></div>
    </div>
  </div>

  <div class="terminal-window">
    <div class="terminal-header">SYSTEM OUTPUT LOG >_</div>
    ${stdout}
  </div>

  <div class="center-btn">
    <a href="/" class="btn">
      < Crear otro usuario
    </a>
  </div>

</div>

<script>
  const canvas = document.getElementById('neural-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  const particleCount = 100;

  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 1.0;
      this.vy = (Math.random() - 0.5) * 1.0;
      this.size = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if(this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if(this.y < 0 || this.y > canvas.height) this.vy *= -1;

      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx*dx + dy*dy);
      if (distance < mouse.radius) {
        if (mouse.x < this.x && this.x < canvas.width - 10) this.x += 1;
        if (mouse.x > this.x && this.x > 10) this.x -= 1;
        if (mouse.y < this.y && this.y < canvas.height - 10) this.y += 1;
        if (mouse.y > this.y && this.y > 10) this.y -= 1;
      }
    }
    draw() {
      ctx.fillStyle = '#00d9ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for(let i=0; i<particleCount; i++) particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i<particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for(let j=i; j<particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if(distance < 130) {
          ctx.strokeStyle = \`rgba(0, 217, 255, \${1 - distance/130})\`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  init();
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
  });

  window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });
</script>

</body>
</html>
      `);
        }
      );


  exec(`docker exec nexorf-dns /scripts/add_zone.sh ${user}`);
});

app.listen(3000, () => {
  console.log("🚀 Panel Nexorf activo en puerto 3000");
});

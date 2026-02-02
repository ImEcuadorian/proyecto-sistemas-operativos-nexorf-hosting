const express = require("express");
const { exec } = require("child_process");
const crypto = require("crypto");

const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use("/static", express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.send(`
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Panel Nexorf</title>
  <link rel="stylesheet" href="/static/tailwind.css">
</head>
<body class="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">

  <form method="POST"
    class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 w-[420px] text-white shadow-2xl">

    <h1 class="text-3xl font-extrabold mb-6 text-center">🚀 Panel Nexorf</h1>

    <label class="block mb-2 text-sm opacity-80">Usuario</label>
    <input
      name="user"
      required
      placeholder="ej: juan"
      class="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-6"
    />

    <button
      class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold">
      Crear Hosting
    </button>

  </form>

</body>
</html>
  `);
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
      const dbPass = crypto.randomBytes(8).toString("base64");
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
        `docker exec nexorf-ftp sh -c "
        mkdir -p /home/ftpusers/${user} &&
        printf '%s\\n%s\\n' '${password}' '${password}' | \
        pure-pw useradd ${user} -u ftpuser -d /home/ftpusers/${user} &&
        pure-pw mkdb &&
        chown -R ftpuser:ftpuser /home/ftpusers/${user}
        "`
      );

      exec(`
docker exec nexorf-db mariadb -uroot -proot -e "
CREATE DATABASE ${user}_db;
CREATE USER '${user}'@'%' IDENTIFIED BY '${dbPass}';
GRANT ALL PRIVILEGES ON ${user}_db.* TO '${user}'@'%';
FLUSH PRIVILEGES;"
`);


      res.send(`
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Hosting creado</title>
  <link rel="stylesheet" href="/static/tailwind.css">
</head>
<body class="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">

  <div class="max-w-3xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-white shadow-2xl">

    <h1 class="text-4xl font-extrabold mb-6 text-center">✅ Hosting creado</h1>

    <p>👤 FTP usuario: ${user}</p>
    <p>🔑 FTP clave: ${password}</p>
    <p>🗄️ Base de datos: ${user}_db</p>
<p>👤 Usuario DB: ${user}</p>
<p>🔑 Clave DB: ${dbPass}</p>
<p>🌐 phpMyAdmin: http://phpmyadmin.nexorf.com</p>
<p>📧 Correo: ${user}@nexorf.com</p>
<p>🔑 Clave correo: ${mailPass}</p>
<p>📬 IMAP: mail.nexorf.com (puerto 143)</p>
<p>📤 SMTP: mail.nexorf.com (puerto 587)</p>


    <pre class="bg-black/40 p-6 rounded-2xl text-sm overflow-x-auto mb-6">${stdout}</pre>

    <div class="text-center">
      <a href="/" class="inline-block mt-4 px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition">
        Crear otro usuario
      </a>
    </div>

  </div>

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

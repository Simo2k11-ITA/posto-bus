// ================= BIGLIETTO D'IMBARCO (canvas) =================
const NAVY = "#05164D", NAVY2 = "#0A2472", YEL = "#FFAD00", INK = "#05164D",
      GREY = "#7B8499", LINE = "#D9DEE8", SEATC = "#E4E8F0";
const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Inter,Roboto,sans-serif';

function rrect(c, x, y, w, h, r) {
  const R = typeof r === "number" ? [r, r, r, r] : r; // tl tr br bl
  c.beginPath();
  c.moveTo(x + R[0], y);
  c.lineTo(x + w - R[1], y); c.arcTo(x + w, y, x + w, y + R[1], R[1]);
  c.lineTo(x + w, y + h - R[2]); c.arcTo(x + w, y + h, x + w - R[2], y + h, R[2]);
  c.lineTo(x + R[3], y + h); c.arcTo(x, y + h, x, y + h - R[3], R[3]);
  c.lineTo(x, y + R[0]); c.arcTo(x, y, x + R[0], y, R[0]);
  c.closePath();
}
function txt(c, s, x, y, size, weight, color, align = "left", spacing = 0) {
  c.font = `${weight} ${size}px ${FONT}`; c.fillStyle = color; c.textBaseline = "alphabetic";
  if (!spacing) { c.textAlign = align; c.fillText(s, x, y); return; }
  c.textAlign = "left";
  const chars = [...s], w = chars.reduce((a, ch) => a + c.measureText(ch).width + spacing, -spacing);
  let cx = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  for (const ch of chars) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + spacing; }
}
const label = (c, s, x, y, align) => txt(c, s.toUpperCase(), x, y, 8, 700, GREY, align, 1.4);

function busGlyph(c, cx, cy, s, color) { // piccolo pullman visto di fronte
  c.save(); c.translate(cx, cy); c.scale(s, s); c.fillStyle = color;
  rrect(c, -7, -8, 14, 14, 3); c.fill();
  c.fillStyle = YEL === color ? NAVY : "#fff";
  rrect(c, -5, -6, 10, 5, 1.2); c.fill();
  c.beginPath(); c.arc(-3.5, 3, 1.2, 0, 7); c.arc(3.5, 3, 1.2, 0, 7); c.fill();
  c.fillStyle = color; c.fillRect(-6, 6, 3, 2.5); c.fillRect(3, 6, 3, 2.5);
  c.restore();
}

// codice 2D finto (stile Aztec)
function fakeCode(c, x, y, size, seed) {
  const n = 23, m = size / n;
  let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  c.fillStyle = NAVY;
  const mid = 11;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const d = Math.max(Math.abs(i - mid), Math.abs(j - mid));
    let on;
    if (d <= 5) on = d % 2 === 1 || d === 0; // occhio centrale
    else if (d === 6) on = false;
    else on = rnd() > 0.5;
    if (on) c.fillRect(x + j * m, y + i * m, m + 0.3, m + 0.3);
  }
}

// QR vero (libreria qrcode-generator, MIT): contiene il link di verifica del biglietto
function drawQR(c, x, y, size, text) {
  const qr = qrcode(0, "M"); qr.addData(text); qr.make();
  const n = qr.getModuleCount(), q = 2, m = size / (n + 2 * q);
  c.fillStyle = "#fff"; c.fillRect(x, y, size, size);
  c.fillStyle = NAVY;
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++)
    if (qr.isDark(r, k)) c.fillRect(x + (k + q) * m, y + (r + q) * m, m + 0.25, m + 0.25);
}

// ---------- mezza cabina disegnata apposta ----------
// geometria comune
const CAB = { sw: 30, sh: 28, g: 6, aisle: 24, pad: 14 };
CAB.colX = [0, CAB.sw + CAB.g, 2 * CAB.sw + CAB.g + CAB.aisle, 3 * CAB.sw + 2 * CAB.g + CAB.aisle];
CAB.inner = 4 * CAB.sw + 2 * CAB.g + CAB.aisle;          // 156
CAB.w = CAB.inner + 2 * CAB.pad;                           // 184

function cabinHeight(half) {
  const { sh, g } = CAB;
  return half === "front" ? 30 + 26 + 10 + 6 * (sh + g) - g + 16 : 16 + 7 * (sh + g) - g + 26;
}

function drawCabin(c, x, y, half, her, me, meInitial) {
  const { sw, sh, g, pad, colX, inner, w } = CAB;
  const h = cabinHeight(half);
  // carrozzeria
  c.save();
  c.shadowColor = "rgba(5,22,77,.10)"; c.shadowBlur = 10; c.shadowOffsetY = 3;
  rrect(c, x, y, w, h, half === "front" ? [26, 26, 14, 14] : [14, 14, 26, 26]);
  c.fillStyle = "#fff"; c.fill(); c.restore();
  rrect(c, x, y, w, h, half === "front" ? [26, 26, 14, 14] : [14, 14, 26, 26]);
  c.lineWidth = 1.5; c.strokeStyle = LINE; c.stroke();

  const ix = x + pad;
  const seat = (id, sx, sy, sWidth) => {
    const isHer = id === her, isMe = id === me;
    rrect(c, sx, sy, sWidth, sh, [8, 8, 5, 5]);
    c.fillStyle = isHer ? YEL : isMe ? NAVY : SEATC; c.fill();
    if (isHer) txt(c, id, sx + sWidth / 2, sy + sh / 2 + 4, 10.5, 800, NAVY, "center");
    if (isMe) txt(c, meInitial, sx + sWidth / 2, sy + sh / 2 + 4, 11, 800, "#fff", "center");
    if (!isHer && !isMe) { c.fillStyle = "rgba(5,22,77,.06)"; rrect(c, sx + 5, sy + sh - 6, sWidth - 10, 2.5, 1.2); c.fill(); }
  };
  const door = (dx, dy, dw, dh, lbl) => {
    c.save(); rrect(c, dx, dy, dw, dh, 7); c.clip();
    c.fillStyle = "#F1F3F8"; c.fillRect(dx, dy, dw, dh);
    c.fillStyle = "#DCE1EB"; for (let i = 0; i < dw; i += 6) c.fillRect(dx + i, dy, 2.5, dh);
    c.restore();
    txt(c, lbl, dx + dw / 2, dy + dh / 2 + 3, 7, 800, GREY, "center", 1.2);
  };
  const rowNum = (r, ry) => txt(c, String(r), ix + colX[1] + sw + (CAB.aisle) / 2 + g / 2, ry + sh / 2 + 3, 8, 600, "#A3ABBD", "center");

  let cy = y;
  if (half === "front") {
    cy += 30;
    // autista: volante + scritta centrati nel riquadro, con margine interno su entrambi i lati
    const dW = colX[1] + sw;
    rrect(c, ix, cy, dW, 26, 8); c.fillStyle = "#F1F3F8"; c.fill();
    const lbl = "AUTISTA", fs = 6.5, sp = 0.9;
    c.font = `800 ${fs}px ${FONT}`;
    const tW = [...lbl].reduce((a, ch) => a + c.measureText(ch).width + sp, -sp);
    const wR = 4.5, gap = 5, grp = wR * 2 + gap + tW, gx = ix + (dW - grp) / 2;
    c.strokeStyle = GREY; c.lineWidth = 1.6;
    c.beginPath(); c.arc(gx + wR, cy + 13, wR, 0, 7); c.stroke();
    c.beginPath(); c.arc(gx + wR, cy + 13, 1.2, 0, 7); c.fillStyle = GREY; c.fill();
    c.beginPath(); c.moveTo(gx + wR, cy + 14.2); c.lineTo(gx + wR, cy + 13 + wR); c.moveTo(gx, cy + 12.4); c.lineTo(gx + wR - 1.2, cy + 13); c.moveTo(gx + 2 * wR, cy + 12.4); c.lineTo(gx + wR + 1.2, cy + 13); c.stroke();
    txt(c, lbl, gx + wR * 2 + gap, cy + 15.4, fs, 800, GREY, "left", sp);
    door(ix + colX[2], cy, sw * 2 + g, 26, "PORTA");
    cy += 26 + 10;
    for (let r = 1; r <= 6; r++) {
      seat(r + "A", ix + colX[0], cy, sw); seat(r + "B", ix + colX[1], cy, sw);
      rowNum(r, cy);
      seat(r + "C", ix + colX[2], cy, sw); seat(r + "D", ix + colX[3], cy, sw);
      cy += sh + g;
    }
  } else {
    cy += 16;
    for (let r = 7; r <= 12; r++) {
      seat(r + "A", ix + colX[0], cy, sw); seat(r + "B", ix + colX[1], cy, sw);
      rowNum(r, cy);
      if (r === 7) door(ix + colX[2], cy, sw * 2 + g, sh, "PORTA");
      else { seat(r + "C", ix + colX[2], cy, sw); seat(r + "D", ix + colX[3], cy, sw); }
      cy += sh + g;
    }
    const bw = (inner - 4 * g) / 5;
    ["A", "B", "E", "C", "D"].forEach((l, i) => seat("13" + l, ix + i * (bw + g), cy, bw));
  }
  return h;
}

// ---------- biglietto completo ----------
function drawTicket(o, opt = {}) {
  const withBg = opt.bg !== false;
  // o: { mine, me, friend, from, fromCity, to, toCity }
  const her = neighbour(o.mine), row = +o.mine.slice(0, -1);
  const half = row <= 6 ? "front" : "rear";
  const S = 3, M = opt.margin ?? 18, TW = 360, X = M;          // margin 0 = solo il biglietto
  const cabH = cabinHeight(half);
  const H_HEAD = 68, H_ROUTE = 92, H_FIELDS = 116, H_SEAT = 100, H_MAPHEAD = 34, H_STUB = 118;
  const H_MAP = H_MAPHEAD + cabH + 22;
  const TH = H_HEAD + H_ROUTE + H_FIELDS + H_SEAT + 22 + H_MAP + 22 + H_STUB;
  const W = TW + 2 * M, H = TH + 2 * M;
  const cv = opt.canvas || document.createElement("canvas"); cv.width = W * S; cv.height = H * S; // riuso il canvas: niente perdite di memoria su iOS
  const c = cv.getContext("2d"); c.scale(S, S);

  // sfondo
  const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#E9EDF4"); bg.addColorStop(1, "#D6DDE8");
  if (withBg) { c.fillStyle = bg; c.fillRect(0, 0, W, H); }

  // corpo biglietto
  c.save(); if (opt.shadow !== false) { c.shadowColor = "rgba(5,22,77,.18)"; c.shadowBlur = 24; c.shadowOffsetY = 8; }
  rrect(c, X, M, TW, TH, 22); c.fillStyle = "#fff"; c.fill(); c.restore();

  // header blu
  c.save(); rrect(c, X, M, TW, TH, 22); c.clip();
  const hg = c.createLinearGradient(X, M, X + TW, M + H_HEAD); hg.addColorStop(0, NAVY); hg.addColorStop(1, NAVY2);
  c.fillStyle = hg; c.fillRect(X, M, TW, H_HEAD);
  c.fillStyle = YEL; c.fillRect(X, M + TH - 7, TW, 7); // filo giallo in fondo
  c.restore();
  let y = M;
  // logo
  c.fillStyle = YEL; c.beginPath(); c.arc(X + 36, y + 34, 17, 0, 7); c.fill();
  busGlyph(c, X + 36, y + 34, 1.25, NAVY);
  txt(c, "SERIANA", X + 62, y + 31, 15, 800, "#fff", "left", 2.2);
  txt(c, "AIRBUS LINES", X + 62, y + 46, 8, 600, "rgba(255,255,255,.65)", "left", 2);
  txt(c, "BOARDING PASS", X + TW - 20, y + 31, 8.5, 800, YEL, "right", 2);
  txt(c, "Carta d'imbarco", X + TW - 20, y + 46, 11, 500, "rgba(255,255,255,.85)", "right");
  y += H_HEAD;

  // rotta
  const now = new Date();
  const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
  const flight = "SA " + (1000 + (doy * 73) % 8999);
  txt(c, o.from, X + 20, y + 52, 40, 800, INK, "left", 1);
  txt(c, o.to, X + TW - 20, y + 52, 40, 800, INK, "right", 1);
  txt(c, o.fromCity, X + 21, y + 70, 11, 500, GREY);
  txt(c, o.toCity, X + TW - 21, y + 70, 11, 500, GREY, "right");
  const lx1 = X + 122, lx2 = X + TW - 122, ly = y + 38;
  c.strokeStyle = LINE; c.lineWidth = 1.5; c.setLineDash([3, 4]);
  c.beginPath(); c.moveTo(lx1, ly); c.lineTo(lx2, ly); c.stroke(); c.setLineDash([]);
  c.fillStyle = NAVY; c.beginPath(); c.arc(lx1, ly, 2.5, 0, 7); c.arc(lx2, ly, 2.5, 0, 7); c.fill();
  c.fillStyle = "#fff"; c.beginPath(); c.arc((lx1 + lx2) / 2, ly, 15, 0, 7); c.fill();
  c.fillStyle = YEL; c.beginPath(); c.arc((lx1 + lx2) / 2, ly, 12, 0, 7); c.fill();
  busGlyph(c, (lx1 + lx2) / 2, ly, 0.95, NAVY);
  txt(c, flight, (lx1 + lx2) / 2, ly - 20, 8.5, 800, GREY, "center", 1.2);
  y += H_ROUTE;

  // separatore sottile
  c.fillStyle = LINE; c.fillRect(X + 20, y, TW - 40, 1);

  // campi
  const months = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
  const date = String(now.getDate()).padStart(2, "0") + " " + months[now.getMonth()];
  const time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  const col = [X + 20, X + 146, X + 262];
  const field = (l, v, cx, fy, size = 16) => { label(c, l, cx, fy); txt(c, v, cx, fy + 21, size, 750, INK); };
  field("Passeggero", o.friend.toUpperCase(), col[0], y + 26, 17);
  field("Data", date, col[2], y + 26);
  field("Corsa", flight, col[0], y + 74);
  field("Imbarco", time, col[1], y + 74);
  field("Porta", half === "front" ? "Davanti" : "Centrale", col[2], y + 74);
  y += H_FIELDS;

  // pannello posto
  rrect(c, X + 20, y, 136, 82, 16); c.fillStyle = YEL; c.fill();
  txt(c, "POSTO", X + 36, y + 22, 8.5, 800, NAVY, "left", 1.6);
  txt(c, her, X + 34, y + 68, 46, 850, NAVY, "left", -1);
  const sideTxt = { A: "Finestrino", B: "Corridoio", C: "Corridoio", D: "Finestrino", E: "Centrale" }[her.slice(-1)];
  const sideLR = { A: "sinistra", B: "sinistra", C: "destra", D: "destra", E: "ultima fila" }[her.slice(-1)];
  label(c, "Fila", col[1] + 26, y + 14); txt(c, String(row), col[1] + 26, y + 36, 18, 750, INK);
  label(c, "Lato", col[1] + 82, y + 14); txt(c, sideTxt, col[1] + 82, y + 34, 13.5, 750, INK);
  txt(c, sideLR, col[1] + 82, y + 47, 10, 500, GREY);
  label(c, "Accanto a", col[1] + 26, y + 66);
  rrect(c, col[1] + 26, y + 72, 9, 9, 2.5); c.fillStyle = NAVY; c.fill();
  txt(c, `${o.me.toUpperCase()} · ${o.mine}`, col[1] + 40, y + 81, 12.5, 750, INK);
  y += H_SEAT;

  // perforazione
  const perforate = py => {
    c.save(); c.globalCompositeOperation = "destination-out";
    c.beginPath(); c.arc(X, py, 11, 0, 7); c.arc(X + TW, py, 11, 0, 7); c.fill(); c.restore();
    c.strokeStyle = LINE; c.lineWidth = 1.4; c.setLineDash([5, 5]);
    c.beginPath(); c.moveTo(X + 18, py); c.lineTo(X + TW - 18, py); c.stroke(); c.setLineDash([]);
  };
  // le tacche bucano anche lo sfondo: ridisegno lo sfondo dietro dopo
  const perfs = [y + 11];
  y += 22;

  // mappa
  label(c, "La tua posizione", X + 20, y + 18);
  const tag = half === "front" ? "PARTE ANTERIORE" : "PARTE POSTERIORE";
  c.font = `800 7.5px ${FONT}`;
  const tw = c.measureText(tag).width + tag.length * 1.2 + 14;
  rrect(c, X + TW - 20 - tw, y + 7, tw, 16, 8); c.fillStyle = "#EEF1F7"; c.fill();
  txt(c, tag, X + TW - 20 - tw / 2, y + 18, 7.5, 800, NAVY, "center", 1.2);
  y += H_MAPHEAD;
  const cabX = X + 22;
  if (half === "rear") txt(c, "▲ verso l'autista", cabX + CAB.w / 2, y + 1, 8, 600, "#A3ABBD", "center");
  drawCabin(c, cabX, y + 6, half, her, o.mine, (o.me[0] || "S").toUpperCase());
  // legenda
  const lgX = cabX + CAB.w + 22;
  let lgY = y + 26;
  const legend = (color, title, sub) => {
    rrect(c, lgX, lgY - 11, 14, 14, 4); c.fillStyle = color; c.fill();
    txt(c, title, lgX + 22, lgY, 12.5, 750, INK);
    txt(c, sub, lgX + 22, lgY + 15, 10, 500, GREY);
    lgY += 44;
  };
  legend(YEL, "Tu", `${o.friend} · ${her}`);
  legend(NAVY, o.me, `posto ${o.mine}`);
  c.fillStyle = LINE; c.fillRect(lgX, lgY - 14, TW - (lgX - X) - 20, 1);
  lgY += 6;
  label(c, "Sali da", lgX, lgY);
  txt(c, half === "front" ? "Porta davanti" : "Porta centrale", lgX, lgY + 18, 12.5, 750, INK);
  txt(c, half === "front" ? "subito dopo l'autista" : "a metà pullman", lgX, lgY + 32, 10, 500, GREY);
  y += H_MAP - H_MAPHEAD;

  perfs.push(y + 11);
  y += 22;

  // talloncino
  if (o.qr) drawQR(c, X + 16, y + 8, 98, o.qr); else fakeCode(c, X + 22, y + 14, 84, o.mine + o.friend + date);
  txt(c, `Buon viaggio, ${o.friend}`, X + 124, y + 34, 15, 800, INK);
  txt(c, `${o.me} ti aspetta al ${o.mine}`, X + 124, y + 52, 11, 500, GREY);
  label(c, "Gruppo", X + 124, y + 76); txt(c, "A", X + 124, y + 93, 14, 800, INK);
  label(c, "Codice", X + 178, y + 76); txt(c, o.code || "------", X + 178, y + 93, 14, 800, INK, "left", 0.5);
  label(c, "Classe", X + 270, y + 76); txt(c, "Pullman", X + 270, y + 93, 14, 800, INK);

  // tacche e linee
  perfs.forEach(perforate);
  // ridipingo lo sfondo sotto le tacche
  if (withBg) { c.save(); c.globalCompositeOperation = "destination-over";
  c.fillStyle = bg; c.fillRect(0, 0, W, H); c.restore(); }

  return { canvas: cv, her, half };
}

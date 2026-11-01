const {chromium}=require('playwright');const fs=require('fs');(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:180,height:180}});
for(const n of ['icon','icon-night']){await p.setContent('<style>html,body{margin:0}</style>'+fs.readFileSync(n+'.svg','utf8'));await p.screenshot({path:n+'.png'});}
await b.close();
const d=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
const icons={blu:d('icon.png'),notte:d('icon-night.png'),turchese:d('icon-teal.png')};
let h=fs.readFileSync('app.html','utf8');
h=h.replace('<!--ICON-->',()=>`<link rel="apple-touch-icon" id="appleIcon" href="${icons.blu}">
<link rel="icon" type="image/png" id="favIcon" href="${icons.blu}">
<script>
// ===== ICONE =====
// iOS salva l'icona quando aggiungi il sito alla Home: la scelta (impostazioni) viene messa anche
// nell'indirizzo (?icon=...) così l'app aperta dalla Home la ricorda.
window.POSTO_ICONS=${JSON.stringify(icons)};
window.iconChoice=function(){
  var q=(location.search.match(/[?&]icon=(auto|blu|notte|turchese)/)||[])[1], s=null;
  try{ s=localStorage.getItem("icon"); if(q) localStorage.setItem("icon",q); }catch(e){}
  return q||s||"auto";
};
window.iconFor=function(k){
  if(k==="auto") k=(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches)?"notte":"blu";
  return POSTO_ICONS[k]?k:"blu";
};
window.applyIcon=function(){
  var u=POSTO_ICONS[iconFor(iconChoice())];
  document.getElementById("appleIcon").href=u; document.getElementById("favIcon").href=u;
};
applyIcon();
if(window.matchMedia){ var mq=matchMedia("(prefers-color-scheme: dark)"); if(mq.addEventListener) mq.addEventListener("change",applyIcon); }
</script>`);
h=h.replace('<script>/*TICKET*/</script>',()=>'<script>\n'+fs.readFileSync('qrlib.js','utf8')+'\n</script>\n<script>\n'+fs.readFileSync('ticket.js','utf8')+'\n</script>');
fs.writeFileSync('index.html',h);console.log('ok',h.length)})();

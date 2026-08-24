
const STORAGE_KEY='homeStockV01';
const defaultData={
  items:[
    {id:'1',name:'Bounty Paper Towels',brand:'Bounty',category:'Paper Products',functionGroup:'paper-towel',qty:16,unit:'rolls',min:6,locations:{'Basement · Shelf B':12,'Kitchen · Pantry':4},lastVerified:Date.now()-3*86400000},
    {id:'2',name:'Persil Sensitive Laundry Detergent',brand:'Persil',category:'Laundry',functionGroup:'laundry-detergent',qty:2,unit:'bottles',min:1,locations:{'Basement · Shelf A':2},lastVerified:Date.now()-7*86400000},
    {id:'3',name:'Huggies Natural Care Wipes',brand:'Huggies',category:'Baby',functionGroup:'baby-wipes',qty:4,unit:'packs',min:2,locations:{'Baby Room':2,'Basement · Shelf A':2},lastVerified:Date.now()-18*86400000},
    {id:'4',name:'CeraVe Moisturizing Cream',brand:'CeraVe',category:'Personal Care',functionGroup:'body-moisturizer',qty:1,unit:'jar',min:1,locations:{'Main Bathroom':1},lastVerified:Date.now()-22*86400000},
    {id:'5',name:'La Roche-Posay Lipikar AP+M',brand:'La Roche-Posay',category:'Personal Care',functionGroup:'body-moisturizer',qty:1,unit:'bottle',min:0,locations:{'Main Bathroom':1},lastVerified:Date.now()-11*86400000}
  ],
  locations:['Kitchen · Pantry','Kitchen · Under Sink','Basement · Shelf A','Basement · Shelf B','Baby Room','Main Bathroom','Guest Bathroom'],
  categories:['Food','Drinks','Cleaning','Laundry','Paper Products','Personal Care','Skincare','Baby','Pet','Medicine','Household','Other'],
  settings:{language:'zh',mode:'system',theme:'minimal'}
};
let data=loadData(), currentView='home', currentFilter='All';

const i18n={
 zh:{navHome:'首页',navInventory:'库存',navAdd:'新增',navBuy:'想买',navSettings:'设置',familyInventory:'家庭库存',itemsTracked:'类物品',lowStock:'快用完',needCheck:'待确认',recent:'最近新增',locations:'储存位置',thinking:'想买东西？',checkFirst:'先看看家里是否已经有库存或类似物品。',check:'购买前检查',inventory:'全部库存',search:'搜索商品、品牌或用途',add:'新增库存',upload:'上传购物截图',manual:'手动添加',buy:'购买前检查',buyPlaceholder:'例如：洗衣液、身体乳、厨房纸',analyze:'检查家中库存',settings:'设置',language:'语言',appearance:'外观',theme:'主题',backup:'数据备份',export:'导出 JSON 备份',import:'导入 JSON 备份',locationsManage:'储存位置',addLocation:'新增位置'},
 en:{navHome:'Home',navInventory:'Inventory',navAdd:'Add',navBuy:'Buy',navSettings:'Settings',familyInventory:'Home inventory',itemsTracked:'items tracked',lowStock:'Low stock',needCheck:'Need check',recent:'Recent',locations:'Locations',thinking:'Thinking of buying something?',checkFirst:'Check whether you already have the same or a similar item at home.',check:'Check before buying',inventory:'Inventory',search:'Search items, brands or uses',add:'Add inventory',upload:'Upload shopping screenshot',manual:'Add manually',buy:'Check before buying',buyPlaceholder:'e.g. laundry detergent, body lotion',analyze:'Check home stock',settings:'Settings',language:'Language',appearance:'Appearance',theme:'Theme',backup:'Backup',export:'Export JSON backup',import:'Import JSON backup',locationsManage:'Storage locations',addLocation:'Add location'}
};

function loadData(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||structuredClone(defaultData)}catch(e){return structuredClone(defaultData)}}
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));render()}
function t(k){return (i18n[data.settings.language]||i18n.zh)[k]||k}
function setMode(){
 let mode=data.settings.mode;
 if(mode==='system') mode=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
 document.documentElement.dataset.mode=mode;
 document.documentElement.dataset.theme=data.settings.theme;
}
function daysAgo(ts){return Math.floor((Date.now()-ts)/86400000)}
function needsCheck(item){return daysAgo(item.lastVerified)>=14}
function lowStock(item){return item.qty<=item.min}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function modalShell(title,body){return `<button type="button" class="modal-close" aria-label="Close">×</button><h2>${esc(title)}</h2>${body}`}
function bindModalClose(){const modal=document.getElementById('modal');const b=document.querySelector('.modal-close');if(b)b.onclick=()=>modal.close();}

function iconFor(c){return ({'Paper Products':'🧻','Laundry':'🧺','Baby':'🍼','Personal Care':'🧴','Food':'🥫','Drinks':'🥤','Cleaning':'🧽','Skincare':'✨','Pet':'🐾','Medicine':'💊','Household':'🏠'})[c]||'📦'}

function render(){
 setMode();
 document.getElementById('headerEyebrow').textContent=t('familyInventory');
 document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
 document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));
 const v=document.getElementById('view');
 if(currentView==='home') v.innerHTML=homeView();
 if(currentView==='inventory') v.innerHTML=inventoryView();
 if(currentView==='add') v.innerHTML=addView();
 if(currentView==='buy') v.innerHTML=buyView();
 if(currentView==='settings') v.innerHTML=settingsView();
 bindDynamic();
}
function homeView(){
 const low=data.items.filter(lowStock).length, check=data.items.filter(needsCheck).length;
 return `
 <div class="grid">
   <div class="card stat"><div class="label">${t('inventory')}</div><div class="num">${data.items.length}</div><div class="muted small">${t('itemsTracked')}</div></div>
   <div class="card stat"><div class="label">${t('lowStock')}</div><div class="num">${low}</div></div>
   <div class="card stat"><div class="label">${t('needCheck')}</div><div class="num">${check}</div></div>
   <div class="card stat"><div class="label">${t('locations')}</div><div class="num">${data.locations.length}</div></div>
 </div>
 <div class="card hero"><h2>${t('thinking')}</h2><p>${t('checkFirst')}</p><button onclick="go('buy')">${t('check')} →</button></div>
 <div class="section-title"><h2>${t('needCheck')}</h2></div>
 <div class="stack">${data.items.filter(needsCheck).slice(0,4).map(itemCard).join('')||`<div class="card empty">✓</div>`}</div>
 <div class="section-title"><h2>${t('lowStock')}</h2></div>
 <div class="stack">${data.items.filter(lowStock).slice(0,4).map(itemCard).join('')||`<div class="card empty">✓</div>`}</div>`;
}
function itemCard(x){
 return `<div class="card inventory-item" data-id="${x.id}">
   <div class="thumb">${iconFor(x.category)}</div>
   <div class="grow"><div class="item-name">${esc(x.name)}</div><div class="meta">${esc(x.category)} · ${esc(Object.keys(x.locations).join(', ')||'—')}</div><div class="meta">${daysAgo(x.lastVerified)}d since verified</div></div>
   <div class="qty-row"><button class="qty-btn dec">−</button><div class="qty">${x.qty} <span class="small">${esc(x.unit)}</span></div><button class="qty-btn inc">＋</button></div>
 </div>`
}
function inventoryView(){
 const cats=['All',...data.categories];
 const filtered=data.items.filter(x=>currentFilter==='All'||x.category===currentFilter);
 return `<input id="inventorySearch" class="search" placeholder="${t('search')}">
 <div class="chip-row">${cats.map(c=>`<button class="chip ${c===currentFilter?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>
 <div class="section-title"><h2>${t('inventory')}</h2><span class="muted small">${filtered.length}</span></div>
 <div id="inventoryList" class="stack">${filtered.map(itemCard).join('')}</div>`;
}
function addView(){
 return `<div class="stack">
  <button class="card add-card secondary" id="uploadShot"><div class="add-icon">🧾</div><div class="grow"><div class="item-name">${t('upload')}</div><div class="meta">Amazon / Costco / Walmart / 淘宝 / 小票</div></div></button>
  <button class="card add-card secondary" id="manualAdd"><div class="add-icon">＋</div><div class="grow"><div class="item-name">${t('manual')}</div><div class="meta">名称、数量、单位、位置、最低库存</div></div></button>
 </div>
 <div class="card" style="margin-top:14px"><div class="item-name">截图识别说明</div><p class="muted small">此原型已完成上传与确认入口，但尚未连接真实 AI Provider。接入 API 后可把识别结果送入同一确认流程。</p></div>`;
}
function buyView(){
 return `<div class="card">
   <h2 style="margin-top:0">${t('buy')}</h2>
   <input id="buyQuery" class="search" placeholder="${t('buyPlaceholder')}">
   <button class="primary" id="buyAnalyze">${t('analyze')}</button>
   <div id="buyResult" style="margin-top:14px"></div>
 </div>`;
}
function settingsView(){
 return `<div class="stack">
  <div class="card stack">
   <h2 style="margin:0">${t('settings')}</h2>
   <div class="field"><label>${t('language')}</label><select id="langSel"><option value="zh">中文</option><option value="en">English</option></select></div>
   <div class="field"><label>${t('appearance')}</label><select id="modeSel"><option value="system">Follow System</option><option value="light">Light</option><option value="dark">Dark</option></select></div>
   <div class="field"><label>${t('theme')}</label><select id="themeSel"><option value="minimal">Minimal</option><option value="cream">Cream</option><option value="pastel">Pastel</option><option value="morandi">Morandi</option><option value="dopamine">Dopamine</option></select></div>
  </div>
  <div class="card stack"><h2 style="margin:0">${t('locationsManage')}</h2><div>${data.locations.map(l=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span class="grow">${esc(l)}</span><button class="danger small del-loc" data-loc="${esc(l)}">删除</button></div>`).join('')}</div><button class="secondary" id="addLoc">${t('addLocation')}</button></div>
  <div class="card stack"><h2 style="margin:0">${t('backup')}</h2><button class="secondary" id="exportBtn">${t('export')}</button><button class="secondary" id="importBtn">${t('import')}</button></div>
 </div>`;
}
function bindDynamic(){
 document.querySelectorAll('.inc').forEach(b=>b.onclick=e=>adjust(e,1));
 document.querySelectorAll('.dec').forEach(b=>b.onclick=e=>adjust(e,-1));
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{currentFilter=b.dataset.filter;render()});
 const s=document.getElementById('inventorySearch'); if(s)s.oninput=()=>filterInventory(s.value);
 const u=document.getElementById('uploadShot'); if(u)u.onclick=()=>document.getElementById('screenshotInput').click();
 const m=document.getElementById('manualAdd'); if(m)m.onclick=openManualAdd;
 const ba=document.getElementById('buyAnalyze'); if(ba)ba.onclick=analyzeBuy;
 const ls=document.getElementById('langSel'); if(ls){ls.value=data.settings.language;ls.onchange=()=>{data.settings.language=ls.value;saveData()}}
 const ms=document.getElementById('modeSel'); if(ms){ms.value=data.settings.mode;ms.onchange=()=>{data.settings.mode=ms.value;saveData()}}
 const ts=document.getElementById('themeSel'); if(ts){ts.value=data.settings.theme;ts.onchange=()=>{data.settings.theme=ts.value;saveData()}}
 const al=document.getElementById('addLoc'); if(al)al.onclick=()=>simplePrompt('新增储存位置','例如 Basement · Shelf C',v=>{if(v&&!data.locations.includes(v)){data.locations.push(v);saveData()}});
 document.querySelectorAll('.del-loc').forEach(b=>b.onclick=()=>{data.locations=data.locations.filter(x=>x!==b.dataset.loc);saveData()});
 const ex=document.getElementById('exportBtn');if(ex)ex.onclick=exportBackup;
 const im=document.getElementById('importBtn');if(im)im.onclick=()=>document.getElementById('backupInput').click();
}
function adjust(e,d){
 const id=e.target.closest('[data-id]').dataset.id, x=data.items.find(i=>i.id===id); if(!x)return;
 x.qty=Math.max(0,x.qty+d); x.lastVerified=Date.now(); saveData();
}
function filterInventory(q){
 q=q.toLowerCase(); document.querySelectorAll('#inventoryList [data-id]').forEach(el=>{const x=data.items.find(i=>i.id===el.dataset.id);el.style.display=(`${x.name} ${x.brand} ${x.functionGroup}`.toLowerCase().includes(q))?'flex':'none'});
}
function openManualAdd(){
 const modal=document.getElementById('modal'), c=document.getElementById('modalContent');
 c.innerHTML=modalShell('新增物品',`<div class="stack">
 <div class="field"><label>名称</label><input id="fName"></div>
 <div class="row"><div class="field grow"><label>数量</label><input id="fQty" type="number" min="0" value="1"></div><div class="field grow"><label>单位</label><input id="fUnit" value="pcs"></div></div>
 <div class="field"><label>分类</label><select id="fCat">${data.categories.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div>
 <div class="field"><label>用途组</label><input id="fGroup" placeholder="例如 laundry-detergent"></div>
 <div class="field"><label>储存位置</label><select id="fLoc">${data.locations.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div>
 <div class="field"><label>最低库存</label><input id="fMin" type="number" min="0" value="0"></div>
 <div class="row"><button value="cancel" class="secondary grow">取消</button><button type="button" id="saveItem" class="primary grow">保存</button></div></div>`);
 modal.showModal();bindModalClose();
 document.getElementById('saveItem').onclick=()=>{
  const name=fName.value.trim(); if(!name)return;
  data.items.unshift({id:String(Date.now()),name,brand:'',category:fCat.value,functionGroup:fGroup.value.trim()||name.toLowerCase(),qty:Number(fQty.value)||0,unit:fUnit.value.trim()||'pcs',min:Number(fMin.value)||0,locations:{[fLoc.value]:Number(fQty.value)||0},lastVerified:Date.now()});
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));modal.close();go('inventory');
 };
}
function simplePrompt(title,ph,cb){
 const modal=document.getElementById('modal'), c=document.getElementById('modalContent');
 c.innerHTML=modalShell(title,`<input id="simpleInput" class="search" placeholder="${esc(ph)}"><div class="row"><button class="secondary grow">取消</button><button type="button" id="simpleOk" class="primary grow">保存</button></div>`);
 modal.showModal();bindModalClose();document.getElementById('simpleOk').onclick=()=>{const v=simpleInput.value.trim();modal.close();cb(v)};
}
function normalizeQuery(q){return q.toLowerCase().trim().replace(/\s+/g,'-')}
const queryMap=[
 [['厨房纸','paper towel','paper towels','bounty'], 'paper-towel'],
 [['洗衣液','laundry detergent','persil','tide'], 'laundry-detergent'],
 [['湿巾','baby wipes','wipes'], 'baby-wipes'],
 [['身体乳','body lotion','body moisturizer','moisturizer','cerave','lipikar'], 'body-moisturizer']
];
function analyzeBuy(){
 const q=document.getElementById('buyQuery').value.trim(); if(!q)return;
 let group=null;const lq=q.toLowerCase();
 for(const [keys,g] of queryMap){if(keys.some(k=>lq.includes(k)))group=g}
 const exact=data.items.filter(x=>x.name.toLowerCase().includes(lq)||lq.includes(x.name.toLowerCase()));
 const similar=data.items.filter(x=>group&&x.functionGroup===group&&!exact.includes(x));
 const all=[...exact,...similar];
 let cls='green',title='🟢 建议购买',reason='没有找到相同或相似库存。';
 if(all.length){
   const total=all.reduce((s,x)=>s+x.qty,0), min=all.reduce((s,x)=>s+x.min,0);
   if(exact.length&&total>Math.max(min*2,2)){cls='red';title='🔴 不建议购买';reason='家里已有同款，而且库存较充足。'}
   else if(total<=Math.max(min,1)){cls='yellow';title='🟡 可以购买';reason='已有少量库存，但接近最低库存。'}
   else{cls='orange';title='🟠 建议暂缓';reason='家里已有同用途商品。'}
 }
 buyResult.innerHTML=`<div class="status ${cls}"><b>${title}</b><div style="margin-top:5px">${reason}</div></div>`+
 (all.length?`<div class="section-title"><h2>家中已有</h2></div>${all.map(x=>`<div class="card inventory-item"><div class="thumb">${iconFor(x.category)}</div><div class="grow"><div class="item-name">${esc(x.name)}</div><div class="meta">${x.qty} ${esc(x.unit)} · ${esc(Object.keys(x.locations).join(', '))}</div></div></div>`).join('')}`:'');
}
function exportBackup(){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='home-stock-backup.json';a.click();URL.revokeObjectURL(a.href);
}
document.getElementById('backupInput').onchange=async e=>{
 const f=e.target.files[0]; if(!f)return; try{const obj=JSON.parse(await f.text()); if(!obj.items||!obj.settings)throw 0; data=obj; saveData();}catch{alert('Invalid backup file')}
 e.target.value='';
};
document.getElementById('screenshotInput').onchange=e=>{
 const f=e.target.files[0]; if(!f)return;
 const modal=document.getElementById('modal'), c=document.getElementById('modalContent');
 c.innerHTML=modalShell('购物截图已载入',`<p class="muted">当前原型暂未连接 AI Provider。正式接入后，这里会显示“识别到的商品 → 数量 → 分类 → 位置 → 是否加入库存”的批量确认页。</p><div class="card"><b>${esc(f.name)}</b><div class="meta">${Math.round(f.size/1024)} KB</div></div><div class="row" style="margin-top:14px"><button class="secondary grow">关闭</button><button type="button" id="demoDetected" class="primary grow">查看示例识别</button></div>`);
 modal.showModal();bindModalClose();document.getElementById('demoDetected').onclick=()=>{modal.close();openDemoDetected()};
 e.target.value='';
};
function openDemoDetected(){
 const modal=document.getElementById('modal'), c=document.getElementById('modalContent');
 c.innerHTML=modalShell('识别到 3 件商品',`
 ${['Kirkland Paper Towels · 12 rolls','Finish Dishwasher Tabs · 115 tabs','Bananas · 6'].map((x,i)=>`<div class="card row" style="margin-bottom:8px"><input type="checkbox" ${i<2?'checked':''}><span class="grow">${x}</span></div>`).join('')}
 <p class="muted small">示例仅展示确认流程，不会自动写入库存。</p>
 <div class="row"><button value="cancel" class="secondary grow">取消</button><button type="button" id="demoConfirm" class="primary grow">确认入库（示例）</button></div>`);
 modal.showModal();bindModalClose();
 document.getElementById('demoConfirm').onclick=()=>modal.close();
}
function quickCheck(){
 const candidates=data.items.filter(needsCheck); if(!candidates.length){alert('目前没有需要盘点的物品');return}
 const x=candidates[0],modal=document.getElementById('modal'),c=document.getElementById('modalContent');
 c.innerHTML=modalShell('快速盘点',`<div class="card"><div class="item-name">${esc(x.name)}</div><div class="meta">系统记录：${x.qty} ${esc(x.unit)}</div></div><p>实际还有多少？</p><div class="row">${[0,1,2,3,4,5].map(n=>`<button type="button" class="secondary grow qc" data-n="${n}">${n===5?'5+':n}</button>`).join('')}</div>`);
 modal.showModal();bindModalClose();document.querySelectorAll('.qc').forEach(b=>b.onclick=()=>{x.qty=Number(b.dataset.n);x.lastVerified=Date.now();localStorage.setItem(STORAGE_KEY,JSON.stringify(data));modal.close();render()});
}
function go(v){currentView=v;render()}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>go(b.dataset.view));
document.getElementById('quickCheckBtn').onclick=quickCheck;
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
render();

const modal=document.getElementById('modal');
modal.addEventListener('click',e=>{
  const rect=modal.getBoundingClientRect();
  const inside=e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
  if(!inside) modal.close();
});


const DB_KEY='homeStockRootFixV04';

const seed={
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

let state=load();
let currentView='home';
let currentFilter='All';

const tr={
 zh:{navHome:'首页',navInventory:'库存',navAdd:'新增',navBuy:'想买',navSettings:'设置',family:'家庭库存',all:'全部库存',low:'快用完',check:'待确认',locations:'储存位置',thinking:'想买东西？',checkFirst:'先看看家里是否已经有库存或类似物品。',buyCheck:'购买前检查',inventory:'全部库存',search:'搜索商品、品牌或用途',add:'新增库存',upload:'上传购物截图',manual:'手动添加',buy:'购买前检查',buyPlaceholder:'例如：洗衣液、身体乳、厨房纸',analyze:'检查家中库存',settings:'设置',language:'语言',appearance:'外观',theme:'主题',backup:'数据备份',export:'导出 JSON 备份',import:'导入 JSON 备份',manageLocations:'储存位置管理',addLocation:'新增位置'},
 en:{navHome:'Home',navInventory:'Inventory',navAdd:'Add',navBuy:'Buy',navSettings:'Settings',family:'Home inventory',all:'All inventory',low:'Low stock',check:'Need check',locations:'Locations',thinking:'Thinking of buying something?',checkFirst:'Check whether you already have the same or a similar item at home.',buyCheck:'Check before buying',inventory:'Inventory',search:'Search items, brands or uses',add:'Add inventory',upload:'Upload shopping screenshot',manual:'Add manually',buy:'Check before buying',buyPlaceholder:'e.g. laundry detergent, body lotion',analyze:'Check home stock',settings:'Settings',language:'Language',appearance:'Appearance',theme:'Theme',backup:'Backup',export:'Export JSON backup',import:'Import JSON backup',manageLocations:'Storage locations',addLocation:'Add location'}
};

function load(){
 try{
   const v=JSON.parse(localStorage.getItem(DB_KEY));
   return v&&v.items?v:structuredClone(seed);
 }catch{return structuredClone(seed)}
}
function persist(){
 localStorage.setItem(DB_KEY,JSON.stringify(state));
 render();
}
function t(k){return (tr[state.settings.language]||tr.zh)[k]||k}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function days(ts){return Math.max(0,Math.floor((Date.now()-ts)/86400000))}
function isLow(x){return x.qty<=x.min}
function needsCheck(x){return days(x.lastVerified)>=14}
function icon(category){return ({'Paper Products':'🧻','Laundry':'🧺','Baby':'🍼','Personal Care':'🧴','Food':'🥫','Drinks':'🥤','Cleaning':'🧽','Skincare':'✨','Pet':'🐾','Medicine':'💊','Household':'🏠'})[category]||'📦'}

function applyTheme(){
 let mode=state.settings.mode;
 if(mode==='system') mode=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
 document.documentElement.dataset.mode=mode;
 document.documentElement.dataset.theme=state.settings.theme;
}

function inventoryCard(x){
 return `<article class="card inventory-card" data-item-id="${x.id}">
   <div class="inventory-main">
     <div class="item-thumb">${icon(x.category)}</div>
     <div class="item-copy">
       <div class="item-name">${esc(x.name)}</div>
       <div class="item-meta">${esc(x.category)} · ${esc(Object.keys(x.locations).join(', ')||'—')}</div>
       <div class="item-meta">${days(x.lastVerified)}d since verified</div>
     </div>
   </div>
   <div class="inventory-actions">
     <button class="qty-button dec" type="button" aria-label="Decrease">−</button>
     <div class="qty-value">${x.qty} <span class="small">${esc(x.unit)}</span></div>
     <button class="qty-button inc" type="button" aria-label="Increase">＋</button>
   </div>
 </article>`;
}

function homeView(){
 const low=state.items.filter(isLow).length;
 const stale=state.items.filter(needsCheck).length;
 return `<div class="grid">
   <section class="card stat"><div class="stat-label">${t('all')}</div><div class="stat-number">${state.items.length}</div><div class="stat-note">${state.settings.language==='zh'?'类物品':'items'}</div></section>
   <section class="card stat"><div class="stat-label">${t('low')}</div><div class="stat-number">${low}</div></section>
   <section class="card stat"><div class="stat-label">${t('check')}</div><div class="stat-number">${stale}</div></section>
   <section class="card stat"><div class="stat-label">${t('locations')}</div><div class="stat-number">${state.locations.length}</div></section>
 </div>
 <section class="card hero"><h2>${t('thinking')}</h2><p>${t('checkFirst')}</p><button type="button" onclick="go('buy')">${t('buyCheck')} →</button></section>
 <div class="section-heading"><h2>${t('check')}</h2></div>
 <div class="stack">${state.items.filter(needsCheck).map(inventoryCard).join('')||'<div class="card empty">✓</div>'}</div>
 <div class="section-heading"><h2>${t('low')}</h2></div>
 <div class="stack">${state.items.filter(isLow).map(inventoryCard).join('')||'<div class="card empty">✓</div>'}</div>`;
}

function inventoryView(){
 const cats=['All',...state.categories];
 const visible=state.items.filter(x=>currentFilter==='All'||x.category===currentFilter);
 return `<input id="inventorySearch" class="search-input" placeholder="${t('search')}">
 <div class="chips">${cats.map(c=>`<button type="button" class="chip ${c===currentFilter?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>
 <div class="section-heading"><h2>${t('inventory')}</h2><span class="muted small">${visible.length}</span></div>
 <div id="inventoryList" class="stack">${visible.map(inventoryCard).join('')}</div>`;
}

function addView(){
 return `<div class="stack">
   <button id="uploadShot" type="button" class="card add-option">
     <span class="add-icon">🧾</span><span><div class="add-title">${t('upload')}</div><div class="add-note">Amazon / Costco / Walmart / 淘宝 / 小票</div></span>
   </button>
   <button id="manualAdd" type="button" class="card add-option">
     <span class="add-icon">＋</span><span><div class="add-title">${t('manual')}</div><div class="add-note">名称、数量、单位、位置、最低库存</div></span>
   </button>
 </div>
 <section class="card" style="padding:15px;margin-top:12px"><div class="add-title">截图识别</div><div class="add-note" style="margin-top:7px">当前版本保留上传与批量确认流程，尚未绑定真实 AI Provider。</div></section>`;
}

function buyView(){
 return `<section class="card" style="padding:15px">
   <h2 style="margin:0 0 12px;font-size:19px">${t('buy')}</h2>
   <input id="buyQuery" class="search-input" placeholder="${t('buyPlaceholder')}">
   <button id="buyAnalyze" class="primary" type="button" style="margin-top:10px">${t('analyze')}</button>
   <div id="buyResult" style="margin-top:14px"></div>
 </section>`;
}

function settingsView(){
 return `<div class="stack">
   <section class="card" style="padding:15px">
     <h2 style="margin:0 0 14px;font-size:19px">${t('settings')}</h2>
     <div class="stack">
       <div class="field"><label>${t('language')}</label><select id="langSel"><option value="zh">中文</option><option value="en">English</option></select></div>
       <div class="field"><label>${t('appearance')}</label><select id="modeSel"><option value="system">Follow System</option><option value="light">Light</option><option value="dark">Dark</option></select></div>
       <div class="field"><label>${t('theme')}</label><select id="themeSel"><option value="minimal">Minimal</option><option value="cream">Cream</option><option value="pastel">Pastel</option><option value="morandi">Morandi</option><option value="dopamine">Dopamine</option></select></div>
     </div>
   </section>
   <section class="card" style="padding:15px">
     <h2 style="margin:0 0 10px;font-size:17px">${t('manageLocations')}</h2>
     ${state.locations.map(l=>`<div class="location-row"><span class="grow">${esc(l)}</span><button type="button" class="danger del-loc" data-loc="${esc(l)}">删除</button></div>`).join('')}
     <button id="addLoc" type="button" class="secondary" style="margin-top:12px">${t('addLocation')}</button>
   </section>
   <section class="card" style="padding:15px">
     <h2 style="margin:0 0 10px;font-size:17px">${t('backup')}</h2>
     <div class="row"><button id="exportBtn" type="button" class="secondary grow">${t('export')}</button><button id="importBtn" type="button" class="secondary grow">${t('import')}</button></div>
   </section>
 </div>`;
}

function render(){
 applyTheme();
 document.getElementById('headerEyebrow').textContent=t('family');
 document.querySelectorAll('[data-i18n]').forEach(n=>n.textContent=t(n.dataset.i18n));
 document.querySelectorAll('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));
 const v=document.getElementById('view');
 v.innerHTML=currentView==='home'?homeView():currentView==='inventory'?inventoryView():currentView==='add'?addView():currentView==='buy'?buyView():settingsView();
 bindView();
}

function bindView(){
 document.querySelectorAll('.inc').forEach(b=>b.onclick=()=>adjust(b.closest('[data-item-id]').dataset.itemId,1));
 document.querySelectorAll('.dec').forEach(b=>b.onclick=()=>adjust(b.closest('[data-item-id]').dataset.itemId,-1));
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{currentFilter=b.dataset.filter;render()});
 const search=document.getElementById('inventorySearch');
 if(search)search.oninput=()=>filterInventory(search.value);
 const upload=document.getElementById('uploadShot'); if(upload)upload.onclick=()=>screenshotInput.click();
 const manual=document.getElementById('manualAdd'); if(manual)manual.onclick=openManualAdd;
 const analyze=document.getElementById('buyAnalyze'); if(analyze)analyze.onclick=analyzeBuy;
 const lang=document.getElementById('langSel'); if(lang){lang.value=state.settings.language;lang.onchange=()=>{state.settings.language=lang.value;persist()}}
 const mode=document.getElementById('modeSel'); if(mode){mode.value=state.settings.mode;mode.onchange=()=>{state.settings.mode=mode.value;persist()}}
 const theme=document.getElementById('themeSel'); if(theme){theme.value=state.settings.theme;theme.onchange=()=>{state.settings.theme=theme.value;persist()}}
 const addLoc=document.getElementById('addLoc'); if(addLoc)addLoc.onclick=()=>openPrompt('新增储存位置','例如 Basement · Shelf C',v=>{if(v&&!state.locations.includes(v)){state.locations.push(v);persist()}});
 document.querySelectorAll('.del-loc').forEach(b=>b.onclick=()=>{state.locations=state.locations.filter(x=>x!==b.dataset.loc);persist()});
 const ex=document.getElementById('exportBtn'); if(ex)ex.onclick=exportBackup;
 const im=document.getElementById('importBtn'); if(im)im.onclick=()=>backupInput.click();
}

function adjust(id,delta){
 const x=state.items.find(i=>i.id===id);
 if(!x)return;
 x.qty=Math.max(0,x.qty+delta);
 x.lastVerified=Date.now();
 persist();
}
function filterInventory(q){
 q=q.trim().toLowerCase();
 document.querySelectorAll('#inventoryList [data-item-id]').forEach(el=>{
   const x=state.items.find(i=>i.id===el.dataset.itemId);
   const hay=`${x.name} ${x.brand} ${x.functionGroup}`.toLowerCase();
   el.hidden=!hay.includes(q);
 });
}

const modal=document.getElementById('appModal');
const modalBody=document.getElementById('modalBody');
document.getElementById('modalClose').onclick=()=>modal.close();
modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});

function showModal(html){
 modalBody.innerHTML=html;
 modal.showModal();
}

function openManualAdd(){
 showModal(`<h2 class="modal-title">新增物品</h2>
 <div class="stack">
   <div class="field"><label>名称</label><input id="fName"></div>
   <div class="row"><div class="field grow"><label>数量</label><input id="fQty" type="number" min="0" value="1"></div><div class="field grow"><label>单位</label><input id="fUnit" value="pcs"></div></div>
   <div class="field"><label>分类</label><select id="fCat">${state.categories.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div>
   <div class="field"><label>用途组</label><input id="fGroup" placeholder="例如 laundry-detergent"></div>
   <div class="field"><label>储存位置</label><select id="fLoc">${state.locations.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div>
   <div class="field"><label>最低库存</label><input id="fMin" type="number" min="0" value="0"></div>
   <div class="row"><button id="cancelAdd" type="button" class="secondary grow">取消</button><button id="saveAdd" type="button" class="primary grow">保存</button></div>
 </div>`);
 cancelAdd.onclick=()=>modal.close();
 saveAdd.onclick=()=>{
   const name=fName.value.trim(); if(!name)return;
   const qty=Number(fQty.value)||0;
   state.items.unshift({id:String(Date.now()),name,brand:'',category:fCat.value,functionGroup:fGroup.value.trim()||name.toLowerCase(),qty,unit:fUnit.value.trim()||'pcs',min:Number(fMin.value)||0,locations:{[fLoc.value]:qty},lastVerified:Date.now()});
   localStorage.setItem(DB_KEY,JSON.stringify(state));
   modal.close(); go('inventory');
 };
}

function openPrompt(title,placeholder,cb){
 showModal(`<h2 class="modal-title">${esc(title)}</h2><input id="promptInput" class="search-input" placeholder="${esc(placeholder)}"><div class="row" style="margin-top:12px"><button id="promptCancel" type="button" class="secondary grow">取消</button><button id="promptSave" type="button" class="primary grow">保存</button></div>`);
 promptCancel.onclick=()=>modal.close();
 promptSave.onclick=()=>{const v=promptInput.value.trim();modal.close();cb(v)};
}

function quickCheck(){
 const x=state.items.find(needsCheck);
 if(!x){showModal(`<h2 class="modal-title">快速盘点</h2><div class="empty">目前没有需要重新确认的物品。</div>`);return}
 showModal(`<h2 class="modal-title">快速盘点</h2>
   <section class="card" style="padding:13px"><div class="item-name">${esc(x.name)}</div><div class="item-meta">系统记录：${x.qty} ${esc(x.unit)}</div></section>
   <p>实际还有多少？</p>
   <div class="choice-grid">${[0,1,2,3,4,5].map(n=>`<button type="button" class="choice-button qc" data-n="${n}">${n===5?'5+':n}</button>`).join('')}</div>`);
 document.querySelectorAll('.qc').forEach(b=>b.onclick=()=>{x.qty=Number(b.dataset.n);x.lastVerified=Date.now();localStorage.setItem(DB_KEY,JSON.stringify(state));modal.close();render()});
}

screenshotInput.onchange=e=>{
 const f=e.target.files[0]; if(!f)return;
 showModal(`<h2 class="modal-title">购物截图已载入</h2>
   <p class="muted small">当前版本尚未连接真实 AI Provider。这里保留最终的“识别 → 确认 → 入库”入口。</p>
   <section class="card" style="padding:13px"><strong>${esc(f.name)}</strong><div class="item-meta">${Math.round(f.size/1024)} KB</div></section>
   <div class="row" style="margin-top:12px"><button id="shotCancel" type="button" class="secondary grow">关闭</button><button id="shotDemo" type="button" class="primary grow">查看示例识别</button></div>`);
 shotCancel.onclick=()=>modal.close();
 shotDemo.onclick=openDemoDetected;
 screenshotInput.value='';
};

function openDemoDetected(){
 showModal(`<h2 class="modal-title">识别到 3 件商品</h2>
   ${['Kirkland Paper Towels · 12 rolls','Finish Dishwasher Tabs · 115 tabs','Bananas · 6'].map((x,i)=>`<label class="card row" style="padding:12px"><input type="checkbox" ${i<2?'checked':''}><span class="grow">${x}</span></label>`).join('')}
   <div class="row" style="margin-top:12px"><button id="demoCancel" type="button" class="secondary grow">取消</button><button id="demoDone" type="button" class="primary grow">确认入库（示例）</button></div>`);
 demoCancel.onclick=()=>modal.close();
 demoDone.onclick=()=>modal.close();
}

const map=[
 [['厨房纸','paper towel','paper towels','bounty'],'paper-towel'],
 [['洗衣液','laundry detergent','persil','tide'],'laundry-detergent'],
 [['湿巾','baby wipes','wipes'],'baby-wipes'],
 [['身体乳','body lotion','body moisturizer','moisturizer','cerave','lipikar'],'body-moisturizer']
];
function analyzeBuy(){
 const q=buyQuery.value.trim(); if(!q)return;
 const lq=q.toLowerCase();
 let group=null;
 for(const [keys,g] of map) if(keys.some(k=>lq.includes(k))) group=g;
 const exact=state.items.filter(x=>x.name.toLowerCase().includes(lq)||lq.includes(x.name.toLowerCase()));
 const similar=state.items.filter(x=>group&&x.functionGroup===group&&!exact.includes(x));
 const all=[...exact,...similar];
 let cls='green',title='🟢 建议购买',reason='没有找到相同或相似库存。';
 if(all.length){
   const total=all.reduce((s,x)=>s+x.qty,0), min=all.reduce((s,x)=>s+x.min,0);
   if(exact.length&&total>Math.max(min*2,2)){cls='red';title='🔴 不建议购买';reason='家里已有同款，而且库存较充足。'}
   else if(total<=Math.max(min,1)){cls='yellow';title='🟡 可以购买';reason='已有少量库存，但接近最低库存。'}
   else{cls='orange';title='🟠 建议暂缓';reason='家里已有同用途商品。'}
 }
 buyResult.innerHTML=`<div class="status ${cls}"><strong>${title}</strong><div style="margin-top:5px">${reason}</div></div>`+
   (all.length?`<div class="section-heading"><h2>家中已有</h2></div><div class="stack">${all.map(inventoryCard).join('')}</div>`:'');
 bindView();
}

function exportBackup(){
 const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
 const a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='home-stock-backup-v04.json';a.click();
 URL.revokeObjectURL(a.href);
}
backupInput.onchange=async e=>{
 const f=e.target.files[0]; if(!f)return;
 try{
   const obj=JSON.parse(await f.text());
   if(!obj.items||!obj.settings)throw new Error();
   state=obj;persist();
 }catch{showModal(`<h2 class="modal-title">导入失败</h2><div class="status red">备份文件格式无效。</div>`)}
 backupInput.value='';
};

function go(v){currentView=v;render()}
document.querySelectorAll('.nav-button').forEach(b=>b.onclick=()=>go(b.dataset.view));
document.getElementById('quickCheckBtn').onclick=quickCheck;

if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
render();

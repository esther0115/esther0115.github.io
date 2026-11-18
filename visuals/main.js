import {createMachine} from './machine.js?v=1118h';
import {createClock} from './clock.js?v=1118h';
import {setupGarden} from './garden.js?v=1118h';
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],reduce=matchMedia('(prefers-reduced-motion: reduce)');
const records=[
 {title:'Seoul Deck',date:'2026.06 – 2026.10',href:'#seoul',summary:'把收藏的首尔攻略，变成有口碑依据、能随时调整的一天。独立完成需求分析、产品设计、规则与评测。',facts:[['226 篇','小红书帖子'],['5,817 条','评论构成需求与口碑依据']],color:'#efb7ca'},
 {title:'经营数据 Agent',date:'2026.08 – 2026.10',href:'#agent',summary:'中文问数、查口径、生成图表与报表。将分析引擎与业务配置分离，完成第二业务域的迁移验证。',facts:[['78% → 92%','开发集综合通过率，5 轮迭代'],['92%','冻结验收集通过率']],color:'#a9c4e8'},
 {title:'售前咨询工作流',date:'2026.10 – 2026.11',href:'#presale',summary:'用飞书与 Dify，把提问分析、引用校验、人工审核、资料改进任务与升版复测串起来。',facts:[['372 条','真实商品买家提问'],['23 项','代码节点单测通过']],color:'#b7d9b5'},
 {title:'Amazon 新品上新',date:'2026.09 – 2026.10',href:'#amazon-case',summary:'从子类目筛选、低星评论编码到关键词投放与现金流模型，为美国站免热卷发器制定上新方案。',facts:[['21 个','筛选的美妆个护子类目'],['400 条','低星评论编码']],color:'#f2d367'},
 {title:'缺货损失还原',date:'2026.07 – 2026.08',href:'#stockout-case',summary:'还原销量里看不到的缺货需求，比较补货优先级，并设计门店级 A/B 实验。独立完成的分析项目。',facts:[['7,200 万条','小时数据'],['34.3% vs 31.4%','两种排序的后续损失覆盖率']],color:'#c4b6e1'}
];

const dialog=$('#prize-dialog');let selected=0,busy=false,clawView=null;
function openPrize(){
 const r=records[selected];$('#prize-title').textContent=r.title;$('#prize-date').textContent=r.date;$('#prize-summary').textContent=r.summary;
 const dl=$('#prize-facts');dl.replaceChildren();for(const [value,label] of r.facts){const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=value;dd.textContent=label;group.append(dt,dd);dl.append(group)}
 $('#prize-open').href=r.href;$('.prize-flower').style.color=r.color;dialog.showModal();
}
function closePrize(){dialog.close();$('#claw-grab').focus({preventScroll:true});}
$('.prize-close').onclick=closePrize;$('#prize-again').onclick=()=>{closePrize();choose((selected+1)%records.length)};
dialog.addEventListener('click',e=>{if(e.target===dialog)closePrize()});
$('#prize-open').onclick=()=>{dialog.close();const dest=$(records[selected].href);if(dest?.tagName==='DETAILS')dest.open=true;requestAnimationFrame(()=>dest?.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'start'}));};
function choose(i){if(busy)return;selected=(i+records.length)%records.length;$('#picker-project').textContent=records[selected].title;$('#picker-date').textContent=records[selected].date;$('#picker-subject').textContent=['从收藏攻略，到有口碑依据的一天。','先查口径，再解释数字为什么变化。','每一个答复，都要对得上商品原文。','从低星评论，到选品与现金流判断。','没有卖出去的需求，也需要被看见。'][selected];all('[data-prize]').forEach((b,n)=>b.setAttribute('aria-pressed',n===selected));$('#prize-label').textContent=String(selected+1).padStart(2,'0')+' / '+records[selected].title;$('#machine-status').textContent='已选中「'+records[selected].title+'」，按下按钮抓取。';clawView?.select(selected)}
all('[data-prize]').forEach((b,i)=>b.dataset.contentId=records[i].href.slice(1));
all('[data-prize]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.prize)));$('#claw-left').onclick=()=>choose(selected-1);$('#claw-right').onclick=()=>choose(selected+1);
function setBusy(value){busy=value;$('#claw-stage').setAttribute('aria-busy',String(value));all('.machine-controls button,[data-prize]').forEach(b=>b.disabled=value);$('#claw-grab').textContent=value?'正在抓取…':'抓住它 ↓'}
let assisted=true;
function performGrab(){if(busy)return;if(reduce.matches){openPrize();return;}if(!clawView)mountMachine($('#claw-stage'));if(!clawView){openPrize();return;}setBusy(true);$('#machine-status').textContent='抓手下降，正在带回「'+records[selected].title+'」…';clawView.grab(selected,(i,success)=>{setBusy(false);if(success){choose(i);$('#machine-status').textContent='玩偶已落稳，项目标签已加入收藏。';renderCollection()}else $('#machine-status').textContent='未抓取新玩偶；可调整位置重试、切换帮我抓，或阅读已有收藏。'},assisted)};
$('#claw-grab').onclick=performGrab;
$('#claw-stage').onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Enter'].includes(e.key)){e.preventDefault();if(e.key===' '||e.key==='Enter')$('#claw-grab').click();else if(assisted)choose(selected+(e.key==='ArrowLeft'?-1:1));else clawView?.move(e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0)}};

function mountMachine(el){if(clawView)return;try{clawView=createMachine(el,{onStatus:text=>$('#machine-status').textContent=text,onSelect:i=>choose(i)});clawView.select(selected)}catch(error){console.error('Portfolio machine failed',error);$('.machine-fallback').hidden=false}}

const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);try{if(entry.target.id==='claw-stage'){mountMachine(entry.target)}else setupGarden(createClock(entry.target),entry.target)}catch(error){console.error('Portfolio scene failed',error);if(entry.target.id==='claw-stage')$('.machine-fallback').hidden=false}}},{rootMargin:'180px'});
observer.observe($('#claw-stage'));observer.observe($('#bloom-clock'));

$('#claw-stage').onkeyup=()=>clawView?.move(0,0);$('#claw-stage').onblur=()=>clawView?.move(0,0);
const controls=document.createElement('div');controls.className='manual-controls';controls.innerHTML='<button data-mode="manual" aria-pressed="false">自己抓</button><button data-mode="auto" aria-pressed="true">帮我抓</button><button data-dx="-1" data-dz="0" aria-label="向左移动">←</button><button data-dx="0" data-dz="-1" aria-label="向后移动">↑</button><button data-dx="0" data-dz="1" aria-label="向前移动">↓</button><button data-dx="1" data-dz="0" aria-label="向右移动">→</button><button data-read>直接阅读</button><button data-reset>重置收藏</button>';
$('.machine-controls').before(controls);const collection=document.createElement('div');collection.className='collection-results';collection.setAttribute('aria-live','polite');$('.machine-controls').after(collection);
controls.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(busy)return;assisted=b.dataset.mode==='auto';controls.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#machine-status').textContent=assisted?'帮我抓：先选择项目，滑车会连续移动到目标。':'自己抓：按住方向控制 X 与纵深，松开减速；对位后按抓取。';$('#claw-stage').focus({preventScroll:true})});
controls.querySelectorAll('[data-dx]').forEach(b=>{b.onpointerdown=e=>{if(busy)return;if(!clawView)mountMachine($('#claw-stage'));assisted=false;controls.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.mode==='manual'));b.setPointerCapture(e.pointerId);clawView?.move(+b.dataset.dx,+b.dataset.dz)};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>clawView?.move(0,0);b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();clawView?.move(+b.dataset.dx,+b.dataset.dz)}};b.onkeyup=()=>clawView?.move(0,0)});
controls.querySelector('[data-read]').onclick=openPrize;controls.querySelector('[data-reset]').onclick=()=>{clawView?.resetCollection();renderCollection();$('#machine-status').textContent='已明确重置收藏，五只玩偶回到柜内。'};
function renderCollection(){const ids=clawView?.collected||JSON.parse(sessionStorage.getItem('portfolio-collected')||'[]');collection.replaceChildren();const h=document.createElement('strong');h.textContent='本次收藏 · '+ids.length+' / 5';collection.append(h);ids.forEach(i=>{const row=document.createElement('div');row.className='collection-item';const span=document.createElement('span');span.textContent=records[i].title+' · '+records[i].date;const b=document.createElement('button');b.textContent='阅读项目';b.onclick=()=>{choose(i);openPrize()};row.append(span,b);collection.append(row)})}renderCollection();

import {createMachine} from './machine.js?v=1118e';
import {createClock} from './clock.js?v=1118e';
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
all('[data-prize]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.prize)));$('#claw-left').onclick=()=>choose(selected-1);$('#claw-right').onclick=()=>choose(selected+1);
function setBusy(value){busy=value;$('#claw-stage').setAttribute('aria-busy',String(value));all('.machine-controls button,[data-prize]').forEach(b=>b.disabled=value);$('#claw-grab').textContent=value?'正在抓取…':'抓住它 ↓'}
$('#claw-grab').onclick=()=>{if(busy)return;if(reduce.matches){openPrize();return;}if(!clawView)mountMachine($('#claw-stage'));if(!clawView){openPrize();return;}setBusy(true);$('#machine-status').textContent='抓手下降，正在带回「'+records[selected].title+'」…';clawView.grab(selected,()=>{setBusy(false);$('#machine-status').textContent='抓到了！'+records[selected].title;openPrize()})};
$('#claw-stage').onkeydown=e=>{if(['ArrowLeft','ArrowRight',' ','Enter'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')choose(selected-1);else if(e.key==='ArrowRight')choose(selected+1);else $('#claw-grab').click()}};

function mountMachine(el){if(clawView)return;try{clawView=createMachine(el,{onStatus:text=>$('#machine-status').textContent=text});clawView.select(selected)}catch(error){console.error('Portfolio machine failed',error);$('.machine-fallback').hidden=false}}

const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);try{if(entry.target.id==='claw-stage'){mountMachine(entry.target)}else createClock(entry.target)}catch(error){console.error('Portfolio scene failed',error);if(entry.target.id==='claw-stage')$('.machine-fallback').hidden=false}}},{rootMargin:'180px'});
observer.observe($('#claw-stage'));observer.observe($('#bloom-clock'));

$('#claw-stage').onclick=()=>$('#claw-grab').click();

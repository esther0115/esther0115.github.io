(()=>{
  const $=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)], pressed=(s)=>all(s).findIndex(b=>b.getAttribute('aria-pressed')==='true');
  const frame=$('#live-phone'), station=$('.device-station'),focus=$('.phone-focus');
  function toggleFocus(on){
    if(on){if(!station.matches(':popover-open'))station.showPopover();focus.focus()}
    else if(station.matches(':popover-open'))station.hidePopover();
  }
  function syncFocus(on){document.documentElement.classList.toggle('phone-open',on);focus.textContent=on?'收起手机 ↙':'放大操作 ⤢';focus.setAttribute('aria-expanded',on);if(!on)focus.focus({preventScroll:true})}
  // Use the browser's top layer: expanding never reparents or reloads the app.
  if('showPopover' in station){
    focus.onclick=()=>{if(station.hasAttribute('popover'))toggleFocus(false);else {station.setAttribute('popover','manual');toggleFocus(true)}};
    station.addEventListener('toggle',e=>{const on=e.newState==='open';if(!on)station.removeAttribute('popover');syncFocus(on)});
  }else{focus.onclick=()=>{const on=station.classList.toggle('focus-fallback');syncFocus(on)}}
  function escapePhone(){if(!document.documentElement.classList.contains('phone-open'))return;focus.click()}
  document.addEventListener('keydown',e=>{if(e.key==='Escape')escapePhone()});
  const ticket=$('#ticket-result'), ticketButtons=all('#departure button');
  let liveState=null, requested=null;
  function send(state){frame.contentWindow.postMessage({kind:'seoul-depart',state},'*')}
  function showTicket(state,line){ticket.textContent=line;ticketButtons.forEach(b=>b.setAttribute('aria-pressed',state===b.dataset.trip))}
  function drawTicket(){
    if(frame.hidden){const b=$('#stchips [aria-pressed=true]'),stat=$('#phbody .ph-stat');showTicket(b?.dataset.s,stat?'案例回放 · '+stat.textContent:'案例回放 · 可点车票换路线');}
    else if(liveState)showTicket(liveState.state,liveState.state+' · '+liveState.stops+' 站　首站：'+liveState.first);
  }
  window.addEventListener('message',e=>{
    if(e.source!==frame.contentWindow || !e.data)return;
    if(e.data.kind==='close-seoul-focus'){escapePhone();return}
    if(e.data.kind!=='seoul-ticket'||typeof e.data.first!=='string'||!Number.isInteger(e.data.stops))return;
    liveState=e.data;
    if(requested){const next=requested;requested=null;send(next);if(next!==liveState.state)return}
    drawTicket();
  });
  frame.addEventListener('load',()=>send(requested));
  ticketButtons.forEach(b=>b.onclick=()=>{
    if(frame.hidden){$('#phtabs [data-t=route]').click();all('#stchips button').find(k=>k.dataset.s===b.dataset.trip)?.click();drawTicket()}
    else{if(!liveState)requested=b.dataset.trip;send(b.dataset.trip)}
  });
  $('#seoul').addEventListener('click',()=>queueMicrotask(drawTicket));
  send(null);
  const samples=[
    ['鞋款 · 鞋底','商品详情页：GCR轻质止滑科技，抓地抗磨损。'],
    ['鞋款 · 尺码与季节','尺码表：42 码 / 265 毫米。详情页没有适用季节和温度。'],
    ['鞋款 · 适用季节','详情页未注明适用季节和温度。'],
    ['羽绒服 · 尺码','尺码表按公斤填写。买家提供的是斤。']
  ];
  const card=$('.spec-card'),tray=$('.sample-tray');
  function sample(){let n=Number($('#review').dataset.case);card.setAttribute('aria-expanded','false');$('.spec-heading b').textContent=samples[n][0];$('.spec-back strong').textContent=samples[n][1];card.dataset.item=n;$('.imprint').textContent='待审核';tray.classList.remove('sealed')}
  card.onclick=()=>card.setAttribute('aria-expanded',card.getAttribute('aria-expanded')!=='true');
  $('#saleqs').addEventListener('click',sample);sample();
  $('#review').addEventListener('click',e=>{if(!e.target.closest('button'))return;tray.classList.remove('sealed');void tray.offsetWidth;tray.classList.add('sealed');$('.imprint').textContent=$('#saleres .st').textContent});
  const folder=$('.archive-box');
  function file(){const n=pressed('#jobs button');folder.dataset.n=n;$('#file-id').textContent='卷　0'+(n+1)+' / 04';const pane=$('#pane');pane.classList.remove('pulled');void pane.offsetWidth;pane.classList.add('pulled')}
  $('#jobs').addEventListener('click',file);file();
})();

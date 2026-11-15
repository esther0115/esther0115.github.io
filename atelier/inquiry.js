(() => {
  const questions = document.querySelector('#qs');
  const surface = document.querySelector('#ledger-view');
  const grouping = document.querySelector('#metric-lab');
  let scenario = -1;
  let month = 1;
  let chosenYear = null;
  let chosenField = null;
  const chips = (items, selected, name) => items.map((label, i) =>
    '<button type="button" data-action="'+name+'" data-index="'+i+'" aria-pressed="'+(selected===i)+'">'+label+'</button>'
  ).join('');
  function render(){
    const index = [...questions.children].findIndex(b=>b.getAttribute('aria-pressed')==='true');
    if(index!==scenario){month=1;chosenYear=null;chosenField=null;scenario=index}
    document.querySelector('#folio').textContent=['成交额','复购率','数据范围','字段核验'][index];
    document.querySelector('#ans').dataset.label=['全样本成交额环比','全样本复购率','项目回答','项目回答'][index];
    const merged=grouping.querySelector('[data-id="person"]').getAttribute('aria-pressed')==='true';
    const note=(content)=>'<p class="readout" aria-live="polite">'+content+'</p>';
    if(index===0){
      surface.innerHTML='<h4>从 10 月到 11 月，增长从哪里来？</h4><div class="comparison">'+chips(['10 月 · 660,180','11 月 · 1,003,862'],month,'month')+'</div>'+note(month?'比 10 月多 343,682。增长率用这笔差额除以 10 月成交额。':'660,180 是比较基期，也是计算增长率时的分母。');
    }else if(index===1){
      surface.innerHTML='<h4>同一个人，下了两次单。</h4><div class="receipt-pair '+(merged?'joined':'apart')+'"><div><small>订单 A</small><b>下单编号 01</b></div><div><small>订单 B</small><b>下单编号 02</b></div></div>'+note(merged?'这个示例里，两张订单归到一位顾客名下，可以识别复购。':'这个示例里，两个下单编号各出现一次。同一人的复购消失了。');
    }else if(index===2){
      surface.innerHTML='<h4>“上个月”落在数据范围里吗？</h4><div class="choice-row">'+chips(['2017 年 11 月','2018 年 10 月'],chosenYear,'range')+'</div>'+note(chosenYear===null?'试选一个月份，检查它是否落在订单覆盖范围内。':chosenYear===0?'在范围内。明确月份之后，还需要确认要看成交额、订单量还是其他指标。':'已超出范围。最后一笔有效订单是 2018 年 9 月 3 日，不能推算后续表现。');
    }else{
      surface.innerHTML='<h4>毛利 = 销售额 − 成本</h4><div class="choice-row">'+chips(['核查销售额','核查成本'],chosenField,'field')+'</div>'+note(chosenField===null?'点开公式中的一项，查它的数据来源。':chosenField===0?'订单可以汇总销售额。但销售额本身不能当作毛利。':'订单没有成本字段。缺少减数，这次查询必须停下。');
    }
  }
  surface.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');if(!button)return;
    const action=button.dataset.action,index=Number(button.dataset.index);
    if(action==='month')month=index;
    if(action==='range')chosenYear=index;
    if(action==='field')chosenField=index;
    render();surface.querySelector('button[aria-pressed="true"]')?.focus({preventScroll:true});
  });
  questions.addEventListener('click',render);grouping.addEventListener('click',render);
  render();
})();

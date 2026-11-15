const livePhone = document.querySelector('#live-phone');
const recordedPhone = document.querySelector('#recorded-phone');
const liveButton = document.querySelector('#mode-live');
const recordedButton = document.querySelector('#mode-record');
function setPhoneMode(live) {
  livePhone.hidden = !live;
  recordedPhone.hidden = live;
  liveButton.setAttribute('aria-pressed', live);
  recordedButton.setAttribute('aria-pressed', !live);
  document.querySelector('#seoul .how').textContent = live
    ? '点地图上的站号查看口碑。在手机顶部选「行程」可以规划天数，选「路线」可以切换当天状态。'
    : '这里可以回放三条改计划测试。试试提前去一家还没开门的店，再看看程序怎样处理。';
}
liveButton.onclick = () => setPhoneMode(true);
recordedButton.onclick = () => setPhoneMode(false);
const metric = document.querySelector('#metric-lab');
metric.addEventListener('click', event => {
  const pick = event.target.closest('[data-id]');
  if (!pick) return;
  const person = pick.dataset.id === 'person';
  metric.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', button === pick));
  document.querySelector('#ans .big-a').textContent = person ? '2.83%' : '0%';
  document.querySelector('#ans .small-a').textContent = person
    ? '按 customer_unique_id 合并同一人的多次下单，可以识别复购。'
    : '按 customer_id 分组，每次下单得到独立编号，同一个人会被算成不同顾客。';
});
const copyButton = document.querySelector('#copy-mail');
copyButton.onclick = async () => {
  const email = document.querySelector('.email').href.slice(7);
  try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = '已复制';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('.email'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyButton.textContent = '已选中，请复制';
  }
};

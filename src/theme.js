(() => {
  const key='stm32-signal-lab-theme',system=matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try{preference=localStorage.getItem(key);}catch{/* Theme still works when storage is unavailable. */}
  if(!['light','dark'].includes(preference))preference=null;
  function apply(){
    const dark=(preference||(system.matches?'dark':'light'))==='dark';
    document.documentElement.dataset.theme=dark?'dark':'light';
    document.querySelector('meta[name="theme-color"]').content=dark?'#111a16':'#164b40';
    document.querySelector('#theme-toggle')?.setAttribute('aria-pressed',String(dark));
  }
  apply();
  system.addEventListener('change',apply);
  document.addEventListener('DOMContentLoaded',()=>{
    apply();
    document.querySelector('#theme-toggle').addEventListener('click',()=>{
      preference=document.documentElement.dataset.theme==='dark'?'light':'dark';
      try{localStorage.setItem(key,preference);}catch{/* Keep the selection for this page. */}
      apply();
    });
  });
})();

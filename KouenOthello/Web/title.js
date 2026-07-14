(function(){
  var lang=localStorage.getItem('hakoniwa-language')||(navigator.language.indexOf('ja')===0?'ja':'en');
  var T={ja:{title:'公園オセロ',sub:'夕暮れの公園'},en:{title:'Park Othello',sub:'Park at sunset'}}[lang]||{title:'公園オセロ',sub:'夕暮れの公園'};
  var s=document.getElementById('splash');
  if(!s)return;
  s.querySelector('h1').textContent=T.title;
  s.querySelector('small').textContent=T.sub;
  var done=false;
  function close(){if(done)return;done=true;s.classList.add('hide');setTimeout(function(){s.remove();},750);}
  var timer=setTimeout(close,2600);
  s.addEventListener('click',function(){clearTimeout(timer);close();});
})();

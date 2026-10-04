/* KAVITY homepage scripts: range picker, rotating words, process line, use cards, projects rail, network map */
(function(){
  var img=document.getElementById('rngImg'), name=document.getElementById('rngName');
  if(!img) return;
  var frame=img.parentElement, lang=document.documentElement.lang;
  function show(btn){
    document.querySelectorAll('.rng-item').forEach(function(b){b.classList.remove('on')});
    btn.classList.add('on');
    frame.classList.add('swap');
    setTimeout(function(){
      img.src=btn.dataset.img;
      var L=document.getElementById('rngLink');
      if(L&&btn.dataset.slug) L.href='product/'+btn.dataset.slug+'.html';
      name.innerHTML=btn.querySelector('span').innerHTML;
      frame.classList.remove('swap');
    },180);
  }
  document.querySelectorAll('.rng-item').forEach(function(b){
    b.addEventListener('mouseenter',function(){show(b)});
    b.addEventListener('click',function(){show(b)});
    b.addEventListener('focus',function(){show(b)});
  });
})();


(function(){
  var items=document.querySelectorAll('.rot span'); if(items.length<2) return;
  var k=0;
  setInterval(function(){
    items[k].classList.remove('on');
    k=(k+1)%items.length;
    items[k].classList.add('on');
  },4200);
})();


(function(){
  var t=document.querySelector('.proc-track'); if(!t) return;
  if(!('IntersectionObserver' in window)){t.classList.add('in');return}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.3});
  io.observe(t);
})();

(function(){
  var u=document.querySelectorAll('.use'); if(!u.length) return;
  if(!('IntersectionObserver' in window)){u.forEach(function(x){x.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      var el=e.target; io.unobserve(el);
      setTimeout(function(){el.classList.add('in')}, Array.prototype.indexOf.call(u,el)*170);
    });
  },{threshold:.35});
  u.forEach(function(x){io.observe(x)});
})();

(function(){var m=document.querySelector('.kvn-map');if(!m)return;var set=function(k){m.classList.toggle('has-hot',!!k);document.querySelectorAll('.kvn [data-k]').forEach(function(e){e.classList.toggle('hot',!!k&&e.getAttribute('data-k')===k)})};
document.querySelectorAll('.kvn-card,.kvn-pin').forEach(function(e){e.addEventListener('pointerenter',function(){set(e.getAttribute('data-k'))});e.addEventListener('pointerleave',function(){set(null)})});
if('IntersectionObserver' in window){var sv=m.querySelector('svg');new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting)sv.unpauseAnimations&&sv.unpauseAnimations();else sv.pauseAnimations&&sv.pauseAnimations()})}).observe(m)}})();

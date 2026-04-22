// ============================================================
// DON LOOKS — SHARED APP JS
// ============================================================

// ---------- CART ----------
const Cart = {
  get(){ return JSON.parse(localStorage.getItem('dl_cart')||'[]'); },
  save(c){ localStorage.setItem('dl_cart', JSON.stringify(c)); updateCartCount(); },
  add(product, size, color, qty=1){
    const c = this.get();
    const key = `${product.id}-${size}-${color}`;
    const ex = c.find(i=>i.key===key);
    if(ex){ ex.qty+=qty; } else { c.push({key,id:product.id,name:product.name,price:product.price,image:product.image,size,color,qty}); }
    this.save(c);
    showToast('✓ Added to bag — '+product.name);
  },
  remove(key){ this.save(this.get().filter(i=>i.key!==key)); },
  update(key,qty){ const c=this.get(); const i=c.find(x=>x.key===key); if(i){i.qty=qty;} this.save(c); },
  total(){ return this.get().reduce((s,i)=>s+(i.price*i.qty),0); },
  count(){ return this.get().reduce((s,i)=>s+i.qty,0); },
  clear(){ localStorage.removeItem('dl_cart'); updateCartCount(); }
};

// ---------- WISHLIST ----------
const Wishlist = {
  get(){ return JSON.parse(localStorage.getItem('dl_wish')||'[]'); },
  toggle(id){
    let w=this.get();
    if(w.includes(id)){ w=w.filter(x=>x!==id); showToast('♡ Removed from wishlist'); }
    else { w.push(id); showToast('♥ Added to wishlist'); }
    localStorage.setItem('dl_wish',JSON.stringify(w));
    return w.includes(id);
  },
  has(id){ return this.get().includes(id); }
};

// ---------- UTILS ----------
function fmt(n){ return '₦ '+n.toLocaleString('en-NG'); }

function showToast(msg){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.innerHTML=msg; t.classList.add('show');
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove('show'),3200);
}

function updateCartCount(){
  document.querySelectorAll('.cart-count').forEach(el=>el.textContent=Cart.count()||'0');
}

function stars(r){ return '★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r)); }

// ---------- NAV ----------
function initNav(){
  const nav=document.getElementById('mainNav');
  if(!nav) return;

  // Logo
  document.querySelectorAll('.dl-logo').forEach(img=>img.src=DONLOOKS.logo);

  // Scroll
  window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60));

  // Active link
  const path=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-links a').forEach(a=>{
    if(a.getAttribute('href')===path) a.classList.add('active');
  });

  // Mobile menu
  const toggle=document.getElementById('navToggle');
  const menu=document.getElementById('mobileMenu');
  const close=document.getElementById('mobileClose');
  if(toggle&&menu){
    toggle.addEventListener('click',()=>menu.classList.add('open'));
    close&&close.addEventListener('click',()=>menu.classList.remove('open'));
  }

  updateCartCount();
}

// ---------- CURSOR ----------
function initCursor(){
  if(window.matchMedia('(pointer:coarse)').matches) return;
  const cur=document.getElementById('cursor');
  const ring=document.getElementById('cursorRing');
  if(!cur||!ring) return;
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
  (function loop(){ rx+=(mx-rx)*.12; ry+=(my-ry)*.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); })();
  document.querySelectorAll('a,button,.product-card,.cat-tile').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cur.classList.add('hover');ring.classList.add('hover');});
    el.addEventListener('mouseleave',()=>{cur.classList.remove('hover');ring.classList.remove('hover');});
  });
}

// ---------- REVEAL ----------
function initReveal(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('vis'); });
  },{threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

// ---------- PRODUCT CARD HTML ----------
function productCardHTML(p){
  const badgeClass = p.badge ? `badge-${p.badge.toLowerCase().replace(' ','-')}` : '';
  const imgContent = p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
    : `<span class="product-placeholder">DL</span>`;
  const wishlisted = Wishlist.has(p.id);
  return `
  <div class="product-card" onclick="location.href='product.html?id=${p.id}'">
    <div class="product-img-wrap">
      ${imgContent}
      ${p.badge?`<span class="product-badge-label ${badgeClass}">${p.badge}</span>`:''}
      <button class="product-wish-btn ${wishlisted?'active':''}" onclick="event.stopPropagation();toggleWish(${p.id},this)" title="Add to Wishlist">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="${wishlisted?'currentColor':'none'}" stroke="currentColor" stroke-width="1.3"><path d="M7 12S1 8 1 4a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 8-6 8z"/></svg>
      </button>
      <div class="product-action-bar"><span>View Product</span></div>
    </div>
    <div class="product-cat">${p.category} · ${p.gender}</div>
    <div class="product-name">${p.name}</div>
    <div class="product-price-row">
      <div>
        <span class="product-price">${fmt(p.price)}</span>
        ${p.originalPrice?`<span class="product-original-price">${fmt(p.originalPrice)}</span>`:''}
      </div>
      <span class="product-rating">${stars(p.rating)}</span>
    </div>
  </div>`;
}

function toggleWish(id,btn){
  const on=Wishlist.toggle(id);
  btn.classList.toggle('active',on);
  btn.querySelector('svg').setAttribute('fill',on?'currentColor':'none');
}

// ---------- NAV HTML ----------
function renderNav(activePage=''){
  return `
  <div class="cursor" id="cursor"></div>
  <div class="cursor-ring" id="cursorRing"></div>
  <nav id="mainNav">
    <a href="index.html" class="nav-logo"><img src="" alt="Don Looks" class="dl-logo"></a>
    <ul class="nav-links">
      <li><a href="index.html" ${activePage==='home'?'class="active"':''}>Home</a></li>
      <li><a href="shop.html" ${activePage==='shop'?'class="active"':''}>Shop</a></li>
      <li><a href="shop.html?cat=Women" ${activePage==='women'?'class="active"':''}>Women</a></li>
      <li><a href="shop.html?cat=Men" ${activePage==='men'?'class="active"':''}>Men</a></li>
      <li><a href="account.html" ${activePage==='account'?'class="active"':''}>Account</a></li>
      <li><a href="about.html" ${activePage==='about'?'class="active"':''}>About</a></li>
      <li><a href="contact.html" ${activePage==='contact'?'class="active"':''}>Contact</a></li>
    </ul>
    <div class="nav-actions">
      <button class="nav-icon" onclick="location.href='shop.html'" title="Search">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.3"/><line x1="11.7" y1="11.7" x2="16.5" y2="16.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      </button>
      <button class="nav-icon" onclick="location.href='wishlist.html'" title="Wishlist">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15.5S2 10.5 2 5.5a4 4 0 0 1 7-2.6A4 4 0 0 1 16 5.5c0 5-7 10-7 10z" stroke="currentColor" stroke-width="1.3"/></svg>
      </button>
      <button class="cart-btn-nav" onclick="location.href='cart.html'">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h2l2 7h6l1.5-5H4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="11" cy="12" r="1" fill="currentColor"/></svg>
        Bag <span class="cart-count">0</span>
      </button>
      <button class="nav-mobile-toggle" id="navToggle">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div class="mobile-menu" id="mobileMenu">
    <button class="mobile-close" id="mobileClose">✕</button>
    <a href="index.html" onclick="document.getElementById('mobileMenu').classList.remove('open')">Home</a>
    <a href="shop.html" onclick="document.getElementById('mobileMenu').classList.remove('open')">Shop All</a>
    <a href="shop.html?cat=Women" onclick="document.getElementById('mobileMenu').classList.remove('open')">Women</a>
    <a href="shop.html?cat=Men" onclick="document.getElementById('mobileMenu').classList.remove('open')">Men</a>
    <a href="account.html" onclick="document.getElementById('mobileMenu').classList.remove('open')">Account</a>
    <a href="wishlist.html" onclick="document.getElementById('mobileMenu').classList.remove('open')">Wishlist</a>
    <a href="cart.html" onclick="document.getElementById('mobileMenu').classList.remove('open')">Bag</a>
    <a href="about.html" onclick="document.getElementById('mobileMenu').classList.remove('open')">About</a>
    <a href="contact.html" onclick="document.getElementById('mobileMenu').classList.remove('open')">Contact</a>
  </div>`;
}

// ---------- FOOTER HTML ----------
function renderFooter(){
  return `
  <footer>
    <div class="footer-top">
      <div>
        <img src="" alt="Don Looks" class="footer-brand-logo dl-logo">
        <div class="footer-tagline">Luxury Fashion House · Est. 2021</div>
        <p class="footer-about">We believe luxury is not just a price point — it's a feeling. Don Looks creates fashion that commands respect and radiates elegance.</p>
      </div>
      <div>
        <div class="footer-col-title">Shop</div>
        <ul class="footer-links">
          <li><a href="shop.html">New Arrivals</a></li>
          <li><a href="shop.html?cat=Women">Women's Collection</a></li>
          <li><a href="shop.html?cat=Men">Men's Collection</a></li>
          <li><a href="shop.html?cat=Accessories">Accessories</a></li>
          <li><a href="shop.html?cat=Occasionwear">Occasionwear</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Company</div>
        <ul class="footer-links">
          <li><a href="account.html" ${activePage==='account'?'class="active"':''}>Account</a></li>
      <li><a href="about.html">Our Story</a></li>
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="#">Press</a></li>
          <li><a href="#">Careers</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Support</div>
        <ul class="footer-links">
          <li><a href="#">Shipping & Returns</a></li>
          <li><a href="#">Size Guide</a></li>
          <li><a href="#">Track Order</a></li>
          <li><a href="#">FAQ</a></li>
          <li><a href="#">Privacy Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-copy">© 2026 Don Looks. All Rights Reserved. Lagos, Nigeria.</div>
      <div class="socials">
        <a class="social-btn" href="#">IG</a>
        <a class="social-btn" href="#">FB</a>
        <a class="social-btn" href="#">TK</a>
        <a class="social-btn" href="#">YT</a>
      </div>
    </div>
  </footer>`;
}

// ---------- MARQUEE HTML ----------
function renderMarquee(){
  const items=['Free Delivery on Orders Above ₦150,000','Authentic Luxury Fashion House','New Collection — SS 2026 Now Live','Exclusive Members Benefits','Handcrafted with Precision','DON LOOKS — Wear the Don Look'];
  const html=items.map(i=>`<div class="marquee-item"><div class="marquee-diamond"></div>${i}</div>`).join('');
  return `<div class="marquee-band"><div class="marquee-inner">${html+html}</div></div>`;
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded',()=>{
  initNav();
  initCursor();
  initReveal();
});

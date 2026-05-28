const phoneCatalog = {
  Apple:['iPhone 15','iPhone 15 Plus','iPhone 15 Pro','iPhone 15 Pro Max','iPhone 14','iPhone 14 Plus','iPhone 14 Pro','iPhone 14 Pro Max','iPhone 13','iPhone 13 Pro','iPhone 13 Pro Max','iPhone 12','iPhone 12 Pro','iPhone 11','iPhone XR','iPhone SE'],
  Samsung:['Samsung Galaxy S24','Samsung Galaxy S24 Plus','Samsung Galaxy S24 Ultra','Samsung Galaxy S23','Samsung Galaxy S23 Plus','Samsung Galaxy S23 Ultra','Samsung Galaxy S22','Samsung Galaxy S21','Samsung Galaxy A55','Samsung Galaxy A54','Samsung Galaxy A35','Samsung Galaxy A34','Samsung Galaxy A15','Samsung Galaxy Z Flip','Samsung Galaxy Z Fold'],
  Xiaomi:['Xiaomi 14','Xiaomi 13','Xiaomi 12','Redmi Note 13','Redmi Note 12','Redmi Note 11','Poco X6','Poco X5','Poco F5'],
  Huawei:['Huawei P60','Huawei P50','Huawei P40','Huawei Mate 50','Huawei Mate 40','Huawei Nova 11','Huawei Nova 10'],
  OPPO:['OPPO Find X5','OPPO Find X3','OPPO Reno 10','OPPO Reno 8','OPPO Reno 7','OPPO A98','OPPO A78','OPPO A58'],
  'Autres marques':['Honor','OnePlus','Google Pixel','Motorola','Realme','Vivo','Je ne trouve pas mon modèle']
};

const designCategories = ['Papillon','Vague','Dino','Marbre','Minimaliste','Floral','Cœur','Initiales','Animal','Abstrait','Luxe noir','Ligne blanche','Univers étoilé','Smile','Damier','Citation'];
const designProducts = [
  {name:'Coque Papillon Élégance',cat:'Papillon',price:24.90,badge:'Tendance',pattern:'p-papillon'},
  {name:'Coque Vague Minimal',cat:'Vague',price:24.90,badge:'Nouveau',pattern:'p-vague'},
  {name:'Coque Dino Cute',cat:'Dino',price:24.90,badge:'Nouveau',pattern:'p-dino'},
  {name:'Coque Marbre Noir',cat:'Marbre',price:24.90,badge:'Best-seller',pattern:'p-marbre'},
  {name:'Coque Floral White',cat:'Floral',price:24.90,badge:'Tendance',pattern:'p-floral'},
  {name:'Coque Abstrait Premium',cat:'Abstrait',price:24.90,badge:'Premium',pattern:'p-abstrait'},
  {name:'Coque Cœur Signature',cat:'Cœur',price:24.90,badge:'Cadeau',pattern:'p-coeur'},
  {name:'Coque Damier Luxe',cat:'Damier',price:24.90,badge:'Luxe',pattern:'p-damier'}
];
const faqs = [
 ['Puis-je importer n’importe quelle photo ?','Oui, vous pouvez importer une photo personnelle, une image ou un visuel dont vous possédez les droits.'],
 ['Quels formats d’image sont acceptés ?','Les formats JPG, PNG et WebP sont acceptés pour l’aperçu en ligne.'],
 ['Puis-je recadrer ma photo avant de commander ?','Oui, utilisez les contrôles de zoom et de déplacement pour ajuster l’image sur la coque.'],
 ['Que faire si mon modèle de téléphone n’apparaît pas ?','Sélectionnez “Je ne trouve pas mon modèle” et indiquez votre modèle exact dans la demande personnalisée.'],
 ['Les coques protègent-elles bien le téléphone ?','Oui, vous pouvez choisir une protection Standard, Renforcée ou Premium antichoc.'],
 ['Combien de temps prend la livraison ?','La livraison dépend de votre zone. Une estimation est donnée lors de la validation de commande.'],
 ['Puis-je commander une coque avec un design déjà prêt ?','Oui, les designs prêts à commander sont disponibles dans la section Designs.'],
 ['Est-ce possible d’ajouter du texte sur la coque ?','Oui, vous pouvez ajouter un texte court ou des initiales sur la coque personnalisée.']
];

let cart = JSON.parse(localStorage.getItem('eliteCaseCart') || '[]');
let selectedFinish = 'Mat';
let selectedProtection = 'Standard';
let selectedProtectionPrice = 29.90;
let selectedCategory = 'all';
let uploadedImage = null;

const euro = value => value.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
const $ = selector => document.querySelector(selector);

function populatePhoneSelect(select, includeGroups=true){
  select.innerHTML = '';
  Object.entries(phoneCatalog).forEach(([brand,models])=>{
    const group = document.createElement(includeGroups ? 'optgroup' : 'span');
    if(includeGroups) group.label = brand;
    models.forEach(model=>{
      const option = document.createElement('option');
      option.value = model; option.textContent = model;
      if(includeGroups) group.appendChild(option); else select.appendChild(option);
    });
    if(includeGroups) select.appendChild(group);
  });
}

function populateFilters(){
  const brandFilter = $('#brandFilter');
  Object.keys(phoneCatalog).forEach(brand=>{
    const option=document.createElement('option');option.value=brand;option.textContent=brand;brandFilter.appendChild(option);
  });
  const designFilter = $('#designFilter');
  designCategories.forEach(cat=>{
    const option=document.createElement('option');option.value=cat;option.textContent=cat;designFilter.appendChild(option);
  });
  const strip = $('#categoryStrip');
  strip.innerHTML = '<button class="active" data-cat="all">Tous</button>' + designCategories.map(cat=>`<button data-cat="${cat}">${cat}</button>`).join('');
}

function renderProducts(){
  const designValue = $('#designFilter').value;
  const grid = $('#designProductGrid');
  const products = designProducts.filter(p => (selectedCategory==='all'||p.cat===selectedCategory) && (designValue==='all'||p.cat===designValue));
  grid.innerHTML = products.map((p,i)=>`
    <article class="product-card reveal visible">
      <div class="product-art"><div class="mini-case"><div class="mini-camera"></div><div class="design-pattern ${p.pattern}"></div></div></div>
      <div class="card-body">
        <div class="card-top"><span class="mini-badge">${p.badge}</span><strong>${euro(p.price)}</strong></div>
        <h3>${p.name}</h3>
        <label class="field"><span>Modèle</span><select data-product-model="${i}"></select></label>
        <button class="button button-dark" type="button" data-add-design="${i}">Ajouter au panier</button>
      </div>
    </article>`).join('') || '<p>Aucun design ne correspond à ce filtre.</p>';
  document.querySelectorAll('[data-product-model]').forEach(select=>populatePhoneSelect(select));
  document.querySelectorAll('[data-add-design]').forEach(button=>button.addEventListener('click',()=>{
    const product = products[Number(button.dataset.addDesign)];
    const select = button.closest('.card-body').querySelector('select');
    addToCart({name:product.name,model:select.value,finish:'Design prêt',protection:'Standard',price:product.price,type:product.cat});
  }));
}

function updateImageTransform(){
  const img = $('#uploadedImageLayer img');
  if(!img) return;
  img.style.transform = `translate(${$('#xRange').value}px, ${$('#yRange').value}px) scale(${$('#zoomRange').value})`;
}

function addToCart(item){
  cart.push({...item,id:Date.now()+Math.random()});
  localStorage.setItem('eliteCaseCart',JSON.stringify(cart));
  renderCart();
  showToast('Produit ajouté au panier');
}

function renderCart(){
  $('#cartCount').textContent = cart.length;
  const cartItems = $('#cartItems');
  if(cart.length===0){cartItems.innerHTML='<p>Votre panier est vide.</p>';} else {
    cartItems.innerHTML = cart.map(item=>`<div class="cart-item"><strong>${item.name}</strong><span>${item.model}</span><span>${item.finish} · ${item.protection}</span><strong>${euro(item.price)}</strong><button type="button" data-remove="${item.id}">Retirer</button></div>`).join('');
  }
  $('#cartTotal').textContent = euro(cart.reduce((sum,item)=>sum+item.price,0));
  document.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{cart=cart.filter(i=>String(i.id)!==btn.dataset.remove);localStorage.setItem('eliteCaseCart',JSON.stringify(cart));renderCart();}));
}

function showToast(message){
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2600);
}

function initCustomizer(){
  populatePhoneSelect($('#customPhoneModel'));
  $('#customPhoneModel').addEventListener('change', e => $('#missingModelBox').hidden = e.target.value !== 'Je ne trouve pas mon modèle');
  $('#imageUpload').addEventListener('change', e=>{
    const file=e.target.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{ uploadedImage=reader.result; $('#uploadedImageLayer').innerHTML=`<img alt="Photo importée" src="${uploadedImage}">`; updateImageTransform(); };
    reader.readAsDataURL(file);
  });
  ['#zoomRange','#xRange','#yRange'].forEach(id=>$(id).addEventListener('input',updateImageTransform));
  $('#customText').addEventListener('input', e=>$('#customTextLayer').textContent=e.target.value.trim());
  $('#finishOptions').addEventListener('click',e=>{ if(!e.target.matches('.chip'))return; document.querySelectorAll('#finishOptions .chip').forEach(c=>c.classList.remove('active')); e.target.classList.add('active'); selectedFinish=e.target.dataset.value; });
  $('#protectionOptions').addEventListener('click',e=>{ if(!e.target.matches('.chip'))return; document.querySelectorAll('#protectionOptions .chip').forEach(c=>c.classList.remove('active')); e.target.classList.add('active'); selectedProtection=e.target.dataset.value; selectedProtectionPrice=Number(e.target.dataset.price); });
  $('#previewButton').addEventListener('click',()=>showToast(uploadedImage?'Aperçu mis à jour':'Importez une image pour voir votre aperçu personnalisé'));
  $('#addCustomToCart').addEventListener('click',()=>{
    const model=$('#customPhoneModel').value;
    if(model==='Je ne trouve pas mon modèle' && !$('#missingModelMessage').value.trim()){showToast('Ajoutez votre demande personnalisée');return;}
    addToCart({name:'Coque Photo Personnalisée Premium',model,finish:selectedFinish,protection:selectedProtection,price:selectedProtectionPrice,type:'Personnalisée'});
  });
}

function initFaq(){
  $('#faqList').innerHTML = faqs.map(([q,a])=>`<details class="faq-item"><summary>${q}</summary><p>${a}</p></details>`).join('');
}

function initInteractions(){
  $('.menu-toggle').addEventListener('click',e=>{const nav=$('.main-nav');nav.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',nav.classList.contains('open'));});
  $('[data-open-cart]').addEventListener('click',()=>{$('#cartDrawer').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false');});
  $('[data-close-cart]').addEventListener('click',()=>{$('#cartDrawer').classList.remove('open');$('#cartDrawer').setAttribute('aria-hidden','true');});
  $('#cartDrawer').addEventListener('click',e=>{if(e.target.id==='cartDrawer')$('[data-close-cart]').click();});
  $('[data-open-account]').addEventListener('click',()=>showToast('Espace compte prêt à connecter à votre futur backend'));
  $('#checkoutButton').addEventListener('click',()=>showToast(cart.length?'Tunnel d’achat prêt à connecter à Stripe, PayPal ou Shopify':'Votre panier est vide'));
  $('#contactForm').addEventListener('submit',e=>{e.preventDefault();showToast('Demande enregistrée côté navigateur');e.target.reset();});
  $('#newsletterForm').addEventListener('submit',e=>{e.preventDefault();showToast('Inscription newsletter enregistrée');e.target.reset();});
  $('#designFilter').addEventListener('change',()=>{selectedCategory='all';document.querySelectorAll('#categoryStrip button').forEach(b=>b.classList.toggle('active',b.dataset.cat==='all'));renderProducts();});
  $('#categoryStrip').addEventListener('click',e=>{if(!e.target.matches('button'))return;selectedCategory=e.target.dataset.cat;$('#designFilter').value='all';document.querySelectorAll('#categoryStrip button').forEach(b=>b.classList.remove('active'));e.target.classList.add('active');renderProducts();});
  $('#brandFilter').addEventListener('change',()=>showToast($('#brandFilter').value==='all'?'Toutes les marques affichées':`Filtre marque : ${$('#brandFilter').value}`));
}

function initReveal(){
  const obs = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible')}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

populateFilters();
initCustomizer();
initFaq();
renderProducts();
renderCart();
initInteractions();
initReveal();

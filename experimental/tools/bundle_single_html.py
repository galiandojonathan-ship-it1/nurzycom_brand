#!/usr/bin/env python3
"""Build the experimental site into ONE self-contained HTML file (all pages, data and scripts; fonts still load from Google).
Usage: python3 tools/bundle_single_html.py out.html   (run from experimental/)"""
import re, sys
R = lambda p: open(p, encoding='utf-8').read()
def fixpage(js):
    js = js.replace('location.search', '(window.__SEARCH||location.search)')
    js = re.sub(r'location\.hash\s*=\s*"";\s*location\.reload\(\);', 'window.__go(window.__ROUTE);', js)
    js = js.replace('try { history.replaceState(null, "", "#s" + (cur + 1)); } catch (e) { /* file:// */ }', '')
    js = js.replace('var start = parseInt((location.hash.match(/^#s(\\d+)$/) || [])[1], 10);', 'var start = 0;')
    js = js.replace('if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }', '')
    js = js.replace('location.hash', '(window.__HASH||"")')
    assert 'location.reload' not in js
    return js
def body(p):
    h = R(p); b = re.search(r'<body>(.*)</body>', h, re.S).group(1)
    return re.sub(r'<script[^>]*></script>\s*', '', b), re.search(r'<title>(.*?)</title>', h).group(1), re.search(r'<html lang="(\w+)"', h).group(1)
pages = {'en': 'index.html', 'ru': 'ru/index.html', 'course': 'course/index.html', 'lesson': 'course/lesson.html',
         'slides': 'course/slides.html', 'office': 'course/office.html', 'progress': 'course/progress.html'}
esc = lambda s: s.replace('</script', '<\\/script')
tpl = ''.join('<template id="p-%s" data-title="%s" data-lang="%s">%s</template>\n' % (k, body(v)[1], body(v)[2], body(v)[0]) for k, v in pages.items())
glob = '\n'.join([R('assets/data.js'), R('assets/cadence-data.js'), R('assets/common.js').replace('location.search', '(window.__SEARCH||location.search)')])
srcs = ''.join('<script type="text/plain" id="src-%s">%s</script>\n' % (k, esc(fixpage(R('assets/%s.js' % k)))) for k in ['course', 'lesson', 'slides', 'office', 'progress'])
fonts = re.search(r'(<link rel="preconnect".*?rel="stylesheet">)', R('index.html'), re.S).group(1)
router = r'''(function(){
  var BASE={"/index.html":"en","/ru/index.html":"ru","/course/index.html":"course","/course/lesson.html":"lesson","/course/slides.html":"slides","/course/office.html":"office","/course/progress.html":"progress"};
  var PATH={}; Object.keys(BASE).forEach(function(k){PATH[BASE[k]]=k;});
  var SCRIPT={course:1,lesson:1,slides:1,office:1,progress:1};
  var app=document.getElementById("app"), listeners=[], realAdd=document.addEventListener.bind(document);
  function go(r,scrollTo){
    listeners.forEach(function(l){document.removeEventListener(l[0],l[1],l[2]);}); listeners=[];
    if(window.speechSynthesis) try{window.speechSynthesis.cancel();}catch(e){}
    var parts=r.split(":"), page=parts[0], id=parts[1]||"";
    var t=document.getElementById("p-"+page); if(!t){page="course";t=document.getElementById("p-course");}
    window.__ROUTE=r; window.__SEARCH=id?"?id="+id:""; window.__HASH=scrollTo?"#"+scrollTo:"";
    app.innerHTML=t.innerHTML; document.title=t.getAttribute("data-title"); document.documentElement.lang=t.getAttribute("data-lang");
    if(SCRIPT[page]){ document.addEventListener=function(a,b,c){listeners.push([a,b,c]);realAdd(a,b,c);};
      try{(new Function(document.getElementById("src-"+page).textContent))();}finally{document.addEventListener=realAdd;} }
    try{history.replaceState(null,"","#"+r);}catch(e){}
    var n=scrollTo&&document.getElementById(scrollTo); if(n) n.scrollIntoView(); else window.scrollTo(0,0);
  }
  window.__go=go;
  realAdd("click",function(e){
    var a=e.target.closest&&e.target.closest("a[href]"); if(!a) return;
    var h=a.getAttribute("href"); if(/^(https?:|mailto:|tel:)/.test(h)) return;
    e.preventDefault();
    if(h.charAt(0)==="#"){ var n=document.getElementById(h.slice(1)); if(n){n.scrollIntoView({behavior:"smooth"}); if(h==="#main"){n.setAttribute("tabindex","-1");n.focus();}} else window.scrollTo(0,0); return; }
    var cur=PATH[window.__ROUTE.split(":")[0]]||"/course/index.html";
    var u=new URL(h,"http://x"+cur), page=BASE[u.pathname]||"course", id=(u.searchParams.get("id")||"").toUpperCase();
    go(page+(id?":"+id:""),u.hash.slice(1));
  });
  var start=(location.hash||"").slice(1);
  go(/^(en|ru|course|progress|(lesson|slides|office):[A-Z]\d\d)$/.test(start)?start:"course");
})();'''
out = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
       '<meta name="robots" content="noindex, nofollow">\n<title>NURZYCOM · experimental site</title>\n%s\n<style>\n%s\n</style>\n</head>\n<body>\n'
       '<div id="app"></div>\n%s\n<script>\n%s\n</script>\n%s<script>%s</script>\n</body>\n</html>\n') % (fonts, R('assets/styles.css'), tpl, esc(glob), srcs, router)
open(sys.argv[1], 'w', encoding='utf-8').write(out)
print(len(out) // 1024, 'KB ->', sys.argv[1])

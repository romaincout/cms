function scrollSmoothTo(srcLink) { 
  // from the src link, determine the anchor, open collapsed parents if any and scroll to the anchor

  //select the anchor
  anchorName= decodeURI( //decodeURI usefull for some chars, eg 'é'
      srcLink.href.replace(/.*#/,"")
  )
  var anchor = document.querySelector('a[name="'+anchorName+'"]')

  //<# (recursively) open parent sections if any
  previous_elt=""
  //get anchor's parent button if any
  elt=document.querySelector('a[name="'+anchorName+'"]').closest("div.content, button.collapsible")
  if( elt && elt.nodeName == 'DIV') elt=elt.previousElementSibling

  while ( elt ) { // there is a parent ".content" button
    // show content
    toggleHintCollapse(elt,"block")
    elt.nextElementSibling.style.display = "block";
    previous_elt=elt
    // select parent collapsible (null if there is none, breaking the while)
    elt=elt.parentElement.previousElementSibling.closest(".collapsible")
  }//#>

  // reselect anchor in DOM (in case it was inside a non visible div when first selected you can't scroll to it)
  var anchor = document.querySelector('a[name="'+anchorName+'"]')

  anchor.scrollIntoView({
    block: 'start',
    behavior: 'smooth'
  });
}

function fillToc() {
    var toc = "";
    var level = 0;

    document.getElementById("contents").innerHTML =
        document.getElementById("contents").innerHTML.replace(
            /<h([\d])>([^<]+)<\/h([\d])>/gi,
            function (str, openLevel, titleText, closeLevel) {
                if (openLevel != closeLevel) {
                    return str;
                }

                if (openLevel > level) {
                    toc += (new Array(openLevel - level + 1)).join("<ul>");
                } else if (openLevel < level) {
                    toc += (new Array(level - openLevel + 1)).join("</ul>");
                }

                level = parseInt(openLevel);

		//<a href="#anchor" onclick="scrollSmoothTo(this);return false;">anch</a>
                var anchor = titleText.replace(/ /g, "_");
                toc += "<li><a href=\"#" + anchor + "\" onclick=\"scrollSmoothTo(this);return false;\">" + titleText
                    + "</a></li>";

                return "<h" + openLevel + "><a name=\"" + anchor + "\">"
                    + titleText + "</a></h" + closeLevel + ">";
            }
        );

    if (level) {
        toc += (new Array(level + 1)).join("</ul>");
    }

    document.getElementById("toc").innerHTML += toc;
};

function toggleHintCollapse(elt,to_style){
  function a(elt){elt.innerHTML = elt.innerHTML.replace(/⌄/,"\u2303");}
  function b(elt){elt.innerHTML = elt.innerHTML.replace(/\u2303/,"⌄");}
  if( to_style == "block" || to_style == "none" ){
    if( to_style == "block" ){a(elt)}else{b(elt)}
  } else { // no style was forced, toggle it
    if( elt.innerHTML.match(/\u2303/)) b(elt)
    else a(elt)
  }
};

function expandCollapse(style){ // block or none
  var i; var coll = document.getElementsByClassName("collapsible");
  for (i = 0; i < coll.length; i++) {
    coll[i].nextElementSibling.style.display = style;
    toggleHintCollapse(coll[i],style);
  }
}

window.onload = function () {
  fillToc();

  var coll = document.getElementsByClassName("collapsible");
  var i;
  
  for (i = 0; i < coll.length; i++) {
    // add open/close ⌃⌄ hint
    if (coll[i].innerHTML.search(/^[\s\S]*<h[0-9]>/)>-1){
      coll[i].innerHTML = coll[i].innerHTML.replace(/^[\s\S]*(<h[0-9]>)/,"$1\u2303 ")
    } else { coll[i].innerHTML = coll[i].innerHTML.replace(/^/,"\u2303 ")}
    if (coll[i].classList.contains("collapsed_by_default")){
      coll[i].nextElementSibling.style.display = "none";
      toggleHintCollapse(coll[i]);
    }
    else coll[i].nextElementSibling.style.display = "block";
    //
    coll[i].addEventListener("click", function(e) {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      toggleHintCollapse(this);
      if (content.style.display == "none") {
        content.style.display = "block";
	this.nextElementSibling.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        content.style.display = "none";
      }
    });
  }

  document.getElementById("open" ).addEventListener("click", function() {expandCollapse("block")});
  document.getElementById("close").addEventListener("click", function() {expandCollapse("none" )});

  // scroll to prevent weird jumps when reducing a section (happenning on ff when page was never scrolled)
  window.scrollBy(0,1)
}

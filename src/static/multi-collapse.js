$(document).ready(function() {
  var collapsible = M.Collapsible.getInstance($("ul.collapsible").get(0));
  if (window.location.hash) {
    $("ul.collapsible > li").each(function(index, element) {
      if (element.id == window.location.hash.substring(1)) {
        collapsible.open(index);
      }
    })
  } else {
    $("ul.collapsible > li").each(function(index, element) {
      collapsible.open(index);
    });
  }
});

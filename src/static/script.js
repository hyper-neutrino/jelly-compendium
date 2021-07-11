$(document).ready(function() {
  $(".collapsible:not(.expandable)").collapsible();
  M.Collapsible.init(document.querySelector(".collapsible.expandable"), {
    accordion: false
  });
  $(".sidenav").sidenav();
});

function copy_codepage() {
  navigator.clipboard.writeText($("#the-codepage").attr("data-codepage")).then(function() {
        console.log("copied codepage to clipboard");
      }).catch(function(err) {
        console.log("failed to copy codepage:", err)
      });
}

$(document).ready(function() {
  $(".collapsible").collapsible();
  $(".sidenav").sidenav();
  hljs.highlightAll();
});

function copy_codepage() {
  navigator.clipboard.writeText($("#the-codepage").attr("data-codepage"))
      .then(() => console.log("copied codepage to clipboard"))
      .catch(err => console.log("failed to copy codepage:", err));
}

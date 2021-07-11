var shortcuts = {};

$(document).ready(function() {
  $(".shortcut-data").each(function(index, element) {
    shortcuts[element.getAttribute("data-src")] = element.getAttribute("data-dest");
  });

  $(".tio-field").keydown(function(e) {
    if (e.altKey && e.keyCode == 13) {
      e.preventDefault();
      var elem = e.currentTarget;
      if (elem.readonly || elem.selectionStart != elem.selectionEnd) return;
      var pos = elem.selectionStart;
      var mx = "";
      for (var di of Object.keys(shortcuts)) {
        if (pos >= di.length && elem.value.substring(pos - di.length, pos) == di) {
          mx = mx.length > di.length ? mx : di;
        }
      }
      if (mx.length) {
        elem.value = elem.value.substring(0, pos - mx.length) + shortcuts[mx] + elem.value.substring(pos);
        elem.selectionStart = elem.selectionEnd = pos - mx.length + shortcuts[mx].length;
        update_byte_count(elem);
      }
    }
  });
});

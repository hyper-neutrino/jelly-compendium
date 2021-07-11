$(document).ready(function() {
  $("#value").on("input", function(e) {
    var value = e.currentTarget.value;
    if (value.match(/^[\[\]\d\s,-]*$/)) {
      try {
        value = eval(value);
        if (value !== undefined) {
          console.log(value);
        }
      } catch {

      }
    }
  });
});

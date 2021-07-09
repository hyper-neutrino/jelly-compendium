// COPIED: Razetime's APLGolf
// SEE: https://github.com/razetime/APLgolf/blob/main/main.js

// Following five functions are courtesy of dzaima
function deflate(arr) {
    return pako.deflateRaw(arr, {
        "level": 9
    });
}

function inflate(arr) {
    return pako.inflateRaw(arr);
}

function TIOencode(str) {
    let bytes = new TextEncoder("utf-8").encode(str);
    return deflate(bytes);
}

function arrToB64(arr) {
    var bytestr = "";
    arr.forEach(c => bytestr += String.fromCharCode(c));
    return btoa(bytestr).replace(/\+/g, "@").replace(/=+/, "");
}

function b64ToArr(str) {
    return new Uint8Array([...atob(decodeURIComponent(str).replace(/@/g, "+"))].map(c => c.charCodeAt()))
}

// more help from dzaima here
async function TIO(code, input, flags, lang) {
    const encoder = new TextEncoder("utf-8");
    let length = encoder.encode(code).length;
    let iLength = encoder.encode(input).length;
    let fLength = flags.length;
    //  Vlang\u00001\u0000{language}\u0000F.code.tio\u0000{# of bytes in code}\u0000{code}F.input.tio\u0000{length of input}\u0000{input}Vargs\u0000{number of ARGV}{ARGV}\u0000R
    let rBody = "Vlang\x001\x00" + lang + "\x00F.code.tio\x00" + length + "\x00" + code + "F.input.tio\x00" + iLength + "\x00" + input + "Vargs\x00" + fLength + flags.map(x => "\x00" + x).join("") + "\x00R";
    rBody = TIOencode(rBody);
    let fetched = await fetch("https://tio.run/cgi-bin/run/api/", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: rBody
    });
    let read = (await fetched.body.getReader().read()).value;
    let text = new TextDecoder('utf-8').decode(read);
    return text.slice(16).split(text.slice(0, 16));
}

// -----------------------------------------------------------------------------

window.last_focus = "code";

$(document).ready(function() {
  var collapsible = M.Collapsible.getInstance(document.getElementById("boxes"));

  if (window.location.hash) {
    var [header, code, footer, stdin, arguments] = decode(window.location.hash.substring(1));
    $("#header").val(header);
    $("#code").val(code);
    $("#footer").val(footer);
    $("#stdin").val(stdin);
    if (header) collapsible.open(1);
    if (footer) collapsible.open(3);
    if (stdin) collapsible.open(4);
    if (arguments.length) collapsible.open(5);
    for (var x of arguments) {
      add_argument(document.getElementById("append-argument")).children[1].children[0].value = x;
    }
    updateAll();
    update_explain_link();
  }

  $(".add-argument").click(function(e) {
    add_argument(e.currentTarget);
  });
  $(".rm-argument").click(function(e) {
    rm_argument(e.currentTarget);
  });
  $(".tio-field").on("input", function(e) {
    update_byte_count(e.currentTarget);
    update_explain_link();
  });
  $("#header, #code, #footer, #stdin, .argument").on("focusin", function(e) {
    window.last_focus = e.currentTarget.id;
  });
  $(document).keydown(function(e) {
    if (e.ctrlKey && e.keyCode == 13) {
      e.preventDefault();
      run();
    }
  });
});

function update_byte_count(element) {
  var label = element.parentNode.parentNode.parentNode.children[0].children[1];
  var bytes = element.value.length;
  label.innerHTML = label.innerHTML.replace(/\d+ bytes?/, bytes + " byte" + "s".repeat(bytes != 1));
}

var counter = 0;
function add_argument(e) {
  counter++;
  var outer_box = document.createElement("div");
  outer_box.innerHTML = "<div class='col s1'><button class='waves-effect light-blue btn add-argument'><i class='material-icons'>add</i></button></div><div class='col s10 input-field argument-inline'><textarea id='argument-field-" + counter + "' class='materialize-textarea monospace argument'></textarea></div><div class='col s1'><button class='waves-effect light-blue btn rm-argument'><i class='material-icons'>remove</i></button></div>";
  outer_box.classList = "argument-box row center-contents";
  $(outer_box).insertBefore(e.parentNode);
  $(outer_box.children[0]).click(function(e) {
    add_argument(e.currentTarget);
  });
  $(outer_box.children[1].children[0]).on("focusin", function(e) {
    window.last_focus = e.currentTarget.id;
  });
  $(outer_box.children[2]).click(function(e) {
    rm_argument(e.currentTarget);
  });
  update_argument_count();
  return outer_box;
}

function rm_argument(e) {
  e.parentNode.remove();
  update_argument_count();
}

function update_argument_count() {
  update_explain_link();
  var args = document.querySelectorAll(".argument-box").length;
  if (args == 0) {
    $("#args-label").text("Arguments (Niladic)");
  } else if (args == 1) {
    $("#args-label").text("Arguments (Monadic)");
  } else if (args == 2) {
    $("#args-label").text("Arguments (Dyadic)");
  } else {
    $("#args-label").text("Arguments (Dyadic, " + (args - 2) + " extra argument" + "s".repeat(args != 3) + ")");
  }
}

function get_code() {
  var header = $("#header").val();
  var code = $("#code").val();
  var footer = $("#footer").val();

  return (header && (header + "\n")) + code + (footer && ("\n" + footer));
}

var canceled = {};
var seshcounter = 0;
var running = false;

function run() {
  if (running) {
    canceled[seshcounter] = true;
    running = false;

    $("#run").text("RUN");
    $("#stdout").val("");
    $("#stderr").val("request canceled by user");

    updateAll();

    return;
  }

  running = true;

  seshcounter++;

  $("#run").text("RUNNING...");

  var code = get_code();

  var arguments = [...$(".argument")].map(function(e) {
    return e.value;
  });

  (function(sid, code, arguments) {
    TIO(code, $("#stdin").val(), arguments, "jelly").then(function(result) {
      if (canceled[sid]) return;

      running = false;

      $("#stdout").val(result[0]);
      $("#stderr").val(result[1]);

      updateAll();

      $("#run").text("RUN");
    });
  })(seshcounter, code, arguments);
}

function updateAll() {
  for (var id of ["header", "code", "footer", "stdin", "stdout", "stderr"]) {
    M.textareaAutoResize($("#" + id));
    update_byte_count(document.getElementById(id));
  }
}

function type(char) {
  var target = document.getElementById(window.last_focus);

  var chars = [...target.value];
  chars.splice(target.selectionStart, target.selectionEnd - target.selectionStart, [char]).join("");
  target.value = chars.join("");

  update_byte_count(target);

  target.focus();
  M.textareaAutoResize($(target));
}

function encode(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function decode(str) {
  return JSON.parse(decodeURIComponent(escape(atob(str))));
}

function url() {
  var items = [$("#header").val(), $("#code").val(), $("#footer").val(), $("#stdin").val(), [...$(".argument")].map(function(x) {
    return x.value;
  })];
  return "#" + encode(items);
}

function scroll() {
  $("html, body").animate({
    scrollTop: $("#stdout").offset().top
  });
}

function link() {
  document.location = url();
  $("#stdout").val(window.location).select().focus();
  updateAll();
  scroll();
}

function format() {
  document.location = url();
  var code = $("#code").val();
  $("#stdout").val("# [Jelly], " + code.length + " byte" + "s".repeat(code.length != 1) + "\n\n" + (code.length ? code.split("\n").map(function(line) {
    return "    " + line;
  }).join("\n") : "<pre><code></code></pre>") + "\n\n[Try It Online!](" + document.location + ")\n\n[Jelly]: https://github.com/DennisMitchell/jellylanguage").select().focus();
  updateAll();
  scroll();
}

function cmc() {
  document.location = url();
  var code = $("#code").val().replace("\n", "¶");
  $("#stdout").val("Jelly, " + code.length + " byte" + "s".repeat(code.length != 1) + ": [`" + code.replace("`", "\\`") + "`](" + document.location + ")").select().focus();
  updateAll();
  scroll();
}

function tio() {
  alert("This feature is not implemented yet!");
}

function update_explain_link() {
  var code = get_code();
  var arity = Math.min(2, $(".argument").length);
  document.getElementById("explainlink").href = "/misc/explain?code=" + encodeURIComponent(escape(code)) + "&arity=" + arity;
}

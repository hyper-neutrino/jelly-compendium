let codepage  = "¡¢£¤¥¦©¬®µ½¿€ÆÇÐÑ×ØŒÞßæçðıȷñ÷øœþ !\"#$%&'()*+,-./0123456789:;<=>?";
    codepage += "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¶";
    codepage += "°¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ƁƇƊƑƓƘⱮƝƤƬƲȤɓƈɗƒɠɦƙɱɲƥʠɼʂƭʋȥẠḄḌẸḤỊḲḶṂṆỌṚṢṬỤṾẈỴẒȦḂ";
    codepage += "ĊḊĖḞĠḢİĿṀṄȮṖṘṠṪẆẊẎŻạḅḍẹḥịḳḷṃṇọṛṣṭ§Äẉỵẓȧḃċḋėḟġḣŀṁṅȯṗṙṡṫẇẋẏż«»‘’“”";

function field_updated(element) {
  var value = element.value;
  if ([...value].some(function(x) {
    return x != "\n" && codepage.indexOf(x) == -1;
  })) {
    $("#output").val("Jelly cuts characters that aren't in its codepage out of its code. You will need to use <a href='/atoms/chr'><code>Ọ</code> (Chr)</a> on the codepoint to create those characters.");
  } else if (value.match(/^\s*$/)) {
    $("#output").val("");
  } else {
    if (value.replace(/"(\\.|[^"])*"|'(\\.|[^'])*'/g, "").match(/^[\[\],\s]*$/)) {
      try {
        value = eval("[" + value + "]");
        if (value.length == 1) value = value[0];
      } catch {

      }
    }
    $("#output").val(compress(pilcrowify(value)));
  }
  M.textareaAutoResize($("#output"));
}

$(document).ready(function() {
  $("#value").on("input", function(e) {
    field_updated(e.currentTarget);
  });
});

function compress(value, surround_list = false) {
  return compressed_string(value);
  var converted = "";
  for (var f of [trivial, char_list, double_char, compressed_string]) {
    var c = f(value);
    if (c && (converted == "" || c.length < converted.length)) {
      converted = c;
    }
  }
  if (Array.isArray(value)) {
    var list_form = value.map(function(sub) {
      return compress(sub, true);
    }).join(",");
    if (surround_list || value.length == 1) {
      list_form = "[" + list_form + "]";
    }
    if (list_form && (converted == "" || list_form.length < converted.length)) {
      converted = list_form;
    }
  }
  return converted;
}

function pilcrowify(x) {
  if (Array.isArray(x)) {
    return x.map(pilcrowify);
  }
  return x.replaceAll("\n", "¶");
}

function trivial(value) {
  if (Array.isArray(value) && value.every(function(x) {
    return !Array.isArray(x) && [..."«»‘’“”"].every(function(k) {
      return x.indexOf(k) == -1;
    })
  })) {
    var k = value.map(function(x) {
      return "“" + x;
    }).join("") + "”";
    if (value.length == 1) {
      return "[" + k + "]";
    } else {
      return k;
    }
  } else if (!Array.isArray(value) && [..."«»‘’“”"].every(function(k) {
    return value.indexOf(k) == -1;
  })) {
    return "“" + value + "”";
  }
}

function char_list(value) {
  if (!Array.isArray(value)) {
    if (value.length == 1) {
      return "[”" + value + "]";
    } else {
      return [...value].map(function(x) {
        return "”" + x;
      }).join(",");
    }
  }
}

function double_char(value) {
  if (!Array.isArray(value) && value.length == 2) {
    return "⁾" + value;
  }
}

var cache = {"Hello, World!": 51614827202531n}

function compressed_string(value) {
  if (Array.isArray(value) && value.every(function(x) {
    return !Array.isArray(x) && [...x].every(function(k) {
      return codepage.indexOf(k) >= 32 && codepage.indexOf(k) < 128;
    });
  })) {
    return value.map(function(x) {
      var k = compressed_string(x);
      return k.substring(0, k.length - 1);
    }).join("") + "»";
  } else if (!Array.isArray(value) && [...value].every(function(x) {
    console.log(x);
    return codepage.indexOf(x) >= 32 && codepage.indexOf(x) < 128;
  })) {
    var integer = recompress(value);
    builder = "»";
    while (integer) {
      var digit = integer % 250n;
      if (digit == 0n) digit = 250n;
      integer /= 250n;
      builder = codepage[digit - 1n] + builder;
    }
    return "“" + builder;
  }
}

let MAX_DICT_LEN = 58;

function recompress(string) {
  if (cache[string] !== undefined) {
    return cache[string];
  }
  var DP = Array(string.length + 1).fill(0n);
  var progress = "";
  for (var index = string.length - 1; index >= 0; index--) {
    progress = string[index] + progress;
    if (cache[progress] !== undefined) {
      DP[index] = cache[progress];
    } else {
      DP[index] = compressor_insert_character(DP[index + 1], string[index]);
    }
  }
  return DP[0];
}

function compressor_insert_character(integer, character) {
  return 3n * (96n * integer + BigInt(codepage.indexOf(character)) - 32n);
}

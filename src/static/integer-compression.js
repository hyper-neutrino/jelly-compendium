let codepage  = "¡¢£¤¥¦©¬®µ½¿€ÆÇÐÑ×ØŒÞßæçðıȷñ÷øœþ !\"#$%&'()*+,-./0123456789:;<=>?";
    codepage += "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¶";
    codepage += "°¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ƁƇƊƑƓƘⱮƝƤƬƲȤɓƈɗƒɠɦƙɱɲƥʠɼʂƭʋȥẠḄḌẸḤỊḲḶṂṆỌṚṢṬỤṾẈỴẒȦḂ";
    codepage += "ĊḊĖḞĠḢİĿṀṄȮṖṘṠṪẆẊẎŻạḅḍẹḥịḳḷṃṇọṛṣṭ§Äẉỵẓȧḃċḋėḟġḣŀṁṅȯṗṙṡṫẇẋẏż«»‘’“”";

$(document).ready(function() {
  $("#value").on("input", function(e) {
    var value = e.currentTarget.value;
    if (value.match(/^\s*$/)) {
      $("#output").val("");
    } else if (value.match(/^[\[\]\d\s,-]*$/)) {
      try {
        value = eval("[" + value.replace(/\d+/g, x => x + "n") + "]");
      } catch {
        return;
      }
      if (value !== undefined) {
        if (value.length == 1) value = value[0];
        $("#output").val(compress(value));
      }
    }
    M.textareaAutoResize($("#output"));
  });
});

function compress(value, surround_list = false) {
  var converted = "";
  for (var f of [trivial, exponential, cp_index_list, compressed_integer, short_compressed]) {
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

function trivial(number) {
  if (Array.isArray(number)) return;
  if (number == -1n) {
    return "-";
  } else {
    return number.toString();
  }
}

function exponential(number) {
  if (Array.isArray(number)) return;
  var exp = 0n;
  while (number % 10n == 0n) {
    exp++;
    number /= 10n;
  }
  return (number == 1 ? "" : number == -1 ? "-" : number.toString()) + "ȷ" + (exp == 3 ? "" : exp.toString());
}

function cp_index_list(numbers) {
  if (!Array.isArray(numbers)) return;
  if (numbers.every(function(x) {
    return !Array.isArray(x) && 0n <= x && x < 250n;
  })) {
    return "“" + numbers.map(function(x) {
      return codepage[x];
    }).join("") + "‘";
  } else if (numbers.every(function(x) {
    return Array.isArray(x) && x.every(function(x) {
      return !Array.isArray(x) && 0n <= x && x < 250n;
    });
  })) {
    var k = numbers.map(function(x) {
      return "“" + x.map(function(x) {
        return codepage[x];
      }).join("");
    }).join("") + "‘";
    if (numbers.length == 1) {
      return "[" + k + "]";
    } else {
      return k;
    }
  }
}

function compressed_integer(number) {
  if (Array.isArray(number) && number.every(function(x) {
    return !Array.isArray(x) && x >= 0n;
  })) {
    k = number.map(function(e) {
      var string = compressed_integer(e);
      return string.substring(0, string.length - 1);
    }).join("") + "’";
    if (number.length == 1) {
      return "[" + k + "]";
    } else {
      return k;
    }
  } else if (!Array.isArray(number) && number >= 0n) {
    var builder = "’";
    while (number) {
      var digit = number % 250n;
      if (digit == 0n) digit = 250n;
      number -= digit;
      number /= 250n;
      builder = codepage[digit - 1n] + builder;
    }
    return "“" + builder;
  }
}

function short_compressed(number) {
  if (Array.isArray(number)) return;
  if (number < -31349n || (number > -100n && number < 1001n) || number > 32250n) return;

  if (number < 0) number += 62850n;
  else            number -= 750n;

  var last = number % 250n;
  if (last == 0n) last = 250n;
  number -= last;
  number /= 250n;

  return "⁽" + codepage[number - 1n] + codepage[last - 1n];
}

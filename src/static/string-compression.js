let codepage  = "¡¢£¤¥¦©¬®µ½¿€ÆÇÐÑ×ØŒÞßæçðıȷñ÷øœþ !\"#$%&'()*+,-./0123456789:;<=>?";
    codepage += "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¶";
    codepage += "°¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ƁƇƊƑƓƘⱮƝƤƬƲȤɓƈɗƒɠɦƙɱɲƥʠɼʂƭʋȥẠḄḌẸḤỊḲḶṂṆỌṚṢṬỤṾẈỴẒȦḂ";
    codepage += "ĊḊĖḞĠḢİĿṀṄȮṖṘṠṪẆẊẎŻạḅḍẹḥịḳḷṃṇọṛṣṭ§Äẉỵẓȧḃċḋėḟġḣŀṁṅȯṗṙṡṫẇẋẏż«»‘’“”";

$(document).ready(function() {
  $("#value").on("input", function(e) {
    var value = e.currentTarget.value;
    if (value.match(/^\s*$/)) {
      $("#output").val("");
    } else {
      if (value.replace(/"(\\.|[^"])*"|'(\\.|[^'])*'/g, "").match(/^[\[\],\s]*$/)) {
        try {
          value = eval("[" + value + "]");
          if (value.length == 1) value = value[0];
        } catch {

        }
      }
      console.log(value);
      $("#output").val(compress(value));
    }
  });
});

function compress(value, surround_list = false) {

}

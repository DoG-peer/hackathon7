addNormalSyntax({
  start: "**",
  end: "**",
  template: function(str){
    return "<strong>"+str+"</strong>";
  }
});

addNormalSyntax({
  start: "__",
  end: "__",
  template: function(str){
    return "<strong>"+str+"</strong>";
  }
});

addNormalSyntax({
  start: "*",
  end: "*",
  template: function(str){
    return "<em>"+str+"</em>";
  }
});

addNormalSyntax({
  start: "_",
  end: "_",
  template: function(str){
    return "<em>"+str+"</em>";
  }
});

addNormalSyntax({
  start: "~~",
  end: "~~",
  allowSyntax: true,
  template: function(str){
    return "<del>"+str+"</del>";
  }
});

addNormalSyntax({
  start: "//",
  end: "",
  template: function(){
    return "<br>";
  }
});

addNormalSyntax({
  start: "[",
  end: "]",
  template: function(str){
    if(/^(.*),(.*):(.*)$/.test(str)){
      switch(RegExp.$2.trim()){
        case "http":
        case "https":
          return "<a href=\" " + RegExp.$2+":"+RegExp.$3+ "\">" + RegExp.$1 +"</a>"
          break;
        case "ruby":
          return "<ruby><rb>" + RegExp.$1 + "</rb><rp>(</rp><rt>"+RegExp.$3+"</rt><rp>)</rp></ruby>";
          break;
        case "color":
          return "<span style=\"color: "+RegExp.$3+"\">" + RegExp.$1 + "</span>";
          break;// res226
        default:
          return "["+parseSyntax(str)+"]";
          break;
      }
    }else{
      return "["+parseSyntax(str)+"]";
    }
  }
});
addNormalSyntax({
  start: "![",
  end: "]",
  template: function(str){
    if(/^(.*),(.*)$/.test(str)){
      return "<img src=\"" +RegExp.$2+"\" alt=\""+RegExp.$1+"\" title=\""+RegExp.$1+"\">";
    }else{
      return "!["+parseSyntax(str)+"]";
    }
  }
})

addBlockSyntax({
   start: /^```/,
   end: /^```/,
   template: function(lines){
     return "<pre>"+lines.slice(1,-1).join("<br>")+"</pre>";
   },
   validation: /^/,
   allowBlock: false,
   allowSyntax: false
});
/*
addBlockSyntax({
  start: /^>\s/,
  end: /^$/,
  validation: /^>/,
  template: function(lines){
    console.log(lines);
    var ar = lines.map(function(line){
      return line.slice(2);
    });
    return "<blockquote>"+ar.join("<br>") + "</blockquote>";
  },
  allowSyntax: true,
  allowBlock: false
});
*/
addSpecialSyntax({
  mark: /^#([^#].*)/,
  template: function(str){
    return "<h1>"+str+"</h1>";
  }
});
addSpecialSyntax({
  mark: /^##([^#].*)/,
  template: function(str){
    return "<h2>"+str+"</h2>";
  }
});
addSpecialSyntax({
  mark: /^###([^#].*)/,
  template: function(str){
    return "<h3>"+str+"</h3>";
  }
});
addSpecialSyntax({
  mark: /^####([^#].*)/,
  template: function(str){
    return "<h4>"+str+"</h4>";
  }
});
addSpecialSyntax({
  mark: /^#####([^#].*)/,
  template: function(str){
    return "<h5>"+str+"</h5>";
  }
});
addSpecialSyntax({
  mark: /^######([^#].*)/,
  template: function(str){
    return "<h6>"+str+"</h6>";
  }
});
















addEffectSyntax({
  mark: /^==[=]+$/,
  template: function(str){
    return "<h1>"+str+"</h1>";
  }
});



// parseSyntax("xx**foo**ずれているｗ// ** hoge   **")
// => "xx<strong>foo</strong>ずれているｗ<br> <strong> hoge   </strong>"
//toHtml("hoge\nxx**foo**ずれているｗ// ** hoge   **",{allowSyntax: true})
//"hoge
//xx<strong>foo</strong>ずれているｗ<br> <strong> hoge   </strong>"

//toHtml("hoge\nxx**foo**ずれているｗ// ** hoge   **",{allowSyntax: false})
//"hoge
//xx**foo**ずれているｗ// ** hoge   **"

//result("aa\n```\nbb\n```\ncc**")
//"aa<br><pre>**bb**</pre><br>cc**"
//
//result("hoge\n===\n ##foo")
//"<h1>hoge</h1><br><h2>foo</h2>"

//result("```\n##hoge\n```")
//"<pre>##hoge</pre>"
//
//[亜米利加,ruby:アメリカ]  => ルビ
//[ぐーぐる, http://google.co.jp] => リンク
//[**hoge**] => [<strong>hoge</strong>]
//[目がかゆい, color:red]
//

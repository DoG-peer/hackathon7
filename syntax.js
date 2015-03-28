addNormalSyntax({
  start: "**",
  end: "**",
  template: function(str){
    return "<strong>"+str+"</strong>";
  }
});

addNormalSyntax({
  start: "//",
  end: "",
  template: function(){
    return "<br>";
  }
});

addBlockSyntax({
   start: /^```/,
   end: /^```/,
   template: function(lines){
     return "<pre>"+lines.join("<br>")+"</pre>";
   },
   validation: /^/,
   allowBlock: false,
   allowSyntax: false
});

addSpecialSyntax({
  mark: /^##([^#].*)/,
  template: function(str){
    return "<h2>"+str+"</h2>";
  }
});

addEffectSyntax({
  mark: /^==[=]+$/,
  template: function(str){
    return "<h1>"+str+"</h1>";
  }
});


setupLineParser();

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



//
var docTree = [{type: "Main"}];
var blockHierarchy = [docTree];
var excited = [];

/**
 * syntaxの一覧
 * normal
 * {
 *    start: "**",
 *    end: "**",
 *    template: function(str){
 *      return "<strong>"+str+"<strong>";
 *    }
 * }
 * **hoge** が <strong>hoge</strong> になるようにする登録
 *
 * {
 *    start: "//",
 *    end: "",
 *    template: function(){
 *      return "<br>";
 *    }
 * }
 * // で<br>にするようにするようにする登録
 * # TODO: endがないときは勝手に補完する
 * */
var normalSyntaxes = [];

/**
 * special syntax
 * 一行使って書かれる表記
 * ## hoge  => <h2> hoge</h2>
 * 等
 *
 * {
 *    mark: /^##([^#].*)/,
 *    template: function(str){
 *      return "<h2>"+str+"</h2>";
 *    }
 * }
 * markに正規表現を登録して利用
 * # TODO: 複数個の引数のtemplateが使いたい場合は要相談
 */
var specialSyntaxes = [];

/**
 * effectSyntaxは
 *
 * hoge
 * =====
 *
 * を<h1>hoge</h1>にする例
 *
 * のように一つ前の文と組み合わさって、一つの表現となる文法
 * {
 *    mark: /^==[=]+$/,
 *    template: function(str){
 *      return "<h1>"+str+"</h1>";
 *    }
 * }
 *
 */
var effectSyntaxes = [];

/**
 * blockSyntaxは
 * 複数行にわたる一塊の文法
 *
 * ```
 * ぶろっく
 * ぶろっく
 * ぶろっく
 * ```
 *
 * {
 *    start: /^```/,
 *    end: /^```/,
 *    template: function(lines){
 *      return "<pre>"+lines.join("<br>")+"</pre>";
 *    },
 *    validation: /^/,
 *    allowBlock: false,
 *    allowSyntax: false
 * }
 * validationはブロック内に入っているための条件(blockHierarchyの最後のみ対応)
 * allowBlockはブロックを中に入れることを許可するか
 * allowSyntaxはブロック以外の文法を許可するか
 * TODO: allowBlock, allowSyntaxを正しく実装
 */
var blockSyntaxes = [];


function addNormalSyntax(syntax){
  normalSyntaxes.push({
    start: syntax.start,
    end: syntax.end || "",
    template: syntax.template
  });
}
function addSpecialSyntax(syntax){
  specialSyntaxes.push({
    mark: syntax.mark,
    template: syntax.template
  });
}
function addEffectSyntax(syntax){
  effectSyntaxes.push({
    mark: syntax.mark,
    template: syntax.template
  });
}

function addBlockSyntax(syntax){
  blockSyntaxes.push({
    start: syntax.start,
    end: syntax.end || "",
    template: syntax.template,
    validation: syntax.validation,
    allowBlock: syntax.allowBlock || false,
    allowSyntax: !!(syntax.allowSyntax)
  });
}

function addSyntax(syntaxType, syntax){
  switch(syntaxType){
    case "special":
      return addSpecialSyntax(syntax);
      break;
    case "effect":
      return addEffectSyntax(syntax);
      break;
    case "block":
      return addBlockSyntax(syntax);
      break;
    default:
      return addNormalSyntax(syntax);
      break;
  }
}

// 行の種類を判定する
// 一つ前の行がブロックの最終行だった可能性をチェック
// ブロックの終了かをチェック
// ブロックの開始かをチェック(登録順)
// エフェクトかをチェック
// スペシャルかをチェック
// 普通の場合
// [種類, 付加情報]の形で返す
// allowBlockをみる
function checkLine(line){
  if(blockHierarchy.length > 1){
    var id = blockHierarchy[blockHierarchy.length-1][0].id;
    var nearestBlock = blockSyntaxes[id];
    var outerBlock = blockSyntaxes[blockHierarchy[blockHierarchy.length-2][0].id];
    //TODO: ブロックでない場合の排除もしくは対応
    if(!(nearestBlock.validation.test(line)) && !!outerBlock.allowSyntax ){
      // スペシャルかをチェック
      for(var i = 0; i < specialSyntaxes.length; i++){
        if(specialSyntaxes[i].mark.test(line)){
          return ["AfterBlock","Special",i];
        }
      }
      // その他
      return ["AfterBlock", "Normal"];
    }
    if(nearestBlock.end.test(line)){
      return ["EndBlock"];
    }

    // ブロックの開始かをチェック(登録順)(ブロックに入っている場合)
    if(nearestBlock.allowBlock){
      for(var i = 0; i < blockSyntaxes.length; i++){
        if(blockSyntaxes[i].start.test(line)){
          return ["StartBlock", i];
        }
      }
    }
      console.log(nearestBlock);
    if(!nearestBlock.hasOwnProperty("allowSyntax") || nearestBlock.allowSyntax){
      // エフェクトかをチェック
      for(var i = 0; i < effectSyntaxes.length; i++){
        if(effectSyntaxes[i].mark.test(line)){
          return ["Effect",i];
        }
      }

      // スペシャルかをチェック
      for(var i = 0; i < specialSyntaxes.length; i++){
        if(specialSyntaxes[i].mark.test(line)){
          return ["Special",i];
        }
      }
    }else{
      return ["Normal"];
    }
  }

  // ブロックの開始かをチェック(登録順)(ブロックに入っていない場合)
  for(var i = 0; i < blockSyntaxes.length; i++){
    if(blockSyntaxes[i].start.test(line)){
      return ["StartBlock", i];
    }
  }
  // エフェクトかをチェック
  for(var i = 0; i < effectSyntaxes.length; i++){
    if(effectSyntaxes[i].mark.test(line)){
      return ["Effect",i];
    }
  }

  // スペシャルかをチェック
  for(var i = 0; i < specialSyntaxes.length; i++){
    if(specialSyntaxes[i].mark.test(line)){
      return ["Special",i];
    }
  }

  // その他
  return ["Normal"]
}

function upPosition(){
  blockHierarchy.pop();
}

function emitFromExcited(){
  while(excited.length>0){
    blockHierarchy[blockHierarchy.length - 1].push(excited.shift());
  }
}

function clearExcited(){
  while(excited.length > 0){
    excited.pop();
  }
}
function enterToExcited(line){
  excited.push(line)
}

function appendSpecialToTree(i, line){
  blockHierarchy[blockHierarchy.length - 1].push([{
    type: "Special", id: i
  },line]);
}

function appendEffectToTree(i,line){
  blockHierarchy[blockHierarchy.length - 1].push([{
    type: "Effect", id: i
  },[].concat(excited),line]);
}

function appendBlockToTree(i){
  var block = [{
    type: "Block", id: i
  }];
  blockHierarchy[blockHierarchy.length - 1].push(block);
  blockHierarchy.push(block);
  // postionの最後にblockを追加
}

function parse(lines){
  lines.forEach(function(line){
    // 行の種類によって分類
    var info = checkLine(line);
    var i;
    switch(info[0]){
      case "AfterBlock":
        emitFromExcited();
        upPosition();
        // docTreeにその文を追加
        if(info[1]=="Special"){
          appendSpecialToTree(info[2], line);
        }else{
          enterToExcited(line);
        }
        break;
      case "EndBlock":
        emitFromExcited();
        upPosition();
        break;
      case "StartBlock":
        emitFromExcited();
        appendBlockToTree(info[1]);
        break;
      case "Special":
        emitFromExcited();
        appendSpecialToTree(info[1],line);
        break;
      case "Effect":
        appendEffectToTree(info[1], line);
        clearExcited();
        break;
      default:
        emitFromExcited();
        enterToExcited(line);
        break;
    }
  });
  emitFromExcited();
}

function toHtml(tree, option){
  if(typeof(tree) == "string"){
    return readLine(tree, option);
  }else{
    var state = tree[0];
    var newOption = nextOption(state, option);
    //最初の項以外が文章
    switch(state.type){
      case "Special":
        var lines = tree.slice(1).map(function(x){return toHtml(x, newOption);});
        var syntax = specialSyntaxes[state.id];
        var variables = lines[0].match(syntax.mark).slice(1);
        return syntax.template.apply(this,variables);
        break;
      case "Effect":
        var syntax = effectSyntaxes[state.id];
        return syntax.template.apply(this,tree[1].concat([tree[2]]));
        break;
      case "Main":
        var lines = tree.slice(1).map(function(x){return toHtml(x, newOption);});
        return lines.join("<br>");
        break;
      case "Block":
        var lines = tree.slice(1).map(function(x){return toHtml(x, newOption);});
        var syntax = blockSyntaxes[state.id];
        return syntax.template(lines);
        break;
    }
  }
}

function nextOption(state, option){

  if(state.type == "Block"){
    var syntax = blockSyntaxes[state.id];
    return {
      allowSyntax: syntax.allowSyntax
    }
  }

  return {
    allowSyntax: true
  }
}

function readLine(str, option){
  if(option.allowSyntax){
    return parseSyntax(str);
  }else{
    return str;
  }
}

function init(){
  docTree = [{type: "Main"}];
  blockHierarchy = [docTree];
  excited = [];
}

function result(str){
  init();
  var lines = (typeof(str)=="string") ? str.split("\n") : str;
  setupLineParser();
  parse(lines);
  return toHtml(docTree,{});
}

/**
 * lineParseTreeは先頭から、任意に選択してつなげていくと、
 * なんらかのsyntax.startになっており、そこにendの情報がついている
 * {f: {o: {o: {syntax: 文法} } } }
 */
var lineParseTree;
function setupLineParser(){
  lineParseTree = {};
  var last = lineParseTree;
  normalSyntaxes.forEach(function(syntax){
    var start = syntax.start;
    var l = start.length;
    var found = true;
    for(var i=0;i<l;i++){
      if(found){
        found = last.hasOwnProperty(start[i]);
        if(found){
          last = last[start[i]];
        }else{
          last[start[i]] = {};
          last = last[start[i]];
        }
      }else{
        last[start[i]] = {};
        last = last[start[i]];
      }
    }
    last.syntax = syntax;
    last = lineParseTree;
  });
}
function parseSyntax(str){
  // lineParseTreeを使う
  // startを見つける
  var posh=[lineParseTree];
  var head = 0; //startの先頭
  var tail = 0;  //startの末尾
  var found = false;
  var flag = true;// 進んでいたらtrue, 戻っていたらfalse
  while(head < str.length){
    var pos = posh[posh.length-1];
    if(flag){
      if((tail<str.length) && pos.hasOwnProperty(str[tail])){
        posh.push(pos[str[tail]]);
        tail++;
      }else{
        tail--;
        flag = false;
      }
    }else{
      if(typeof(pos) != "undefined" && pos.hasOwnProperty("syntax") && RegExp(escapeReg(pos.syntax.end)).test(str.substr(tail+1))){
        found = true;
        tail = Math.min(tail, str.length-1);
        break;
      }else if(tail < head){
        posh = [lineParseTree];
        head++;
        tail = head;
        flag = true;
      }else{
        posh.pop();
        tail--;
      }
    }
  }
  //return [head,tail,posh];
  if(!(found)){return str;}

  // endを見つける
  var pre = str.substr(0,head);
  var start = str.substr(head, tail-head+1);
  var rest = str.substr(tail+1);
  var syntax = posh[posh.length-1].syntax;
  var end = syntax.end;
  if(end==""){
    return pre + syntax.template() + parseSyntax(rest);;
  }else{
    var sp = rest.split(end);
    var body = sp.shift();
    rest = sp.join(end);
    return pre + syntax.template(body) + parseSyntax(rest);
  }
}

function escapeReg(str){
  return str.replace(/\W/g, "\\$&");
}









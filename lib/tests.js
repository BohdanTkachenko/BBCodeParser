/// <reference path="tsUnit.ts" />
/// <reference path="tokenizer.ts" />
/// <reference path="bbCodeParseTree.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//Tests the tokenizer
var TestTokenizer = (function (_super) {
    __extends(TestTokenizer, _super);
    function TestTokenizer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestTokenizer.prototype.testEndsWith = function () {
        this.isTrue(endsWith("troll alla", "alla"));
        this.isFalse(endsWith("troll alla", "hej alla barnen"));
        this.isTrue(endsWith("alla", "alla"));
    };
    TestTokenizer.prototype.testTokenize = function () {
        var tokenizer = new Tokenizer(BBCodeParser.defaultTags());
        var tokens = tokenizer.tokenizeString("tja[b][i][u]Test[/u][/i][/b]då");
        this.isTrue(new Token(TokenType.Text, "tja").equals(tokens[0]));
        this.isTrue(new Token(TokenType.StartTag, "b").equals(tokens[1]));
        this.isTrue(new Token(TokenType.StartTag, "i").equals(tokens[2]));
        this.isTrue(new Token(TokenType.StartTag, "u").equals(tokens[3]));
        this.isTrue(new Token(TokenType.Text, "Test").equals(tokens[4]));
        this.isTrue(new Token(TokenType.EndTag, "u").equals(tokens[5]));
        this.isTrue(new Token(TokenType.EndTag, "i").equals(tokens[6]));
        this.isTrue(new Token(TokenType.EndTag, "b").equals(tokens[7]));
        this.isTrue(new Token(TokenType.Text, "då").equals(tokens[8]));
        tokens = tokenizer.tokenizeString("[code][[1,2,3],[4,5,6]][/code]");
        this.isTrue(new Token(TokenType.StartTag, "code").equals(tokens[0]));
        this.isTrue(new Token(TokenType.Text, "[[1,2,3],[4,5,6]]").equals(tokens[1]));
        this.isTrue(new Token(TokenType.EndTag, "code").equals(tokens[2]));
        tokens = tokenizer.tokenizeString("[code]var elo = tja[0];[/code]");
        this.isTrue(new Token(TokenType.StartTag, "code").equals(tokens[0]));
        this.isTrue(new Token(TokenType.Text, "var elo = tja[0];").equals(tokens[1]));
        this.isTrue(new Token(TokenType.EndTag, "code").equals(tokens[2]));
        tokens = tokenizer.tokenizeString("tja [b]fan[/b då");
        this.isTrue(new Token(TokenType.Text, "tja ").equals(tokens[0]));
        this.isTrue(new Token(TokenType.StartTag, "b").equals(tokens[1]));
        this.isTrue(new Token(TokenType.Text, "fan[/b då").equals(tokens[2]));
        tokens = tokenizer.tokenizeString("Testa följande: a[0][0]?");
        this.isTrue(new Token(TokenType.Text, "Testa följande: a").equals(tokens[0]));
        this.isTrue(new Token(TokenType.Text, "[0]").equals(tokens[1]));
        this.isTrue(new Token(TokenType.Text, "[0]").equals(tokens[2]));
        this.isTrue(new Token(TokenType.Text, "?").equals(tokens[3]));
        tokens = tokenizer.tokenizeString("[url=\"http://google.se\"]Google.se[/url]");
        this.isTrue(new Token(TokenType.StartTag, "url").equals(tokens[0]));
        this.isTrue(new Token(TokenType.Text, "Google.se").equals(tokens[1]));
        this.isTrue(new Token(TokenType.EndTag, "url").equals(tokens[2]));
    };
    TestTokenizer.prototype.testBuildTree = function () {
        var tags = BBCodeParser.defaultTags();
        tags['blood_marker'] = new BBTag('blood_marker', true, false, false, function (tag, content) { return "<Text style={{ fontWeight: 'bold' }}>" + content + "</Text>"; });
        var parseTree = BBCodeParseTree.buildTree("tja[b]test[/b]då", tags);
        this.areIdentical(3, parseTree.subTrees.length);
        this.isTrue(parseTree.isValid());
        this.areIdentical("Text - tja", parseTree.subTrees[0].toString());
        this.areIdentical("Tag - b", parseTree.subTrees[1].toString());
        this.areIdentical("Text - test", parseTree.subTrees[1].subTrees[0].toString());
        this.areIdentical("Text - då", parseTree.subTrees[2].toString());
        parseTree = BBCodeParseTree.buildTree("tja[b][i][u]Test[/u][/i][/b]då", tags);
        this.areIdentical(3, parseTree.subTrees.length);
        this.isTrue(parseTree.isValid());
        this.areIdentical("Text - tja", parseTree.subTrees[0].toString());
        this.areIdentical("Tag - b", parseTree.subTrees[1].toString());
        this.areIdentical("Tag - i", parseTree.subTrees[1].subTrees[0].toString());
        this.areIdentical("Tag - u", parseTree.subTrees[1].subTrees[0].subTrees[0].toString());
        this.areIdentical("Text - Test", parseTree.subTrees[1].subTrees[0].subTrees[0].subTrees[0].toString());
        this.areIdentical("Text - då", parseTree.subTrees[2].toString());
        parseTree = BBCodeParseTree.buildTree("Kod: [code lang=\"js\"]function troll() { return lol(); }[/code]", tags);
        this.areIdentical(2, parseTree.subTrees.length);
        this.areIdentical(true, parseTree.isValid());
        this.areIdentical("Text - Kod: ", parseTree.subTrees[0].toString());
        this.areIdentical("Tag - code", parseTree.subTrees[1].toString());
        this.areIdentical("Text - function troll() { return lol(); }", parseTree.subTrees[1].subTrees[0].toString());
        this.areIdentical("js", parseTree.subTrees[1].attributes["lang"]);
        //Suppressed nesting
        parseTree = BBCodeParseTree.buildTree("bra [code][[1,2,3],[4,5,6]][/code]?", tags);
        this.areIdentical(3, parseTree.subTrees.length);
        this.areIdentical(true, parseTree.isValid());
        this.areIdentical("Text - bra ", parseTree.subTrees[0].toString());
        this.areIdentical("Tag - code", parseTree.subTrees[1].toString());
        this.areIdentical("Text - [[1,2,3],[4,5,6]]", parseTree.subTrees[1].subTrees[0].toString());
        this.areIdentical(1, parseTree.subTrees[1].subTrees.length);
        this.areIdentical("Text - ?", parseTree.subTrees[2].toString());
        //Invalid trees
        parseTree = BBCodeParseTree.buildTree("[b][i]tja[/b][/i]", tags);
        this.isFalse(parseTree.isValid());
        var parseTree = BBCodeParseTree.buildTree("tja [b]fan[/b då", tags);
        this.isFalse(parseTree.isValid());
        var tags = {
            blood_marker: new BBTag('blood_marker', true, false, false, function (tag, content) { return "<Text style={{ fontWeight: 'bold' }}>" + content + "</Text>"; }),
        };
        var parseTree = BBCodeParseTree.buildTree("blood marker: How can I improve [blood_marker=\"iron serum\"]iron serum[/blood_marker]", tags);
        console.log(parseTree);
        this.areIdentical(2, parseTree.subTrees.length);
        this.isTrue(parseTree.isValid());
    };
    TestTokenizer.prototype.testParseString = function () {
        var tags = BBCodeParser.defaultTags();
        tags['blood_marker'] = new BBTag('blood_marker', true, false, false, function (tag, content) { return "<Text style={{ fontWeight: 'bold' }}>" + content + "</Text>"; });
        var parser = new BBCodeParser(tags);
        var htmlStr = parser.parseString("[b]test[/b]");
        this.areIdentical("<b>test</b>", htmlStr);
        htmlStr = parser.parseString("tja [b][i]alla[/i][/b] noobs");
        this.areIdentical("tja <b><i>alla</i></b> noobs", htmlStr);
        htmlStr = parser.parseString("bra [code]x=e^x[/code]?\n[b]Okej da![/b]");
        this.areIdentical("bra <code>x=e^x</code>?<br><b>Okej da!</b>", htmlStr);
        htmlStr = parser.parseString("tja [b]fan[/b da");
        this.areIdentical("tja [b]fan[/b da", htmlStr);
        htmlStr = parser.parseString("Fungerar foljande: [troll]The troll tag[/troll]?");
        this.areIdentical("Fungerar foljande: [troll]The troll tag[/troll]?", htmlStr);
        htmlStr = parser.parseString("Fungerar [b]foljande[/b]: [troll]The troll tag[/troll]?");
        this.areIdentical("Fungerar <b>foljande</b>: [troll]The troll tag[/troll]?", htmlStr);
        htmlStr = parser.parseString("Kod: [code lang=\"javascript\"]function troll() { return lol[0](); }[/code]");
        this.areIdentical("Kod: <code class=\"javascript\">function troll() { return lol[0](); }</code>", htmlStr);
        htmlStr = parser.parseString("blood marker: How can I improve [blood_marker=\"iron serum\"]iron serum[/blood_marker]");
        this.areIdentical("blood marker: How can I improve <Text style={{ fontWeight: 'bold' }}>iron serum</Text>", htmlStr);
        htmlStr = parser.parseString("Test\r\ndå!");
        this.areIdentical("Test<br>då!", htmlStr);
        htmlStr = parser.parseString("[url=\"http://google.se\"]Google.se[/url]");
        this.areIdentical("<a href=\"http://google.se\" target=\"_blank\">Google.se</a>", htmlStr);
        //Test invalid
        htmlStr = parser.parseString("[b]test[]");
        this.areIdentical("[b]test[]", htmlStr);
        htmlStr = parser.parseString("[]test[/b]");
        this.areIdentical("[]test[/b]", htmlStr);
        htmlStr = parser.parseString("[b]test[b]");
        this.areIdentical("[b]test[b]", htmlStr);
    };
    TestTokenizer.prototype.testParseAttributes = function () {
        var parser = new BBCodeParser(BBCodeParser.defaultTags());
        var htmlStr = parser.parseString("[code lang=\"test-lang\"]x = 4[/code]");
        this.areIdentical("<code class=\"test-lang\">x = 4</code>", htmlStr);
    };
    TestTokenizer.prototype.testStripTags = function () {
        var parser = new BBCodeParser(BBCodeParser.defaultTags());
        var htmlStr = parser.parseString("[b]test[/b]", true);
        this.areIdentical("test", htmlStr);
        htmlStr = parser.parseString("[b][i]test[/i][/b]", true);
        this.areIdentical("test", htmlStr);
        htmlStr = parser.parseString("begin [b][i]test[/i] again[/b] end", true);
        this.areIdentical("begin test again end", htmlStr);
    };
    TestTokenizer.prototype.testEscapingHtmlOption = function () {
        var parser = new BBCodeParser(BBCodeParser.defaultTags());
        var htmlStr = parser.parseString('[b]String[/b] with <a href="">html</a><br/>');
        this.areIdentical('<b>String</b> with &lt;a href=""&gt;html&lt;/a&gt;&lt;br/&gt;', htmlStr);
        htmlStr = parser.parseString('[b]String[/b] with <a href="">html</a><br/> with no escaping html', false, true, false);
        this.areIdentical('<b>String</b> with <a href="">html</a><br/> with no escaping html', htmlStr);
    };
    return TestTokenizer;
}(tsUnit.TestClass));
var test = new tsUnit.Test();
test.addTestClass(new TestTokenizer());
test.showResults(document.getElementById("results"), test.run());

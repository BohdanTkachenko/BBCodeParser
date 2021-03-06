const Tokenizer = require('./tokenizer');
const TokenType = require('./TokenType');

//The types of the trees
var TreeType;
(function (TreeType) {
    TreeType[TreeType["Root"] = 0] = "Root";
    TreeType[TreeType["Text"] = 1] = "Text";
    TreeType[TreeType["Tag"] = 2] = "Tag";
})(TreeType || (TreeType = {}));
//Represents a parse tree
var BBCodeParseTree = (function () {
    //Creates a new parse tree
    function BBCodeParseTree(treeType, content, attributes, subTrees) {
        this.treeType = treeType;
        this.content = content;
        this.attributes = attributes;
        this.subTrees = subTrees;
        this.subTrees = new Array();
    }
    //Indicates if the current tree is valid
    BBCodeParseTree.prototype.isValid = function () {
        //An tree without subtrees is valid
        if (this.subTrees.length == 0) {
            return true;
        }
        //An tree is valid if all of its subtrees are valid
        for (var i in this.subTrees) {
            var currentTree = this.subTrees[i];
            if (currentTree == null || !currentTree.isValid()) {
                return false;
            }
        }
        return true;
    };
    //String representation of the tree
    BBCodeParseTree.prototype.toString = function () {
        return TreeType[this.treeType] + " - " + this.content;
    };
    //Builds a parse tree from the given string
    BBCodeParseTree.buildTree = function (str, bbTags) {
        //Get the tokens
        var tokenizer = new Tokenizer(bbTags);
        var tokens = tokenizer.tokenizeString(str);
        //Build the tree
        return BBCodeParseTree.buildTreeFromTokens(new BBCodeParseTree(TreeType.Root, str), tokens.reverse());
    };
    //Builds a tree from the given tokens
    BBCodeParseTree.buildTreeFromTokens = function (rootTree, tokens, currentTag) {
        if (currentTag === void 0) { currentTag = ""; }
        //The root root is invalid, return null
        if (rootTree == null) {
            return null;
        }
        //There are no more tokens, return the root
        if (tokens.length == 0) {
            return rootTree;
        }
        //Remove the first token
        var currentToken = tokens.pop();
        //Add the text token as a text parse tree
        if (currentToken.tokenType == TokenType.Text) {
            rootTree.subTrees.push(new BBCodeParseTree(TreeType.Text, currentToken.content));
        }
        //Create a new tag tree and find its subtrees
        if (currentToken.tokenType == TokenType.StartTag) {
            var tagName = currentToken.content;
            rootTree.subTrees.push(BBCodeParseTree.buildTreeFromTokens(new BBCodeParseTree(TreeType.Tag, tagName, currentToken.tagAttributes), tokens, tagName));
        }
        //Check if its the correct end tag
        if (currentToken.tokenType == TokenType.EndTag) {
            var tagName = currentToken.content;
            if (tagName == currentTag) {
                return rootTree;
            }
            else {
                return null;
            }
        }
        //If we got no more tokens, and we have opened an tag but not closed it, return null
        if (tokens.length == 0) {
            if (currentTag != "") {
                return null;
            }
        }
        //Proceed to the next token
        return BBCodeParseTree.buildTreeFromTokens(rootTree, tokens, currentTag);
    };
    return BBCodeParseTree;
}());

module.exports = BBCodeParseTree;
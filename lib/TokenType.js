//The type of a token
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Text"] = 0] = "Text";
    TokenType[TokenType["StartTag"] = 1] = "StartTag";
    TokenType[TokenType["EndTag"] = 2] = "EndTag";
})(TokenType || (TokenType = {}));

module.exports = TokenType;
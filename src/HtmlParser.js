function SimpleHtmlParser() {}

SimpleHtmlParser.prototype = {
  handler: null,

  // regexps

  startTagRe: /^<([^>\s\+-\/]+)((\s+[^=>\+-\s]+(\s*=\s*((\"[^"]*\")|(\'[^']*\')|[^>\s]+))?)*)\s*\/?\s*>/m,
  endTagRe: /^<\/([^>\s\+-]+)[^>]*>/m,
  attrRe: /([^=\s\+-]+)(\s*=\s*((\"([^"]*)\")|(\'([^']*)\')|[^>\s]+))?/gm,

  parse: function (s, oHandler) {
    s = s.replace(/\s/g, " ");
    let self = this;
    this.resume = false;
    if (oHandler) this.contentHandler = oHandler;

    var i = 0;
    var res, lc, lm, rc, index;
    var treatAsChars = false;
    var oThis = this;
    while (s.length > 0 && !this.resume) {
      s = this.trim(s);
      // Comment
      if (s.substring(0, 4) == "<!--") {
        index = s.indexOf("-->");
        if (index != -1) {
          this.contentHandler.comment(s.substring(4, index));
          s = s.substring(index + 3);
          treatAsChars = false;
        } else {
          treatAsChars = true;
        }
      }

      // end tag
      else if (s.substring(0, 2) == "</") {
        if (this.endTagRe.test(s)) {
          lc = RegExp.leftContext;
          lm = RegExp.lastMatch;
          rc = RegExp.rightContext;

          lm.replace(this.endTagRe, function () {
            self.resume = oThis.parseEndTag.apply(oThis, arguments);
            return self.resume;
          });

          s = rc;
          treatAsChars = false;
        } else {
          treatAsChars = true;
        }
      } else if (s.substring(0, 2) == "<%") {
        let index = s.indexOf("%>");
        s = s.substring(index + 2);
      }
      // start tag
      else if (s.charAt(0) == "<") {
        if (this.startTagRe.test(s)) {
          lc = RegExp.leftContext;
          lm = RegExp.lastMatch;
          rc = RegExp.rightContext;

          lm.replace(this.startTagRe, function () {
            return oThis.parseStartTag.apply(oThis, arguments);
          });

          s = rc;
          treatAsChars = false;
        } else {
          treatAsChars = true;
        }
      }

      if (treatAsChars) {
        index = s.indexOf("<");
        let temp = s.substring(index);
        temp = this.trim(temp);
        while (!(this.endTagRe.test(temp) || this.startTagRe.test(temp))) {
          temp = temp.substring(1);
          temp = this.trim(temp);
        }
        if (index == -1) {
          this.contentHandler.characters(s);
          s = "";
        } else {
          if (index == 0) {
            index = s.indexOf(s.substring(1));
          }
          this.contentHandler.characters(s.substring(0, index));
          s = s.substring(index);
        }
      }

      treatAsChars = true;
    }
  },

  parseStartTag: function (sTag, sTagName, sRest) {
    sTagName = this.trim(sTagName);
    var attrs = this.parseAttributes(sTagName, sRest);
    this.contentHandler.startElement(sTagName, attrs);
  },

  parseEndTag: function (sTag, sTagName) {
    sTagName = this.trim(sTagName);
    return this.contentHandler.endElement(sTagName);
  },

  parseAttributes: function (sTagName, s) {
    var oThis = this;
    var attrs = [];
    s.replace(this.attrRe, function (a0, a1, a2, a3, a4, a5, a6) {
      attrs.push(oThis.parseAttribute(sTagName, a0, a1, a2, a3, a4, a5, a6));
    });
    return attrs;
  },

  parseAttribute: function (sTagName, sAttribute, sName) {
    var value = "";
    if (arguments[7]) value = arguments[8];
    else if (arguments[5]) value = arguments[6];
    else if (arguments[3]) value = arguments[4];
    value = this.trim(value);
    sName = this.trim(sName);
    var empty = !value && !arguments[3];

    return {
      name: sName,
      value: empty ? null : value,
    };
  },
  trim: function (str) {
    if (str) {
      return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, "");
    }
    return str;
  },
};

let singleTags = ["img", "br", "hr", "input", "param", "meta", "link"];
let noUseTags = ["br", "hr"];

function Stack() {
  this.list = [];
}
Stack.prototype = {
  top: function () {
    return this.list[0];
  },
  pop: function () {
    return this.list.splice(0, 1)[0];
  },
  push: function (e) {
    return this.list.unshift(e);
  },
  walk: function (handler, context) {
    let len = this.list.length;
    let node = null;
    let flag = false;
    for (let i = 0; i < len; i++) {
      node = this.list[i];
      if (handler) {
        flag = handler.call(context, node, i);
        if (flag) {
          return;
        }
      }
    }
  },
};

function Element() {
  this.tagName;
  this.attrs;
  this.text;
  this.children = new Stack();
  this.parent;
}

module.exports = SimpleHtmlParser;

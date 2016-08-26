var LinterModel = function(){
    this._pieces = [];
    this._fullstring = null;

    this.stringSetted = new LinterEvent(this);

    //Default Settings
    this._defaults = {
      caretPos: null
    };

    //Javascript Keywords
    this.keywords = ['break', 'do', 'instanceof', 'typeof', 'case', 'else', 'new', 'var', 'catch', 'finally']
    .concat(['return', 'void', 'continue', 'for', 'switch', 'while', 'debugger'])
    .concat(['function','this', 'with', 'default', 'if', 'throw', 'delete', 'in', 'try']);

    //Brackets
    this.brackets = {
      '[':']',
      '{':'}',
      '(':')'
    };

    this.reverseMap = {
      ']':'[',
      '}':'{',
      ')':'('
    };

    this.punctuation = '.,/#!$%^&*;:=-_`~ \n';

    this.bracketsArr = null;
    this.tempcommentNumber = null;

    this.tempbracketAll = null;
};

LinterModel.prototype = {

  setFullString: function(string, options){
    this._fullstring = string;
    //Merge options if passed in
    if(options){
      $.extend(this._defaults, options);
    }
    this.processPieces();

    this.stringSetted.notify();
  },
  processPieces: function(){

    //to call helper use this.util;

    //Assign this to _self for the correct context binding
    var _self = this;
    var rownumber = 1;
    //Reset some variables
    this.bracketsArr = [];
    this._pieces = [];

    //Go over each characters
    //TODO: Refractor for more functions and improvement
    this.tempbracketAll = [];
    var turnOnBrMatch = false;
    var tempstr = null;

    Array.from(this._fullstring).forEach(function(char, index){

        var charPiece = this.checkGenerateSpecial(char, index, rownumber, turnOnBrMatch);
        if(charPiece){
          //if current char is special char
          if(tempstr !== null){
            this._pieces.push(this.generatePiece(tempstr, rownumber));
            tempstr = '';
          }
          turnOnBrMatch = charPiece.findMatch ? true : false;
          if(charPiece.findMatch){
            console.log('Need to find match');
          }
          this._pieces.push(charPiece);

          if(charPiece.isNewLine()){
            rownumber++;
          }
        }else{
          tempstr = (tempstr !== null) ? tempstr + char : char;
        }

        //Last character
        if (index === this._fullstring.length - 1) {
          if(tempstr){
            this._pieces.push(this.generatePiece(tempstr, rownumber));
          }
        }

    }.bind(_self));

    //Check balance brackets
    this.checkBracket();

    //Check for matched bracket
    this.matchBracket(this.bracketsArr);
  },
  getPieces: function(){
    return this._pieces;
  },
  getErrorPieces: function(){
    return this._pieces.filter(function(piece){
      return piece.error !== undefined;
    });
  },
  checkGenerateBracket:function(char, index, rownum, turnOnBrMatch){
    //Check and Generate Bracket piece
    if(!char){return false;}
    if(char in this.brackets || char in this.reverseMap){
      var caretpos = this._defaults.caretPos;
      var piece = this.generatePiece(char, rownum);

      piece.index = index;
      piece.type = 'bracket';
      this.bracketsArr.push(piece);

      if(!turnOnBrMatch){
        var findMatch = false;
        if(index === caretpos){
          findMatch = true;
        }else if(caretpos === index + 1){
          findMatch = true;
        }
        piece.findMatch = findMatch;
      }
      this.tempbracketAll.push(piece);
      return piece;
    }
    return false;
  },
  matchBracket: function(bracketsArr){
    //Find the flagged bracket
    var findmatch = null;
    var matched = null;
    var findMatchIndex = null;
    var _self = this;
    findmatch = this.tempbracketAll.find(function(pieceObj, index){
        if(pieceObj.findMatch){findMatchIndex = index;}
        return pieceObj.findMatch;
    });
    findmatch = findMatchIndex ? bracketsArr[findMatchIndex] : null;
    //determine the search direction

    if(findmatch){
      if(findmatch.string in this.brackets){
        //search forward
        matched = bracketsArr.slice(findMatchIndex).find(function(piece){
          return piece.string === _self.brackets[findmatch.string];
        });
      }else{
        //search backward
        matched = bracketsArr.slice(0, findMatchIndex).reverse().find(function(piece){
          return piece.string === _self.reverseMap[findmatch.string];
        });
      }
      if(matched){
        matched.matched = true;
        findmatch.matched = true;
      }
    }
  },
  checkBracket: function(){
    var tmpBracketArr = [];
    var currentPiece = null;

    for (var ii = 0; ii < this.bracketsArr.length; ii++) {
      currentPiece = this.bracketsArr[ii];

      if(currentPiece.string in this.brackets){
        tmpBracketArr.push(this.brackets[currentPiece.string]);
      }else if(currentPiece.string in this.reverseMap){
        if(tmpBracketArr.length === 0 || tmpBracketArr.pop() !== currentPiece.string){
          var errorPiece = (ii-1 > 0 ? this.bracketsArr[ii-1] : currentPiece);
          this.util.assignError(errorPiece);
          return;
        }
      }
    }
    if(tmpBracketArr.length !== 0){
      this.util.assignError(currentPiece);
    }
  },
  checkGenerateSpecial: function(char, index, rownumber, turnOnBrMatch){
    var charPiece = this.checkGenerateBracket(char, index, rownumber, turnOnBrMatch);
    if(charPiece){return charPiece;}
    if(this.punctuation.indexOf(char) !== -1){
      return this.generatePiece(char, rownumber);
    }
    return false;
  },
  generatePiece: function(str, rownumber){
    var type = this.isKeyword(str) ? 'keyword' : 'text';
    var piece = {string: str, rownum: rownumber, type: type};
    $.extend(piece, PieceModel);
    return piece;
  },
  isKeyword: function(piece){
    return (this.keywords.indexOf(piece) !== -1);
  },
};

//PieceModel for decoration extend
var PieceModel = {
  isNewLine: function(){
    return this.string === '\n';
  }
};

//Helper Functions
LinterModel.prototype.util = {
  assignError: function(piece){
    piece.error = {type: 'bracket'};
  }
};

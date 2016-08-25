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

    this.punctuation = '.,/#!$%^&*;:=-_`~ ';

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

    //to call help use this.util;

    //Assign this to _self for the correct context binding
    var _self = this;
    var rownumber = 1;
    //Reset some variables
    this.bracketsArr = [];

    this.tempbracketAll = [];

    //Go over each characters
    //TODO: Refractor later, not efficient

    this._pieces = this._fullstring.split('\n').map(function(row, index){
        var rowresult = [];
        var tempstr = null;

        if(!row){
          //Empty row
          rowresult.push(this.util.generatePiece('&nbsp;', rownumber));
          rownumber++;
        }

        //Process Each splitted row
        Array.from(row).forEach(function(char, index){
          if (this.isSpecial(char)) {
            if(tempstr !== null){
              rowresult.push(this.assignPieceType( this.util.generatePiece(tempstr, rownumber) ));
              tempstr = '';
            }

            var charObj = this.util.generatePiece(char, rownumber);
            this.storeBracket(charObj);
            rowresult.push(charObj);

          } else {
            tempstr = (tempstr !== null) ? tempstr + char : char;
          }

          //Last character
          if (index === row.length - 1) {
            if(tempstr){
              rowresult.push(this.assignPieceType( this.util.generatePiece(tempstr, rownumber) ));
              tempstr = '';
            }
            rownumber++;
          }

        }.bind(_self));

        return rowresult;
    }.bind(_self)).reduce(function(a, b){
      return a.concat(b);
    },[]);

    //Check balance brackets
    this.checkBracket();

  },
  getPieces: function(){
    return this._pieces;
  },
  getErrorPieces: function(){
    return this._pieces.filter(function(piece){
      return piece.error !== undefined;
    });
  },
  assignPieceType: function(piece){
    //TODO check for comment

    //default type to text
    piece.type = 'text';

    //Check for keyword
    if(this.isKeyword(piece.string)){
      piece.type='keyword';
      return piece;
    }
    return piece;
  },
  storeBracket: function(piece){
    var str = piece.string;
    if(!str){return;}
    if(str in this.brackets || str in this.reverseMap){
      this.bracketsArr.push(piece);
    }
  },
  matchBracket: function(bracketsArr){
    //Find the flagged bracket
    var findmatch = null;
    var findMatchIndex = null;
    findmatch = bracketsArr.find(function(pieceObj, index){
        if(pieceObj.findMatch){findMatchIndex = index;}
        return pieceObj.findMatch;
    });
    //determine the search direction
    var matched = null;

    if(findmatch.string in this.brackets){
      //search forward
      matched = bracketsArr.slice(findMatchIndex).find(function(piece){
        return piece.string === this.brackets[findmatch.string];
      });
    }else{
      //search backward
      matched = bracketsArr.slice(0, findMatchIndex).reverse().find(function(piece){
        return piece.string === this.reverseMap[findmatch.string];
      });
    }
    if(matched){
      matched.matched = true;
      findmatch.matched = true;
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
  isSpecial: function(char){
    return (char in this.brackets || char in this.reverseMap || this.punctuation.indexOf(char) !== -1);
  },
  isKeyword: function(piece){
    return (this.keywords.indexOf(piece) !== -1);
  },
};

//Helper Functions
LinterModel.prototype.util = {
  generatePiece: function(str, rownumber){
    return {
      string: str,
      rownum: rownumber
    };
  },
  assignError: function(piece){
    piece.error = {type: 'bracket'};
  }
};


var Linter = function(){
    this.rows = [];
    this.keywords = ["break", "do", "instanceof", "typeof", "case", "else", "new", "var", "catch", "finally", "return", "void", "continue", "for", "switch", "while", "debugger", "function", "this", "with", "default", "if", "throw", "delete", "in", "try"];
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
    this.bracketsArr = null;
    this.punctuation = ".,/#!$%^&*;:=-_`~ ";
    this.tempcommentNumber = null;
};

Linter.prototype = {
  setPieces: function(string){
    //Assign Row Number
    var _self = this;
    var rownumber = 1;

    function genPieceObj(str, rownum){
      return {
        string: str,
        rownum: rownum
      };
    }
    this.bracketsArr = [];
    this.rows = string.split('\n').map(function(row, index){
      var rowresult = [];
      var tempstr = null;
      var tempsp = '';

      if(!row){
        //Empty row
        rowresult.push(genPieceObj('&nbsp;', rownumber));
        rownumber++;
      }

      Array.from(row).forEach(function(char, index){
        if (this.isSpecial(char)) {
          if(tempstr !== null){
            rowresult.push(this.assignType( genPieceObj(tempstr, rownumber) ));
            tempstr = '';
          }

          var charObj = genPieceObj(char, rownumber);
          this.storeBracket(charObj);
          rowresult.push(charObj);

        } else {
          tempstr = (tempstr !== null) ? tempstr + char : char;
        }

        //Last character
        if (index === row.length - 1) {
          if(tempstr){
            rowresult.push(this.assignType( genPieceObj(tempstr, rownumber) ));
            tempstr = '';
          }
          rownumber++;
        }
      }.bind(_self));

      return rowresult;

    }).reduce(function(a, b){
      return a.concat(b);
    },[]);

    //Check balance brackets
    this.checkBracket();
  },
  getPieces: function(){
    return this.rows;
  },
  getErrorPieces: function(){
    return this.rows.filter(function(pieceObj){
      return pieceObj.error !== undefined;
    });
  },
  assignType: function(pieceObj){
    //Check for comment
    pieceObj.type = 'text';
    var str = pieceObj.string;
    if(this.isComment(pieceObj)){
      pieceObj.type = 'comment';
      return pieceObj;
    }

    //Check for keyword
    if(this.isKeyword(str)){
      pieceObj.type='keyword';
      return pieceObj;
    }
    return pieceObj;

  },
  storeBracket: function(pieceObj){
    var str = pieceObj.string;
    if(!str){return;}
    if(str in this.brackets || str in this.reverseMap){
      this.bracketsArr.push(pieceObj);
    }
  },
  checkBracket: function(){
    var tmpBracketArr = [];
    function assignBracketError(pieceObj){
      $.extend(pieceObj, {
        error: {type:'bracket'}
      });
    };

    for (var ii = 0; ii < this.bracketsArr.length; ii++) {
      var pieceObj = this.bracketsArr[ii];
      if(pieceObj.string in this.brackets){
        tmpBracketArr.push(this.brackets[pieceObj.string]);
      }else if(pieceObj.string in this.reverseMap){

        if(tmpBracketArr.length === 0 || tmpBracketArr.pop() !== pieceObj.string){
          assignBracketError(pieceObj);
          return;
        }
      }
    }
    if(tmpBracketArr.length !== 0){
      assignBracketError(pieceObj);
    }

  },
  isSpecial: function(char){
    return (char in this.brackets || char in this.reverseMap || this.punctuation.indexOf(char) !== -1);
  },
  isComment: function(obj){
    var str = obj.string;
    if(str === '//'){
      this.tempcommentNumber = obj.rowNumber;
      return true;
    }else if(this.tempcommentNumber === obj.rowNumber){
      return true;
    }else {
      this.tempcommentNumber = null;
    }
    return false;
  },
  isKeyword: function(piece){
    return (this.keywords.indexOf(piece) !== -1);
  }
}

/*
var mylinter = new Linter();
var str = "// Hello World,\nvar function,\nyes yes yes,";
mylinter.setPieces(str);
console.log( mylinter.getPieces() );
*/

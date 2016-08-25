var JSLinterUI = function(){

}
JSLinterUI.prototype = {
    init: function(options){

      this.linter = new Linter();
      this.$textarea = $('<textarea>').addClass('form-control');
      this.$codearea = $('<div>');
      this.$whiteboard = $('<div>').addClass('whiteboard');
      this.$textareapanel = $(options['textarea-panel']);
      this.$whiteboardpanel = $(options['whiteboard-panel']);
      this.$codeareapanel = $(options['codearea-panel']);

      this.render();
      this.bindEvents();

    },
    bindEvents: function(){
      this.$textarea.bind('input propertychange, keyup', function(e){
        this.linter.setFullString(this.$textarea.val(), {caretPos: this.$textarea.prop('selectionStart')});
        this.renderCodearea();
        this.renderWhiteboard();
      }.bind(this));
    },
    render: function(){
        this.$codeareapanel.append(this.$codearea);
        this.$textareapanel.append(this.$textarea);
        this.$whiteboardpanel.append(this.$whiteboard);
        this.renderCodearea();
        this.renderWhiteboard();
    },
    renderCodearea: function(){
        this.$codearea.empty();
        var pieces = this.linter.getPieces();
        var currentRow = null;

        //helper function TODO Move out function scope later
        function genrow(){
          var $rowdiv = $('<div>').addClass('coderow');
          var $rowgutter = $('<div>').addClass('linenumber');
          var $rowpre = $('<pre>');
          $rowdiv.append($rowgutter).append($rowpre);
          return {
            $div: $rowdiv,
            $gutter: $rowgutter,
            $pre: $rowpre,
            rownum: null
          };
        }

        pieces.forEach(function(pieceObj){

          if(!currentRow || currentRow.rownum !== pieceObj.rownum){
              currentRow = genrow();
              currentRow.$gutter.html(pieceObj.rownum);
              currentRow.rownum = pieceObj.rownum;
              this.$codearea.append(currentRow.$div);
          }

          var type = pieceObj.type;
          var $el = $('<span>').html(pieceObj.string);
          switch(type){
            case 'keyword':
              $el.addClass('js-keyword');
              break;
            case 'comment':
              $el.addClass('js-comment');
              break;
            default:
              break;
          }
          $el.html(pieceObj.string);
          currentRow.$pre.append($el);
        }.bind(this));
    },
    renderWhiteboard: function(){
      this.$whiteboard.empty();
      var messages = this.linter.getErrorPieces();
      messages.forEach(function(pieceObj){
        var div = $('<div>').addClass('alert-info js-message');
        div.html("Unmatch '" + pieceObj.string + "' at line "+pieceObj.rownum)
        this.$whiteboard.append(div);
      }.bind(this));
    }
};

var LinterView = function(model, elements){
  this._model = model;
  this._elements = elements;

  var _self = this;

  this.textareaModified = new LinterEvent(this);

  //Attach Model listener
  this._model.stringSetted.attach(function(){
    _self.render();
  });

};

LinterView.prototype = {
  init: function(){
    this._elements.$textarea = $('<textarea>').addClass('form-control');
    this._elements.$codearea = $('<div>');
    this._elements.$whiteboard = $('<div>').addClass('whiteboard');

    this._elements.$codeareapanel.append(this._elements.$codearea);
    this._elements.$textareapanel.append(this._elements.$textarea);
    this._elements.$whiteboardpanel.append(this._elements.$whiteboard);

    this.bindEvents();
    this.render();
  },
  bindEvents: function(){
    var _self = this;
    this._elements.$textarea.on('input propertychange, keyup', function(e){
      var $el = $(e.target);
      _self.textareaModified.notify([$el.val(), {caretPos: $el.prop('selectionStart')}]);
    });
  },
  render: function(){
    this.renderCodearea();
    this.renderWhiteboard();
  },
  renderCodearea: function(){
    this._elements.$codearea.empty();
    var pieces = this._model.getPieces();

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
          this._elements.$codearea.append(currentRow.$div);
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
    this._elements.$whiteboard.empty();
    var messages = this._model.getErrorPieces();
    messages.forEach(function(pieceObj){
      var div = $('<div>').addClass('alert-info js-message');
      div.html("Unmatch '" + pieceObj.string + "' at line "+pieceObj.rownum);
      this._elements.$whiteboard.append(div);
    }.bind(this));
  }
};

var LinterController = function(model, view){
  this._model = model;
  this._view = view;

  var _self = this;

  //listener
  this._view.textareaModified.attach(function(sender, args){
    _self.updateFullString(args[0], args[1]);
  });
};

LinterController.prototype = {
  updateFullString: function(string, options){
    this._model.setFullString(string, options);
  }
};


var LinterApp = function(){
    var model = new LinterModel();
    var view = new LinterView(model,{
      '$textareapanel':$('.textarea-panel'),
      '$whiteboardpanel':$('.whiteboard-panel'),
      '$codeareapanel':$('.codearea-panel')
    });

    var controller = new LinterController(model, view);

    this.start = function(){
      view.init();
    };
};

var mylinterapp = new LinterApp();
mylinterapp.start();

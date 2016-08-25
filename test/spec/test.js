(function () {
  'use strict';

  describe('Linter', function () {
    describe('Linter getPieces', function () {
      var mylinter = new Linter();

      mylinter.setPieces("// Hello World,\nvar function,\nyes yes yes,");

      it('should return an array', function () {
         expect(mylinter.getPieces()).to.be.an('array');
      });
      it('should return correct number of pieces', function () {
         
      });
    });
  });
})();

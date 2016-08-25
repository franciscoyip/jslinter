(function () {
  'use strict';

  describe('Linter', function () {
    describe('Linter getPieces', function () {
      var mylinter = new Linter();
      console.log(mylinter.getPieces());
      mylinter.setPieces('// Hello World,\nvar function,\nyes yes yes,');
      it('should return an array', function () {
         expect(mylinter.getPieces()).to.be.an('array');
         expect(mylinter.getPieces().length).to.equal(17);
         console.log(mylinter.getPieces());
      });
    });
  });
})();

(function () {
  'use strict';

  var $ = window.jQuery;
  var _ = window._;
  var chai = window.chai;
  var mocha = window.mocha;
  var Backbone = window.Backbone;
  var Rec = window.Rec;

  mocha.setup('bdd');
  chai.should();

  var after = window.after;
  var before = window.before;
  var beforeEach = window.beforeEach;
  var describe = window.describe;
  var it = window.it;

  describe('Rec', function () {
    describe('constructor(options)', function () {
      it('always sets an `$el` property', function () {
        (new Rec()).$el.should.be.an.instanceOf($);
        (new Rec({el: 'body'})).$el.should.be.an.instanceOf($);
        (new Rec({el: '<div>'})).$el.should.be.an.instanceOf($);
      });

      it('copies options onto the instance', function () {
        var rec = new Rec({delay: 1, limit: 2, cache: false});
        rec.delay.should.equal(1);
        rec.limit.should.equal(2);
        rec.cache.should.equal(false);
      });
    });

    describe('setElement(el)', function () {
      var rec;

      beforeEach(function () { rec = new Rec({el: '<div>'}); });

      it('returns `this`', function () {
        rec.setElement().should.equal(rec);
      });

      it('turns into an empty jQuery object if not passed', function () {
        rec.setElement().$el.should.be.an.instanceOf($);
      });

      it('is converted from raw html to a jQuery object', function () {
        rec.setElement('<div data-test="value">').$el
          .should.be.an.instanceOf($);
        rec.$el.data('test').should.equal('value');
      });

      it('is converted from a DOM element to a jQuery object', function () {
        rec.setElement($('<div data-test="value">')[0]).$el
          .should.be.an.instanceOf($);
        rec.$el.data('test').should.equal('value');
      });

      it('is simply reference if already a jQuery object', function () {
        var $el = $();
        rec.setElement($el).$el.should.equal($el);
      });

      it('removes rec events from the previous $el', function () {
        var $el = rec.$el[0];
        rec.setElement();
        _.size($._data($el, 'events')).should.equal(0);
      });

      it('binds rec events to the new $el', function () {
        var $el = $('<div>');
        rec.setElement($el);
        _.size($._data(rec.$el[0], 'events')).should.be.above(0);
      });
    });

    describe('parse(q)', function () {
      it('strips extra spaces and downcases', function () {
        Rec.prototype.parse('  a  B\t$\t  ').should.equal('a b $');
      });
    });

    describe('filter(q, result)', function () {
      it('matches with nGram-ish logic', function () {
        var filter = Rec.prototype.filter;
        var alex = new Backbone.Model({name: 'Alex'});
        filter('a', alex).should.be.ok;
        filter('b', alex).should.not.be.ok;
        filter('a b', alex).should.not.be.ok;
        var bret = new Backbone.Model({name: 'Bret'});
        filter('a', bret).should.not.be.ok;
        filter('b', bret).should.be.ok;
        filter('a b', bret).should.not.be.ok;
        var albert = new Backbone.Model({name: 'Albert'});
        filter('a', albert).should.be.ok;
        filter('b', albert).should.be.ok;
        filter('a b', albert).should.be.ok;
      });
    });

    describe('fetch(q, cb)', function () {
      var ajax = $.ajax;
      var rec;

      before(function () {
        $.ajax = function (options) { return options; };
        rec = new Rec({
          fetchOptions: {
            data: {a: 1},
            type: 'getitgirl'
          },
          queryKey: 'obscure'
        });
      });

      it('merges fetchOptions into the jqXHR object', function () {
        rec.fetch().data.a.should.equal(1);
        rec.fetch('query').data.obscure.should.equal('query');
      });

      after(function () {
        $.ajax = ajax;
      });
    });
  });

  mocha.run();
})();

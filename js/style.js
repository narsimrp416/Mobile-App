//
// Here is how to define your module
// has dependent on mobile-angular-ui
//
var app = angular.module('MobileAngularUiExamples', [
  'ngRoute',
  'mobile-angular-ui',

  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures'
]);

//
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false'
// in order to avoid unwanted routing.
//
app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'home.html', reloadOnSearch: false});
  $routeProvider.when('/scroll',        {templateUrl: 'pages/scroll.html', reloadOnSearch: false});
  $routeProvider.when('/toggle',        {templateUrl: 'pages/toggle.html', reloadOnSearch: false});
  $routeProvider.when('/tabs',          {templateUrl: 'pages/tabs.html', reloadOnSearch: false});
  $routeProvider.when('/accordion',     {templateUrl: 'pages/accordion.html', reloadOnSearch: false});
  $routeProvider.when('/overlay',       {templateUrl: 'pages/overlay.html', reloadOnSearch: false});
  $routeProvider.when('/forms',         {templateUrl: 'pages/forms.html', reloadOnSearch: false});
  $routeProvider.when('/dropdown',      {templateUrl: 'pages/dropdown.html', reloadOnSearch: false});
  $routeProvider.when('/drag',          {templateUrl: 'pages/drag.html', reloadOnSearch: false});
  $routeProvider.when('/carousel',      {templateUrl: 'pages/carousel.html', reloadOnSearch: false});
});

//
// `$drag` example: drag to dismiss
//
app.directive('dragToDismiss', function($drag, $parse, $timeout){
  return {
    restrict: 'A',
    compile: function(elem, attrs) {
      var dismissFn = $parse(attrs.dragToDismiss);
      return function(scope, elem, attrs){
        var dismiss = false;

        $drag.bind(elem, {
          constraint: {
            minX: 0,
            minY: 0,
            maxY: 0
          },
          move: function(c) {
            if( c.left >= c.width / 4) {
              dismiss = true;
              elem.addClass('dismiss');
            } else {
              dismiss = false;
              elem.removeClass('dismiss');
            }
          },
          cancel: function(){
            elem.removeClass('dismiss');
          },
          end: function(c, undo, reset) {
            if (dismiss) {
              elem.addClass('dismitted');
              $timeout(function() {
                scope.$apply(function() {
                  dismissFn(scope);
                });
              }, 400);
            } else {
              reset();
            }
          }
        });
      };
    }
  };
});

//
// Another `$drag` usage example: this is how you could create
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function(){
  return {
    restrict: 'C',
    scope: {},
    controller: function($scope) {
      this.itemCount = 0;
      this.activeItem = null;

      this.addItem = function(){
        var newId = this.itemCount++;
        this.activeItem = this.itemCount == 1 ? newId : this.activeItem;
        return newId;
      };

      this.next = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem == this.itemCount - 1 ? 0 : this.activeItem + 1;
      };

      this.prev = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
      };
    }
  };
});

app.directive('carouselItem', function($drag) {
  return {
    restrict: 'C',
    require: '^carousel',
    scope: {},
    transclude: true,
    template: '<div class="item"><div ng-transclude></div></div>',
    link: function(scope, elem, attrs, carousel) {
      scope.carousel = carousel;
      var id = carousel.addItem();

      var zIndex = function(){
        var res = 0;
        if (id == carousel.activeItem){
          res = 2000;
        } else if (carousel.activeItem < id) {
          res = 2000 - (id - carousel.activeItem);
        } else {
          res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
        }
        return res;
      };

      scope.$watch(function(){
        return carousel.activeItem;
      }, function(n, o){
        elem[0].style['z-index']=zIndex();
      });


      $drag.bind(elem, {
        constraint: { minY: 0, maxY: 0 },
        adaptTransform: function(t, dx, dy, x, y, x0, y0) {
          var maxAngle = 15;
          var velocity = 0.02;
          var r = t.getRotation();
          var newRot = r + Math.round(dx * velocity);
          newRot = Math.min(newRot, maxAngle);
          newRot = Math.max(newRot, -maxAngle);
          t.rotate(-r);
          t.rotate(newRot);
        },
        move: function(c){
          if(c.left >= c.width / 4 || c.left <= -(c.width / 4)) {
            elem.addClass('dismiss');
          } else {
            elem.removeClass('dismiss');
          }
        },
        cancel: function(){
          elem.removeClass('dismiss');
        },
        end: function(c, undo, reset) {
          elem.removeClass('dismiss');
          if(c.left >= c.width / 4) {
            scope.$apply(function() {
              carousel.next();
            });
          } else if (c.left <= -(c.width / 4)) {
            scope.$apply(function() {
              carousel.next();
            });
          }
          reset();
        }
      });
    }
  };
});


//
// For this trivial demo we have just a unique MainController
// for everything
//
app.controller('MainController', function($rootScope, $scope){

  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;

  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
    $rootScope.loading = false;
  });

  // Fake text i used here and there.
  $scope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel explicabo, aliquid eaque soluta nihil eligendi adipisci error, illum corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';

  //
  // 'Scroll' screen
  //
  var scrollItems = [];

  for (var i=1; i<=100; i++) {
    scrollItems.push('Item ' + i);
  }

  $scope.scrollItems = scrollItems;

  $scope.bottomReached = function() {
    alert('Congrats you scrolled to the end of the list!');
  }

  //
  // Right Sidebar
  //
  $scope.chatUsers = [
    { name: 'Carlos  Flowers', online: true },
    { name: 'Byron Taylor', online: true },
    { name: 'Jana  Terry', online: true },
    { name: 'Darryl  Stone', online: true },
    { name: 'Fannie  Carlson', online: true },
    { name: 'Holly Nguyen', online: true },
    { name: 'Bill  Chavez', online: true },
    { name: 'Veronica  Maxwell', online: true },
    { name: 'Jessica Webster', online: true },
    { name: 'Jackie  Barton', online: true },
    { name: 'Crystal Drake', online: false },
    { name: 'Milton  Dean', online: false },
    { name: 'Joann Johnston', online: false },
    { name: 'Cora  Vaughn', online: false },
    { name: 'Nina  Briggs', online: false },
    { name: 'Casey Turner', online: false },
    { name: 'Jimmie  Wilson', online: false },
    { name: 'Nathaniel Steele', online: false },
    { name: 'Aubrey  Cole', online: false },
    { name: 'Donnie  Summers', online: false },
    { name: 'Kate  Myers', online: false },
    { name: 'Priscilla Hawkins', online: false },
    { name: 'Joe Barker', online: false },
    { name: 'Lee Norman', online: false },
    { name: 'Ebony Rice', online: false }
  ];

  //
  // 'Forms' screen
  //
  $scope.rememberMe = true;
  $scope.email = 'me@example.com';

  $scope.login = function() {
    alert('You submitted the login form');
  };

  //
  //Exit App on Back Button
  //
  document.addEventListener('backbutton', function(event){
  event.preventDefault(); // EDIT
  navigator.app.exitApp(); // exit the app
});

  //
  // 'Drag' screen
  //
  $scope.notices = [];

  for (var j = 0; j < 10; j++) {
    $scope.notices.push({icon: 'envelope', message: 'Notice ' + (j + 1) });
  }

  $scope.deleteNotice = function(notice) {
    var index = $scope.notices.indexOf(notice);
    if (index > -1) {
      $scope.notices.splice(index, 1);
    }
  };
});
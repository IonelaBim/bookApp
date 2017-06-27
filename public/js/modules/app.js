var app = angular.module('myApp', ['ui.router','ui.bootstrap.modal','ngResource','ngMessages','ngCookies','base64']);

app.config(['$stateProvider','$urlRouterProvider', function($stateProvider,$urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider
        .state('home', {
            url: '/home',
            views: {
                '': { templateUrl: 'views/home.html',
                       controller:'mainCtrl'
                }
            }
        })
        .state('signup', {
            url: '/signup',
            views: {
                '': { templateUrl: 'views/signup.html',
                      controller:'authCtrl' }
            }
        })

        .state('login', {
            url: '/login',
            views: {
                '': { templateUrl: 'views/login.html',
                    controller:'authCtrl' }
            }
        })

        .state('books', {
            url: '/books',
            views: {
                '': { templateUrl: 'views/books.html',
                    controller:'booksCtrl',
                    }
            }
        })



}]);

app.run([ '$rootScope','$state','$stateParams',  function( $rootScope,$state,$stateParams) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

        if ($rootScope.isLoggedIn == false && toState.name === "books") {
            event.preventDefault();
            $state.transitionTo("login", null, {notify: false});
            $state.go('login');
        }
    });
}]);



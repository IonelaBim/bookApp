var app = angular.module('myApp', ['ui.router','ngResource','ngMessages']);

app.config(['$stateProvider','$urlRouterProvider', function($stateProvider,$urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider
        .state('home', {
            url: '/home',
            views: {
                '': { templateUrl: 'views/home.html'
                }
            }
        })
        .state('signup', {
            url: '/signup',
            views: {
                '': { templateUrl: 'views/signup.html',
                      controller:'myController' }
            }
        })

        .state('login', {
            url: '/login',
            views: {
                '': { templateUrl: 'views/login.html',
                    controller:'myController' }
            }
        })



}]);


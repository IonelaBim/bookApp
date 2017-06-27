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
                    controller:'booksCtrl' }
            }
        })



}]);


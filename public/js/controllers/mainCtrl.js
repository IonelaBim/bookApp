app.controller('mainCtrl', ['$scope','$rootScope','LoginService','$state','$cookies',function($scope,$rootScope, LoginService,$state,$cookies) {
    $scope.firstName = "John";
    $('.nav a').on('click', function () {
        if ($(".navbar-toggle").is(":visible")) { $(".navbar-toggle").trigger("click"); } //bootstrap 3.x
    });

    $scope.$watch(function(){
        return $cookies.getObject("isLoggedIn");
    }, function(isLoggedIn){
        if(isLoggedIn) {
            $rootScope.isLoggedIn=true;

        } else  {
            $rootScope.isLoggedIn=false;
            //$state.go('login');
        }
    });

    $scope.Logout = function() {
       LoginService.Logout({}, function(data) {
            console.log('logout succ');
            $state.go('home');

        }, function(err) {
            console.log('logout',err);
        });
    }

}]);
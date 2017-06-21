app.controller('mainCtrl', ['$scope','$rootScope','LoginService','$state','$cookies',function($scope,$rootScope, LoginService,$state,$cookies) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
    $scope.$watch(function(){
        return $cookies.getObject("isLoggedIn");
    }, function(isLoggedIn){
        if(isLoggedIn) {
            $rootScope.isLoggedIn=true;

        } else  {
            $rootScope.isLoggedIn=false;
            $state.go('login');
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
app.controller('mainCtrl', ['$scope','$rootScope','LoginService','$state','$cookies','$base64',function($scope,$rootScope, LoginService,$state,$cookies,$base64) {
    $scope.firstName = "John";
    $('.nav a').on('click', function () {
        if ($(".navbar-toggle").is(":visible")) { $(".navbar-toggle").trigger("click"); } //bootstrap 3.x
    });

    $scope.$watch(function(){
        return $cookies.getAll();
    }, function(cookiesData){
        if(cookiesData.isLoggedIn) {
            $rootScope.isLoggedIn=true;
            $rootScope.uid=$base64.decode(cookiesData.isLoggedIn);
            $rootScope.userName=$base64.decode(cookiesData.fNa) +" "+ $base64.decode(cookiesData.lNa);

        } else  {
            $rootScope.isLoggedIn=false;
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
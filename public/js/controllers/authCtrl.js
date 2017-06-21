app.controller('authCtrl', ['$scope','LoginService','$state',function($scope,LoginService,$state) {
    $scope.loginSubmitForm=function(){
        if ($scope.loginUserForm.$valid){
            $scope.loginUser();
        }else{
            angular.forEach($scope.loginUserForm.$error.required, function(field) {
                field.$setDirty();
            });
        }
    }
    //
    $scope.loginUser = function() {
        LoginService.Login({}, $scope.user, function(data) {
            $state.go('books');

        }, function(err) {
            console.log('sadasd',err);

            $scope.errorLoginMessage=err.data.errMsg;
            $scope.visibleErrorLoginMessage=true;
        }); //end .login function
    } //end loginUser fun

    $scope.signUpSubmitForm=function(){
        if ($scope.signupUserForm.$valid){
            $scope.signupUser();
        }else{
            angular.forEach($scope.signupUserForm.$error.required, function(field) {
                field.$setDirty();
            });
        }
    }
    //
    $scope.signupUser = function() {
        console.log($scope.userInfo);
        LoginService.SignUp({}, $scope.userInfo, function(data) {
            $state.go('books');

        }, function(err) {
            console.log('signupErr',err);

            $scope.errorLoginMessage=err.data.errMsg;
            $scope.visibleErrorLoginMessage=true;
        }); //end .login function
    } //end loginUser fun


}]);
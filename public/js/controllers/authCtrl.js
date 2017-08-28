app.controller('authCtrl', ['$scope','LoginService','$state',function($scope,LoginService,$state) {
    //validate login form
    $scope.loginSubmitForm=function(){
        if ($scope.loginUserForm.$valid){
            $scope.loginUser();
        }else{
            angular.forEach($scope.loginUserForm.$error.required, function(field) {
                field.$setDirty();
            });
        }
    }
    //Login function
    $scope.loginUser = function() {
        LoginService.Login({}, $scope.user, function(data) {
            $state.go('books');

        }, function(err) {
            console.log(err);
            $scope.errorLoginMessage=err.data ? err.data.errMsg : 'InternalError' ;
            $scope.visibleErrorLoginMessage=true;
        }); //end .login function
    }

    //validate signup form
    $scope.signUpSubmitForm=function(){
        if ($scope.signupUserForm.$valid){
            $scope.signupUser();
        }else{
            angular.forEach($scope.signupUserForm.$error.required, function(field) {
                field.$setDirty();
            });
        }
    }
    //SignUp function
    $scope.signupUser = function() {
        LoginService.SignUp({}, $scope.userInfo, function(data) {
            $state.go('books');

        }, function(err) {
            $scope.errorSignUpMessage=err.data.errMsg;
            $scope.visibleErrorSignUpMessage=true;
        });
    }


}]);
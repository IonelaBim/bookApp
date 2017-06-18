app.controller('myCtrl', ['$scope','LoginService',function($scope,LoginService) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
    $scope.loggedinFlag=true;

    //
    // $scope.loginSubmitForm=function(){
    //     if ($scope.loginUserForm.$valid){
    //         $scope.loginUser();
    //     }else{
    //         angular.forEach($scope.loginUserForm.$error.required, function(field) {
    //             field.$setDirty();
    //         });
    //     }
    // }
    //
    // $scope.loginUser = function() {
    //     $scope.loading = true;
    //     LoginService.Login({}, $scope.userData, function(data) {
    //
    //         $scope.loading = false;
    //         $state.go('bookView');
    //
    //     }, function(err) {
    //         $scope.loading = false;
    //         $scope.errorLoginMessage=err.status;
    //         if(err.status==404){
    //             $scope.errorLoginMessage="_ER_InvalidLoginCredentials";
    //         }
    //
    //         $scope.visibleErrorLoginMessage=true;
    //         console.log(err);
    //     }); //end .login function
    // } //end loginUser fun
}]);
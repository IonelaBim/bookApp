app.controller('booksCtrl', ['$scope','$rootScope','BooksManagementServices','$state',function($scope,$rootScope,BooksManagementServices,$state) {

    BooksManagementServices.getAllBooks({},function(data, getResponseHeaders) {
        $scope.books = data.data;
    }, function(error) {
        console.log(error);
    });

    $scope.AddNewBook = function(){
        if ($scope.addNewBookForm.$valid){
            $scope.book.ownerId= $rootScope.uid;
            BooksManagementServices.addNewBook({}, $scope.book, function(data) {
                console.log("succ");
                $scope.closeModal();
                $state.reload()
            }, function(err) {
                console.log('add a new book ERROR ',err);

            });
        }else{
            angular.forEach($scope.addNewBookForm.$error.required, function(field) {
                field.$setDirty();
            });
        }

    }

    $scope.showAddBookModal = function(){
        $scope.AddNewBookModal=true;
    }

    $scope.closeModal = function(){
        $scope.AddNewBookModal=false;
        $scope.newBook={};
        $scope.addNewBookForm.$setPristine();
    }
}]);
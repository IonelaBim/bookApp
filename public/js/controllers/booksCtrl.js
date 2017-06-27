app.controller('booksCtrl', ['$scope','$rootScope','BooksManagementServices','$state',function($scope,$rootScope,BooksManagementServices,$state) {

    BooksManagementServices.getAllBooks({},function(data, getResponseHeaders) {
        $scope.books = data.data;
    }, function(error) {
        console.log(error);
    });

    $scope.AddNewBook = function(){
        $scope.book.ownerId= $rootScope.uid;
        BooksManagementServices.addNewBook({}, $scope.book, function(data) {
            console.log("succ");
            $scope.closeModal();
            $state.reload()
        }, function(err) {
            console.log('add a new book ERROR ',err);

        }); //end
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
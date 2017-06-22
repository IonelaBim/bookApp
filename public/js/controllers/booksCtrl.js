app.controller('booksCtrl', ['$scope','BooksManagementServices','$state',function($scope,BooksManagementServices,$state) {

    BooksManagementServices.getAllBooks({},function(data, getResponseHeaders) {
       console.log('faa',data.data)
        $scope.books = data.data;
    }, function(error) {
        console.log(error);
    });

    $scope.showAddBookModal = function(){
         console.log("FFFFf")
        $scope.AddNewBookModal=true;
    }

    $scope.closeModal = function(){
        $scope.AddNewBookModal=false;
        $scope.newBook={};
        $scope.addNewBookForm.$setPristine();
    }
}]);
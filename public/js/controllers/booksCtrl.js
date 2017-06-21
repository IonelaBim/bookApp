app.controller('booksCtrl', ['$scope','BooksManagementServices','$state',function($scope,BooksManagementServices,$state) {

    BooksManagementServices.getAllBooks({},function(data, getResponseHeaders) {
       console.log('faa',data.data)
        $scope.books = data.data;
    }, function(error) {
        console.log(error);
    });
}]);
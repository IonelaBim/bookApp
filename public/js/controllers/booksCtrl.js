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

    $scope.RemoveBook = function(bookId){

            // $scope.book.ownerId= $rootScope.uid;
            BooksManagementServices.removeBook({id:bookId}, $scope.book, function(data) {
                console.log("succ");
                $state.reload()
            }, function(err) {
                console.log('delete a book ERROR ',err);

            });


    }

    $scope.showContactOwnerModal = function(){
        $scope.ContactOwnerModal=true;
    };

    $scope.closeContactModal = function(){
        $scope.ContactOwnerModal=false;
        $scope.emailBody={};
        $scope.contactOwnerForm.$setPristine();
    }

    $scope.sendEmail = function(){
        if ($scope.contactOwnerForm.$valid){
            $scope.emailInfo ={
                from:'ionela92@gmail.com',
                to:'ionela92@gmail.com',
                subject:'Get boook info',
                body:$scope.emailBody}
            // $scope.book.ownerId= $rootScope.uid;
            BooksManagementServices.sendEmail({}, $scope.emailInfo, function(data) {
                console.log("succ");
                $scope.closeContactModal();
            }, function(err) {
                console.log('ERROR  send email',err);
            });
        }else{
            angular.forEach($scope.contactOwnerForm.$error.required, function(field) {
                field.$setDirty();
            });
        }

    }

}]);
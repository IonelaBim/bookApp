app.controller('booksCtrl', ['$scope','$rootScope','BooksManagementServices','$state',function($scope,$rootScope,BooksManagementServices,$state) {

    BooksManagementServices.getAllBooks({},function(data) {
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

    };

    $scope.showAddBookModal = function(){
        $scope.AddNewBookModal=true;
    };

    $scope.closeModal = function(){
        $scope.AddNewBookModal=false;
        $scope.newBook={};
        $scope.addNewBookForm.$setPristine();
    };

    $scope.RemoveBook = function(book){
        console.log('33434',book)
        if (book.ownerId == $rootScope.uid) {
            BooksManagementServices.removeBook({id:book.bookId}, book, function(data) {
                console.log("succ");
                $state.reload()
            }, function(err) {
                console.log('delete a book ERROR ',err);
            });
        }

    };

    $scope.showContactOwnerModal = function(book){
        $scope.ContactOwnerModal=true;
        $scope.currentBoook =book;
    };

    $scope.closeContactModal = function(){
        $scope.ContactOwnerModal=false;
        $scope.emailBody={};
        $scope.contactOwnerForm.$setPristine();
    };

    $scope.sendEmail = function(){
        if ($scope.contactOwnerForm.$valid){

            $scope.emailInfo = {
                from:$rootScope.uid,
                to:$scope.currentBoook.ownerEmail,
                subject:'Get boook info',
                body:$scope.emailBody
            };
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

    };

    $scope.booking = function(book){

            $scope.emailInfo ={
                userId:$rootScope.uid,
                to:book.ownerEmail,
                subject:'Booking book',
                body:book
            };
            BooksManagementServices.booking({}, $scope.emailInfo, function(data) {
                console.log("succ");
            }, function(err) {
                console.log('ERROR  send email',err);
            });


    }


}]);
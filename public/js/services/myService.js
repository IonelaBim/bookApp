/* angular APP services  */

app.factory('BooksManagementServices',function($resource){
    return $resource("/secured/:resource/:subresource/:id",{},{
        'getAllBooks':{method:'GET',params:{resource:"books"}},
        'addNewBook': {method: 'POST',params:{resource:"books"}},
        'removeBook':{method:'DELETE',params:{resource:"book", id:'@id'}},
        'sendEmail':{method: 'POST',params:{resource:"sendEmail"}},
        'booking':{method:'POST',params:{resource:"book",subresource:"booking" }}
    });
});

app.factory('LoginService',function($resource){
    return $resource("/user/:resource",{},{
        'Login': {method: 'POST',params:{resource:"login"}},
        'SignUp': {method: 'POST',params:{resource:"signup"}},
        'Logout': {method: 'GET',params:{resource:"logout"}}

    });
});

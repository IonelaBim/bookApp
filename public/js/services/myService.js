app.factory('BooksManagementServices',function($resource){
    return $resource("/secured/:resource/:subresource/",{},{

    });
});

app.factory('LoginService',function($resource){
    return $resource("/public/:resource/:subresource",{},{
        'Login': {method: 'PUT',params:{resource:"users",subresource:"authentication"}},
        'Logout': {method: 'DELETE',params:{resource:"users",subresource:"authentication"}},

    });
});

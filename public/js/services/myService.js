app.factory('BooksManagementServices',function($resource){
    return $resource("/secured/:resource/",{},{
        'getAllBooks':{method:'GET',params:{resource:"books"}}
    });
});

app.factory('LoginService',function($resource){
    return $resource("/user/:resource",{},{
        'Login': {method: 'POST',params:{resource:"login"}},
        'SignUp': {method: 'POST',params:{resource:"signup"}},
        'Logout': {method: 'GET',params:{resource:"logout"}}

    });
});

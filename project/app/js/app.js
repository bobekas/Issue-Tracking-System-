'use strict';

angular.module('issueTracker', [
    'ngRoute',
    'issueTracker.home.dashboard',
    'issueTracker.home.public',
    'issueTracker.users.identityService',
    'issueTracker.users.me.changePassword',
    'issueTracker.users.me.usersService',
    'issueTracker.common',
    'angular-loading-bar',
    'ngAnimate',
    'cgNotify'
])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/'});
}])
.constant('BASE_URL', 'http://softuni-issue-tracker.azurewebsites.net/')
.run([
    '$rootScope', 
    '$location',
    '$cookies',
    function($rootScope, $location, $cookies) {
        $rootScope.$on( '$routeChangeStart', function(event, next, current) {
            if($cookies.get('access_token')) {
                if($location.path() === '/')
                $location.path('/dashboard');
            } else {
                $location.path('/');
            }
        });
    }
]);
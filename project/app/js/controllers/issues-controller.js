'use strict';

angular.module('issueTracker.issues', [
    'issueTracker.issuesService'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/issues/:issueId', {
            templateUrl: 'app/templates/issue-page.html',
            controller: 'CurrentIssueCtrl',
            resolve: {
                getCurrentIssue: [
                    '$route',
                    '$location',
                    'issuesService',
                    function($route, $location, issuesService) {
                        issuesService.getCurrentIssue($route.current.params.issueId)
                            .then(function(data) {
                                
                            }, function(error) {
                                $location.path('/dashboard');
                            });
                        return issuesService.getCurrentIssue($route.current.params.issueId)
                    }
                ],
                getCurrentIssueComments: [
                    '$route',
                    'issuesService',
                    function($route, issuesService) {
                        return issuesService.getCurrentIssueComments($route.current.params.issueId);
                    }
                ]
            }
        })
        
        .when('/projects/:projectId/add-issue', {
            templateUrl: 'app/templates/add-issue.html',
            controller: 'AddIssueCtrl',
            resolve: {
                getCurrentProject: [
                    '$route',
                    '$location',
                    '$q',
                    'projectsService',
                    'identityService',
                    function($route, $location, $q, projectsService, identityService) {
                        var deferred = $q.defer();
                        
                        projectsService.getProject($route.current.params.projectId)
                            .then(function(project) {
                                identityService.isAdmin()
                                    .then(function(success) {
                                        deferred.resolve(project);
                                    }, function(error) {
                                        if(identityService.getUserId() === project.Lead.Id) {
                                            deferred.resolve(project);
                                        } else {
                                            $location.path('/dashboard');    
                                        }
                                    });
                            }, function(error) {
                                $location.path('/dashboard');
                            });
                        
                        return deferred.promise;
                    }
                ],
                getAllUsers: ['usersService', function(usersService) {
                    return usersService.getAllUsers();
                }]
            }
        })
}])

.controller('CurrentIssueCtrl', [
    '$scope', 
    '$location',
    '$route',
    'notify',
    'getCurrentIssue',
    'getCurrentIssueComments',
    'issuesService',
    'identityService',
    'projectsService',
    function($scope, $location, $route, notify, getCurrentIssue, getCurrentIssueComments, issuesService, identityService, projectsService) {
        $scope.issueId = $route.current.params.issueId;
        if(getCurrentIssue.Assignee.Id === identityService.getUserId()) {
            $scope.isAssignee = true;
        }
        projectsService.getLeadId(getCurrentIssue.Project.Id)
            .then(function(leadId) {
                if(leadId === identityService.getUserId) {
                    $scope.isLeader = true;
                }
            });
        $scope.issue = getCurrentIssue;
        $scope.comments = getCurrentIssueComments;
        $scope.changeIssueStatus = function(id) {
            issuesService.changeIssueStatus($scope.issueId, id)
                .then(function(newStatus) {
                    issuesService.getCurrentIssue($scope.issueId)
                        .then(function(issue) {
                            $scope.issue = issue;
                        });
                });
        }
        $scope.addCommentToIssue = function (comment) {
            issuesService.addCommentToIssue($scope.issueId, comment)
                .then(function(comments) {
                    notify({
                        message: 'Your comment has been submitted.',
                        duration: 8000,
                        classes: ['alert-success']
                    });
                    $scope.comment = null;
                    $scope.addComment.$setPristine();
                    $scope.comments = comments;
                }, function(error) {
                    notify({
                        message: error.data.Message,
                        duration: 6000,
                        classes: ['cg-notify-error']
                    });
                });
        }
    }])
    
    .controller('AddIssueCtrl', [
        '$scope',
        'getCurrentProject',
        'getAllUsers',
        'notify',
        '$location',
        'issuesService',
        function($scope, getCurrentProject, getAllUsers, notify, $location, issuesService) {
            $scope.users = getAllUsers;
            $scope.issue = {
                ProjectId: getCurrentProject.Id
            }
            $scope.project = {
                Name: getCurrentProject.Name,
                Priorities: getCurrentProject.Priorities
            }
            $scope.addIssue = function(issue) {
                issuesService.addIssue(issue)
                    .then(function(issue) {
                        notify({
                        message: 'Issue has been added.',
                        duration: 4000,
                        classes: ['alert-success']
                    });
                    $location.path('/issues/' + issue.Id);
                    }, function(error) {
                        notify({
                            message: error.data.Message,
                            duration: 6000,
                            classes: ['cg-notify-error']
                        });
                    });
            }
        }
    ])
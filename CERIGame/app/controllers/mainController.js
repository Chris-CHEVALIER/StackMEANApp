var mainApp = angular.module('mainApp', ["ngRoute", "ngMaterial"])

mainApp.config(function($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "views/login.html",
      controller: "loginCtrl"
    })
    .when("/home", {
      templateUrl: "views/home.html",
      controller: "homeCtrl"
    })
    .otherwise({
      templateUrl: "views/login.html",
      controller: "loginCtrl"
    })
})
mainApp.factory("Session", function() {
  var sessionService = {

    // Instantiate data when service
    // is loaded
    _user: JSON.parse(localStorage.getItem('session.user')),
    _accessToken: JSON.parse(localStorage.getItem('session.accessToken')),
    getUser: function() {
      return sessionService._user;
    },

    setUser: function(user) {
      sessionService._user = user;
      localStorage.setItem('session.user', JSON.stringify(user));
      return this;
    },

    getAccessToken: function() {
      return sessionService._accessToken;
    },

    setAccessToken: function(token) {
      sessionService._accessToken = token;
      localStorage.setItem('session.accessToken', token);
      return this;
    },
    destroy: function destroy() {
      sessionService.setUser(null);
      sessionService.setAccessToken(null);
    }
  }
  return sessionService
})
mainApp.factory('UserFactory', function() {
  var factory = {
    userinfo: {
      name: "",
      lastconnec: undefined
    },
    setUser: function(user) {
      factory.userinfo = user
    },
    getUser: function() {
      return factory.userinfo
    }
  }
  return factory
})
mainApp.controller('menuCtrl', ["$scope", "UserFactory", "Session", function($scope, UserFactory, Session) {
  $scope.user = Session.getUser()
  $scope.menuItems = [{
    caption: "Accueil",
    link: "#!/home"
  }, {
    caption: "Top 10",
    link: "#!/topten"
  }, {
    caption: "Quizz",
    link: "#!/quizz"
  }, {
    caption: "Joueurs",
    link: "#!/players"
  }, {
    caption: "Historique",
    link: "#!/history"
  }, {
    caption: "Profil",
    link: "#!/account"
  }]
}])
mainApp.controller('homeCtrl', ["$scope", "$http", "$location", "$mdSidenav", "UserFactory", function($scope, $http, $location, $mdSidenav, UserFactory) {
  $scope.toggleSidenav = buildToggler('closeEventsDisabled');
  $scope.user = UserFactory.getUser()

  function buildToggler(componentId) {
    return function() {
      $mdSidenav(componentId).toggle();
    };
  }
}])
mainApp.controller('loginCtrl', ["$scope", "$http", "$location", "UserFactory", "Session", function($scope, $http, $location, UserFactory, Session) {
  $scope.trylogin = false
  $scope.login = function() {
    if ($scope.usr != "" && $scope.pwd != "") {
      $scope.trylogin = true
      $http.post('/login', {
        usr: $scope.usr,
        pwd: $scope.pwd
      }).then((res) => {
        $scope.trylogin = false
        if (res.data.status === 200) {
          UserFactory.setUser({
            name: $scope.usr
          })
          Session.setUser({
            name: $scope.usr
          })
          $location.path('/home')
        }

      })
    }
  }
}])
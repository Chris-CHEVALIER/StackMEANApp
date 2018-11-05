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
mainApp.controller('menuCtrl', ["$scope", "$http", "$location", "Session", "$mdToast", function($scope, $http, $location, Session, $mdToast) {
  $scope.user = Session.getUser()
  $scope.logout = function() {
    $http.get('/logout').then(() => {
      $mdToast.show($mdToast.simple().textContent('Vous êtes maintenant déconnecté').position("top right"));
      Session.setUser({})
      $location.path('/')
    })
  }


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
mainApp.controller('homeCtrl', ["$scope", "$http", "$location", "$mdSidenav", "Session", function($scope, $http, $location, $mdSidenav, Session) {
  $scope.toggleSidenav = buildToggler('closeEventsDisabled');
  $scope.user = Session.getUser()

  function buildToggler(componentId) {
    return function() {
      $mdSidenav(componentId).toggle();
    };
  }
}])
mainApp.controller('loginCtrl', ["$scope", "$http", "$location", "Session", "$mdToast", function($scope, $http, $location, Session, $mdToast) {

  if (Session.getUser() != undefined && Session.getUser().name !== undefined)
    $location.path('/home')
  $scope.trylogin = false

  $scope.login = function() {
    if ($scope.usr != "" && $scope.pwd != "") {
      $scope.trylogin = true
      $http.post('/login', {
        usr: $scope.usr,
        pwd: $scope.pwd
      }).then((res) => {
        $scope.trylogin = false
        switch (res.data.status) {
          case 200:
            $mdToast.show($mdToast.simple().textContent('Vous êtes maintenant connecté').position("top right"));
            Session.setUser({
              name: $scope.usr,
              date: res.data.date
            })
            $location.path('/home')
            break;
          case 500:
            $mdToast.show($mdToast.simple().textContent('Identifiants incorrects, veuillez réessayer').position("top right"));
            break;
          case 501:
            $mdToast.show($mdToast.simple().textContent('Utilisateur déjà connecté').position("top right"));
            break;
          default:
            break;

        }
      })
    }
  }
}])
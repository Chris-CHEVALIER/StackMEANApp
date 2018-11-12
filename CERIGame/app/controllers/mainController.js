var mainApp = angular.module('mainApp', ["ngRoute", "ngMaterial", "chart.js"])


function access(Session, $mdToast, $location) {
  if (Session.getUser() === null) {
    $mdToast.show($mdToast.simple().textContent('Vous devez être connecté pour accèder à cet espace').position("top right"));
    $location.path('/')
  }
}

function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var monthIndex = date.split("-")[1]
  var day = date.split("-")[2].split("T")[0]
  var year = date.split("-")[0]

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}
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
    .when("/account", {
      templateUrl: "views/account.html",
      controller: "accountCtrl"
    })
    .when("/history", {
      templateUrl: "views/history.html",
      controller: "historyCtrl"
    })
    .otherwise({
      templateUrl: "views/login.html",
      controller: "loginCtrl"
    })
})
mainApp.factory("GamesFactory", function($http, $q, Session) {
  var factory = {
    games: null,
    loadData: function(data) {
      factory.games = data
    },
    getData: function() {
      return factory.games
    },
    refresh: function() {
      var deferred = $q.defer()
      $http.post('/getGamePlayed', {
        "id": Session.getUser().id
      }).then((res) => {
        factory.games = res.data.rows
        deferred.resolve(factory.games)
      }).catch(() => {
        deferred.reject()
      })
      return deferred.promise
    }
  }
  return factory
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
mainApp.controller('menuCtrl', function($scope, $http, $location, Session, $mdToast) {
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
})

mainApp.controller('gamePlayedChartCtrl', function($scope, $mdDialog, GamesFactory, Session) {
  $scope.gamesData = []
  $scope.labels = []
  $scope.data = []
  GamesFactory.refresh().then((data) => {
    console.log(data);
    data.forEach((i) => {
      $scope.gamesData.push({ ...i,
        date: formatDate(i.date)
      })
    })
    var result = {};
    $scope.gamesData.forEach((v) => {
      if (!result[v.date])
        result[v.date] = 1
      else
        result[v.date]++
    })
    for (var e in result) {
      $scope.labels.push(e)
      $scope.data.push(result[e])
    }
  })



  $scope.series = [Session.getUser().name];

  $scope.onClick = (points, evt, ev) => {
    if (points[0] != undefined) {
      $mdDialog.show(
        $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title('Information sur la journée du ' + $scope.labels[points[0]._index])
        .textContent('Cette journée là, vous avez joué ' + $scope.data[points[0]._index] + ' parties de quizz.')
        .ok('D\'accord!')
        .openFrom('.chart')
      );
    }
  };
  $scope.datasetOverride = [{
    yAxisID: 'y-axis-1'
  }];
  $scope.options = {
    scales: {
      yAxes: [{
        id: 'y-axis-1',
        type: 'linear',
        display: true,
        position: 'left'
      }]
    }
  };
})
mainApp.controller('homeCtrl', function($scope, $http, $location, $mdSidenav, $mdToast, GamesFactory, Session) {
  access(Session, $mdToast, $location)

  GamesFactory.refresh().then((data) => {
    $scope.nbGames = data.length
  })

  $scope.toggleSidenav = buildToggler('closeEventsDisabled');
  $scope.user = Session.getUser()

  function buildToggler(componentId) {
    return function() {
      $mdSidenav(componentId).toggle();
    };
  }
})

mainApp.controller('historyCtrl', function($scope, $http, Session, $mdSidenav, GamesFactory, $mdToast, $location) {
  access(Session, $mdToast, $location)

  $scope.toggleSidenav = buildToggler('closeEventsDisabled');
  $scope.user = Session.getUser()
  $scope.games = []

  GamesFactory.refresh().then((data) => {
    data.forEach((i) => {
      $scope.games.push({ ...i,
        date: formatDate(i.date)
      })
    })
  })

  $scope.challenges = [{
    score: 123,
    opponent: "Lucas"
  }, {
    score: 213,
    opponent: "Richard"
  }, {
    score: 12313,
    opponent: "Michael"
  }]

  function buildToggler(componentId) {
    return function() {
      $mdSidenav(componentId).toggle();
    };
  }
})
mainApp.controller('accountCtrl', function($scope, Session, $mdSidenav, $mdToast, $location) {
  access(Session, $mdToast, $location)

  $scope.toggleSidenav = buildToggler('closeEventsDisabled');

  function buildToggler(componentId) {
    return function() {
      $mdSidenav(componentId).toggle();
    };
  }
})
mainApp.controller('loginCtrl', function($scope, $http, $location, Session, $mdToast) {
  if (Session.getUser() != null && Session.getUser().name !== undefined)
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
            Session.setUser(res.data)
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
})
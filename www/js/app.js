// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var hoohair = angular.module('Hoohair', ['ionic']);

hoohair.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

window.addEventListener('native.keyboardshow', keyboardShowHandler);
window.addEventListener('native.keyboardhide', keyboardHideHandler);

function keyboardShowHandler(e){
  var amount = e.keyboardHeight;

  document.getElementById("main-page").style.top = "-"+ amount + "px";
  document.getElementById("main-page").style.bottom = amount + "px";
}

function keyboardHideHandler(e){
  document.getElementById("main-page").style.top = "0px";
  document.getElementById("main-page").style.bottom = "0px";
}

function restoreIcon(elem) {
  elem.style.color = "white";
}

hoohair.controller("formController", function($scope, $ionicScrollDelegate, $ionicPopup, $timeout) {
  function Item(value, name) {
    this.value = value;
    this.name = name;
  }

  function errorPopup(text) {
    var alertPopup = $ionicPopup.alert({
      title: text,
      okType: 'button-assertive'
    });
  }

  function informativePopup(text) {
    var alertPopup = $ionicPopup.alert({
      title: text
    });
  }

  function insert(email, firstName, lastName) {
    // check mail existance
    firebase.database().ref(email).once('value').then(function(snapshot) {
      var alreadyExists = snapshot.val() != null;

      if (alreadyExists) {
        errorPopup("Email already exists!");
      } else {
        firebase.database().ref(email).set({
          first_name: firstName,
          last_name: lastName
        });

        informativePopup("Thank you for registering!");
      }
    });
  }

  $scope.items = [new Item("", "First Name"),
                  new Item("", "Last Name"),
                  new Item("", "Email Address")];

  $scope.keyPress = function($event) {
    if ($event.keyCode == 13) {
      for (var i = 0; i < $scope.items.length; i++) {
        if ($scope.items[i].value == "") {
          var id = "input_" + $scope.items[i].name;
          allCompleted = false;
          document.getElementById(id).focus();
          return;
        }
      }
      document.getElementById("submit-button").focus();
    }
  };

  $scope.register = function() {
    var firstName = $scope.items[0].value;
    var lastName = $scope.items[1].value;
    var email = $scope.items[2].value;

    for (var i = 0; i < $scope.items.length; i++) {
      if ($scope.items[i].value == "") {
        errorPopup("All fields are mandatory!");
        return;
      }
    }

    insert(email, firstName, lastName);
  };

  $scope.scroll = function() {
    $ionicScrollDelegate.$getByHandle('formScroll').scrollBottom();
  };
});

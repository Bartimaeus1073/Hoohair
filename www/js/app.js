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


// event listeners for keyboard hiding and showing
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

hoohair.controller("formController", function($scope, $ionicPopup) {
  // constructor for text input items
  function Item(value, name, type) {
    this.value = value;
    this.name = name;
    this.type = type;
  }

  // boolean that prevents multiple popup to appear while inserting into
  // firebase (true -> is inserting, false -> not inserting)
  $scope.inserting = false;

  // array that holds the text input informations
  $scope.items = [new Item("", "First Name", "text"),
                  new Item("", "Last Name", "text"),
                  new Item("", "Email Address", "email")];

  // validates name input as Item
  // returns "" if no error has occoured
  // else returns the error message
  function validateName(item) {
    var error = "";

    if (item.value.length < 4) {
      error += item.name + " needs to be at least 4 characters long<br>";
    }

    return error;
  }

  // validates email input as Item
  // returns "" if no error has occoured
  // else returns the error message
  function validateEmail(item) {
    var error = "";
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!re.test(item.value)) {
      error += item.name + " is not valid<br>";
    }

    return error;
  }

  // shows an eror Popup
  function errorPopup(template, func) {
    var myPopup = $ionicPopup.show({
      template: template,
      title: 'Error',
      scope: $scope,
      buttons: [
        {
          text: "<b>OK</b>",
          type: 'button-assertive',
          onTap: func
        }
      ]
    });
  }

  // shows an informative popup
  function informativePopup(template, func) {
    var myPopup = $ionicPopup.show({
      title: template,
      scope: $scope,
      buttons: [
        {
          text: "<b>OK</b>",
          type: 'button-positive',
          onTap: func
        }
      ]
    });
  }

  // this method will insert the credentials into firebase
  // PRE: credentials are correct
  function insert(credentials) {
    $scope.inserting = true;
    // check mail existance
    var path = "users/";
    var ref = firebase.database().ref(path);

    ref.once('value').then(function(snapshot) {
      // check for duplicates
      var alreadyExists = false;
      snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val().email == credentials.email) {
          errorPopup("Email already exists!", function() {
            $scope.inserting = false;
          });
          alreadyExists = true;
        }
      });

      if (!alreadyExists) {
        // there are no duplicates so add credentials
        ref.push(credentials).then(function() {
          informativePopup("Thank you for registering!", function() {
            $scope.inserting = false;
          });
        });
      }
    });
  }

  // handles keyboard key press
  $scope.keyPress = function($event) {
    // checks press of return button on keyboard
    if ($event.keyCode == 13) {
      // searches for all text input values of the mandatory fields
      // to be not null, and if there is a null field
      // it will foucs on that field
      for (var i = 0; i < $scope.items.length; i++) {
        if ($scope.items[i].value == "") {
          var id = "input_" + $scope.items[i].name;
          allCompleted = false;
          document.getElementById(id).focus();
          return;
        }
      }

      // blur inputs to hide keyboard
      for (var i = 0; i < $scope.items.length; i++) {
        var id = "input_" + $scope.items[i].name;
        document.getElementById(id).blur();
      }

      // return acts as submit button
      $scope.register();
    }
  };

  // validates credentials and sends them to firebase
  $scope.register = function() {
    if ($scope.inserting) {
      return;
    }

    var firstName = $scope.items[0];
    var lastName = $scope.items[1];
    var email = $scope.items[2];

    // validate inputs
    for (var i = 0; i < $scope.items.length; i++) {
      if ($scope.items[i].value == "") {
        errorPopup("All fields are mandatory!");
        return;
      }
    }

    var errorMessage = "";

    errorMessage += validateName(firstName);
    errorMessage += validateName(lastName);
    errorMessage += validateEmail(email);

    if (errorMessage != "") {
      errorPopup(errorMessage);
      return
    }

    insert({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value
    });
  };
});

hoohair.controller("socialController", function($scope) {
    // constructor for social links
    function Social(type, link) {
      this.type = type;
      this.link = link;
    }

    // array that holds social links
    $scope.socialLinks = [
      new Social("twitter", "https://twitter.com/hoohair"),
      new Social("facebook", "https://www.facebook.com/HooHairApp/"),
      new Social("instagram", "https://www.instagram.com/hoohair/"),
      new Social("youtube", "https://www.youtube.com/watch?v=HpzPqKaw-IU")
    ];

    // open specified link
    $scope.open = function(link) {
      window.open(link, '_system', 'location=yes');
    };
});

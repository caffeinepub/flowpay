import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type TransactionCategory = {
    #Food;
    #Transport;
    #Shopping;
    #Entertainment;
    #Health;
    #Other;
  };

  type TransactionStatus = {
    #Pending;
    #Completed;
    #Failed;
  };

  type CardType = {
    #Visa;
    #Mastercard;
    #Amex;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    balance : Int;
    createdAt : Time.Time;
  };

  type Transaction = {
    id : Nat;
    senderId : Principal;
    receiverId : Principal;
    amount : Int;
    category : TransactionCategory;
    status : TransactionStatus;
    date : Time.Time;
  };

  type Card = {
    id : Nat;
    owner : Principal;
    maskedNumber : Text;
    expiry : Text;
    cardType : CardType;
  };

  type Notification = {
    id : Nat;
    owner : Principal;
    message : Text;
    read : Bool;
    timestamp : Time.Time;
  };

  type CategorySpending = {
    category : TransactionCategory;
    amount : Int;
  };

  type MonthlySpending = {
    month : Text;
    amount : Int;
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let transactions = Map.empty<Nat, Transaction>();
  let cards = Map.empty<Nat, Card>();
  let notifications = Map.empty<Nat, Notification>();

  var nextTransactionId : Nat = 0;
  var nextCardId : Nat = 0;
  var nextNotificationId : Nat = 0;
  var isSeeded : Bool = false;

  // Helper functions
  func principalEqual(p1 : Principal, p2 : Principal) : Bool {
    Principal.equal(p1, p2);
  };

  func getMonthKey(timestamp : Time.Time) : Text {
    // Simple month key generation (year-month)
    let seconds = timestamp / 1_000_000_000;
    let days = seconds / 86400;
    let month = (days / 30) % 12;
    let year = 2024 + (days / 365);
    Int.toText(year).concat("-").concat(Int.toText(month));
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (not principalEqual(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateProfile(name : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    let existingProfile = userProfiles.get(caller);
    let updatedProfile = switch (existingProfile) {
      case (?profile) {
        {
          name = name;
          email = email;
          balance = profile.balance;
          createdAt = profile.createdAt;
        };
      };
      case (null) {
        {
          name = name;
          email = email;
          balance = 0;
          createdAt = Time.now();
        };
      };
    };
    userProfiles.add(caller, updatedProfile);
  };

  // Transaction Functions
  public shared ({ caller }) func sendMoney(receiver : Principal, amount : Int, category : TransactionCategory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send money");
    };

    if (principalEqual(caller, receiver)) {
      Runtime.trap("Cannot send money to yourself");
    };

    if (amount <= 0) {
      Runtime.trap("Amount must be positive");
    };

    // Check sender profile exists and has sufficient balance
    let senderProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Sender profile not found"); };
    };

    if (senderProfile.balance < amount) {
      Runtime.trap("Insufficient balance");
    };

    // Check receiver profile exists
    let receiverProfile = switch (userProfiles.get(receiver)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Receiver profile not found"); };
    };

    // Create transaction
    let transaction : Transaction = {
      id = nextTransactionId;
      senderId = caller;
      receiverId = receiver;
      amount = amount;
      category = category;
      status = #Completed;
      date = Time.now();
    };
    transactions.add(nextTransactionId, transaction);
    nextTransactionId += 1;

    // Update balances
    let updatedSenderProfile = {
      name = senderProfile.name;
      email = senderProfile.email;
      balance = senderProfile.balance - amount;
      createdAt = senderProfile.createdAt;
    };
    userProfiles.add(caller, updatedSenderProfile);

    let updatedReceiverProfile = {
      name = receiverProfile.name;
      email = receiverProfile.email;
      balance = receiverProfile.balance + amount;
      createdAt = receiverProfile.createdAt;
    };
    userProfiles.add(receiver, updatedReceiverProfile);

    // Create notification for receiver
    let notification : Notification = {
      id = nextNotificationId;
      owner = receiver;
      message = "Received ".concat(Int.toText(amount).concat(" cents"));
      read = false;
      timestamp = Time.now();
    };
    notifications.add(nextNotificationId, notification);
    nextNotificationId += 1;
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    let allTransactions = transactions.values().toArray();
    allTransactions.filter<Transaction>(
      func(tx : Transaction) : Bool {
        principalEqual(tx.senderId, caller) or principalEqual(tx.receiverId, caller);
      }
    );
  };

  // Card Functions
  public shared ({ caller }) func addCard(maskedNumber : Text, expiry : Text, cardType : CardType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add cards");
    };

    let card : Card = {
      id = nextCardId;
      owner = caller;
      maskedNumber = maskedNumber;
      expiry = expiry;
      cardType = cardType;
    };
    cards.add(nextCardId, card);
    let cardId = nextCardId;
    nextCardId += 1;
    cardId;
  };

  public query ({ caller }) func getCards() : async [Card] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cards");
    };

    let allCards = cards.values().toArray();
    allCards.filter<Card>(
      func(card : Card) : Bool {
        principalEqual(card.owner, caller);
      }
    );
  };

  // Budget Insights Functions
  public query ({ caller }) func getCurrentMonthSpending() : async [CategorySpending] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view spending");
    };

    let currentMonth = getMonthKey(Time.now());
    let allTransactions = transactions.values().toArray();

    let userTransactions = allTransactions.filter(
      func(tx : Transaction) : Bool {
        principalEqual(tx.senderId, caller) and
        Text.equal(getMonthKey(tx.date), currentMonth) and
        (switch (tx.status) { case (#Completed) { true }; case (_) { false } })
      }
    );

    var foodTotal : Int = 0;
    var transportTotal : Int = 0;
    var shoppingTotal : Int = 0;
    var entertainmentTotal : Int = 0;
    var healthTotal : Int = 0;
    var otherTotal : Int = 0;

    for (tx in userTransactions.values()) {
      switch (tx.category) {
        case (#Food) { foodTotal += tx.amount };
        case (#Transport) { transportTotal += tx.amount };
        case (#Shopping) { shoppingTotal += tx.amount };
        case (#Entertainment) { entertainmentTotal += tx.amount };
        case (#Health) { healthTotal += tx.amount };
        case (#Other) { otherTotal += tx.amount };
      };
    };

    [
      { category = #Food; amount = foodTotal },
      { category = #Transport; amount = transportTotal },
      { category = #Shopping; amount = shoppingTotal },
      { category = #Entertainment; amount = entertainmentTotal },
      { category = #Health; amount = healthTotal },
      { category = #Other; amount = otherTotal },
    ];
  };

  public query ({ caller }) func getLast6MonthsSpending() : async [MonthlySpending] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view spending");
    };

    let allTransactions = transactions.values().toArray();
    let userTransactions = allTransactions.filter(
      func(tx : Transaction) : Bool {
        principalEqual(tx.senderId, caller) and
        (switch (tx.status) { case (#Completed) { true }; case (_) { false } })
      }
    );

    // Simple aggregation by month (simplified for demo)
    var monthlyTotals : [(Text, Int)] = [];
    for (tx in userTransactions.values()) {
      let monthKey = getMonthKey(tx.date);
      var found = false;
      monthlyTotals := monthlyTotals.map<(Text, Int), (Text, Int)>(
        func((month, total) : (Text, Int)) : (Text, Int) {
          if (Text.equal(month, monthKey)) {
            found := true;
            (month, total + tx.amount);
          } else {
            (month, total);
          };
        }
      );
      if (not found) {
        monthlyTotals := monthlyTotals.concat([(monthKey, tx.amount)]);
      };
    };

    monthlyTotals.map<(Text, Int), MonthlySpending>(
      func((month, amount) : (Text, Int)) : MonthlySpending {
        { month = month; amount = amount };
      }
    );
  };

  // Notification Functions
  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    let allNotifications = notifications.values().toArray();
    allNotifications.filter<Notification>(
      func(notif : Notification) : Bool {
        principalEqual(notif.owner, caller);
      }
    );
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    let allNotifications = notifications.values().toArray();
    let userNotifications = allNotifications.filter(
      func(notif : Notification) : Bool {
        principalEqual(notif.owner, caller) and not notif.read;
      }
    );
    userNotifications.size();
  };

  public shared ({ caller }) func markAllNotificationsAsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };

    let allNotifications = notifications.entries().toArray();
    for ((id, notif) in allNotifications.values()) {
      if (principalEqual(notif.owner, caller) and not notif.read) {
        let updatedNotif = {
          id = notif.id;
          owner = notif.owner;
          message = notif.message;
          read = true;
          timestamp = notif.timestamp;
        };
        notifications.add(id, updatedNotif);
      };
    };
  };

  // Seed Demo Data (Admin only)
  public shared ({ caller }) func seedDemoData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed demo data");
    };

    if (isSeeded) {
      Runtime.trap("Demo data already seeded");
    };

    // This is a placeholder - in real implementation, you would create sample users
    // and transactions here
    isSeeded := true;
  };
};

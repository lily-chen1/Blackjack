var bj = {
  hdstand: null,
  hdpoints: null,
  hdhand: null,
  hpstand: null,
  hppoints: null,
  hphand: null,
  hpcon: null,
  deck: [],
  dealer: [],
  player: [],
  dpoints: 0,
  ppoints: 0,
  safety: 17,
  dstand: false,
  pstand: false,
  turn: 0,
  bet: 0,
  userId: 0,
  multiplier: 0,
  init: function () {
    bj.hdstand = document.getElementById("deal-stand");
    bj.hdpoints = document.getElementById("deal-points");
    bj.hdhand = document.getElementById("deal-cards");
    bj.hpstand = document.getElementById("play-stand");
    bj.hppoints = document.getElementById("play-points");
    bj.hphand = document.getElementById("play-cards");
    bj.hpcon = document.getElementById("play-control");
    document.getElementById("playc-start").addEventListener("click", bj.start);
    document.getElementById("playc-hit").addEventListener("click", bj.hit);
    document.getElementById("playc-stand").addEventListener("click", bj.stand);
    document.getElementById("betButton").addEventListener("click", bj.placeBet);
  },

  placeBet: function () {
    var betError = document.getElementById("betError");
    bj.bet = document.getElementById("betField").value;
    console.log(bj.bet);
    if (isNaN(bj.bet)) {
      betError.style.visibility = "visible";
      betError.style.height = "auto";
      betError.style.margin = "1em";
      betError.innerHTML = "Please input a number!";
      console.log(document.getElementById("betField").value);
      return;
    } else if (Number(bj.bet) >= Number(userBalance)) {
      betError.style.visibility = "visible";
      betError.style.height = "auto";
      betError.style.margin = "1em";
      betError.innerHTML = "You can't bet with money you don't have!";
      console.log(document.getElementById("betField").value);
      return;
    }
    betError.style.visibility = "hidden";
    betError.style.height = "0px";
    betError.style.margin = "-1em";
    document.getElementById("playc-start").disabled = false;
    document.getElementById("betButton").disabled = true;
    document.getElementById("betField").disabled = true;
  },
  start: function () {
    document.getElementById("resultAlert").style.visibility = "hidden";
    document.getElementById("resultAlert").style.height = "0px";
    document.getElementById("resultAlert").style.margin = "0px";
    bj.deck = [];
    bj.dealer = [];
    bj.player = [];
    bj.dpoints = 0;
    bj.ppoints = 0;
    bj.dstand = false;
    bj.pstand = false;
    bj.hdpoints.innerHTML = "?";
    bj.hppoints.innerHTML = 0;
    bj.hdhand.innerHTML = "";
    bj.hphand.innerHTML = "";
    bj.hdstand.classList.remove("stood");
    bj.hpstand.classList.remove("stood");
    bj.hpcon.classList.add("started");
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j < 14; j++) {
        bj.deck.push({ s: i, n: j });
      }
    }
    for (let i = bj.deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = bj.deck[i];
      bj.deck[i] = bj.deck[j];
      bj.deck[j] = temp;
    }
    bj.turn = 0;
    bj.draw();
    bj.turn = 1;
    bj.draw();
    bj.turn = 0;
    bj.draw();
    bj.turn = 1;
    bj.draw();
    bj.turn = 0;
    bj.points();
    bj.turn = 1;
    bj.points();
    var winner = bj.check();
    if (winner == null) {
      bj.turn = 0;
    }
  },
  dsymbols: ["&hearts;", "&diams;", "&clubs;", "&spades;"],
  dnum: { 1: "A", 11: "J", 12: "Q", 13: "K" },
  draw: function () {
    var card = bj.deck.pop(),
      cardh = document.createElement("div"),
      cardv = (bj.dnum[card.n] ? bj.dnum[card.n] : card.n) + bj.dsymbols[card.s];
    cardh.className = "bj-card";
    cardh.innerHTML = cardv;
    if (bj.turn) {
      if (bj.dealer.length == 0) {
        cardh.id = "deal-first";
        cardh.innerHTML = `<div class="back">?</div><div class="front">${cardv}</div>`;
      }
      bj.dealer.push(card);
      bj.hdhand.appendChild(cardh);
    }
    else {
      bj.player.push(card);
      bj.hphand.appendChild(cardh);
    }
  },
  points: function () {
    var aces = 0,
      points = 0;
    for (let i of bj.turn ? bj.dealer : bj.player) {
      if (i.n == 1) {
        aces++;
      } else if (i.n >= 11 && i.n <= 13) {
        points += 10;
      } else {
        points += i.n;
      }
    }
    if (aces != 0) {
      var minmax = [];
      for (let elevens = 0; elevens <= aces; elevens++) {
        let calc = points + elevens * 11 + (aces - elevens * 1);
        minmax.push(calc);
      }
      points = minmax[0];
      for (let i of minmax) {
        if (i > points && i <= 21) {
          points = i;
        }
      }
    }
    if (bj.turn) {
      bj.dpoints = points;
    } else {
      bj.ppoints = points;
      bj.hppoints.innerHTML = points;
    }
  },
  check: function () {
    var winner = null,
      message = "";
    if (bj.player.length == 2 && bj.dealer.length == 2) {
      if (bj.ppoints == 21 && bj.dpoints == 21) {
        winner = 2;
        message = "It's a tie with Blackjacks";
      }
      if (winner == null && bj.ppoints == 21) {
        winner = 0;
        message = "You win with a Blackjack!";
      }
      if (winner == null && bj.dpoints == 21) {
        winner = 1;
        message = "Dealer wins with a Blackjack!";
      }
    }
    if (winner == null) {
      if (bj.ppoints > 21) {
        winner = 1;
        message = "You have gone bust - Dealer wins!";
      }
      if (bj.dpoints > 21) {
        winner = 0;
        message = "Dealer has gone bust - You win!";
      }
    }
    if (winner == null && bj.dstand && bj.pstand) {
      if (bj.dpoints > bj.ppoints) {
        winner = 1;
        message = "Dealer wins with " + bj.dpoints + " points!";
      }
      else if (bj.dpoints < bj.ppoints) {
        winner = 0;
        message = "You win with " + bj.ppoints + " points!";
      }
      else {
        winner = 2;
        message = "It's a tie.";
      }
    }
    if (winner != null) {
      bj.hdpoints.innerHTML = bj.dpoints;
      document.getElementById("deal-first").classList.add("show");
      bj.hpcon.classList.remove("started");
      resultAlertText = document.getElementById("resultAlertText");
      resultAlertHeading = document.getElementById("resultAlertHeading");
      resultAlert = document.getElementById("resultAlert");
      resultAlertFooter = document.getElementById("resultAlertFooter");
      resultAlertText.innerHTML = message;
      if (winner == 0) {
        resultAlert.className = "alert alert-success";
        resultAlertHeading.innerHTML = "You win!";
        bj.multiplier = 1.5;
        resultAlertFooter.innerHTML = `You gain a payout of $${bj.bet * bj.multiplier}`;
      } else {
        resultAlert.className = "alert alert-danger";
        resultAlertHeading.innerHTML = "You lost!";
        resultAlertFooter.innerHTML = `You lose your bet of $${bj.bet}`;
        bj.multiplier = 0;
      }
      resultAlert.style.visibility = "visible";
      resultAlert.style.height = "auto";
      resultAlert.style.margin = "2em 4em 4em";
      document.getElementById("playc-start").disabled = true;
      document.getElementById("betButton").disabled = false;
      document.getElementById("betField").disabled = false;

      fetch("/blackjack/pay", {
        method: "POST",
        body: JSON.stringify({
          bet: Number(bj.bet),
          multiplier: bj.multiplier,
          userId: Number(userId),
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }).then(() => {
        fetch("/balance")
          .then((response) => response.json())
          .then((json) => {
            console.log(json);
            document.getElementById("balanceDisplay").innerHTML = json.balance;
          });
      });
    }
    return winner;
  },
  hit: function () {
    bj.draw();
    bj.points();
    if (bj.turn == 0 && bj.ppoints == 21 && !bj.pstand) {
      bj.pstand = true;
      bj.hpstand.classList.add("stood");
    }
    if (bj.turn == 1 && bj.dpoints == 21 && !bj.dstand) {
      bj.dstand = true;
      bj.hdstand.classList.add("stood");
    }
    var winner = bj.check();
    if (winner == null) {
      bj.next();
    }
  },
  stand: function () {
    if (bj.turn) {
      bj.dstand = true;
      bj.hdstand.classList.add("stood");
    } else {
      bj.pstand = true;
      bj.hpstand.classList.add("stood");
    }
    var winner = bj.pstand && bj.dstand ? bj.check() : null;
    if (winner == null) {
      bj.next();
    }
  },
  next: function () {
    bj.turn = bj.turn == 0 ? 1 : 0;
    if (bj.turn == 1) {
      if (bj.dstand) {
        bj.turn = 0;
      }
      else {
        bj.ai();
      }
    }
    else {
      if (bj.pstand) {
        bj.turn = 1;
        bj.ai();
      }
    }
  },
  ai: function () {
    if (bj.turn) {
      if (bj.dpoints >= bj.safety) {
        bj.stand();
      }
      else {
        bj.hit();
      }
    }
  },
};
window.addEventListener("DOMContentLoaded", bj.init);

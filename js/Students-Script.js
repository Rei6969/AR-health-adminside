import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAHMdNm9q6RENL7Bbk2dsqcAzClHVVB70",
  authDomain: "ar-health-55bdf.firebaseapp.com",
  databaseURL:
    "https://ar-health-55bdf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ar-health-55bdf",
  storageBucket: "ar-health-55bdf.appspot.com",
  messagingSenderId: "299653685010",
  appId: "1:299653685010:web:0234781762639516ea1dcb",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase();
const storage = getStorage(firebaseApp);

document
  .querySelector(".btn-students")
  .addEventListener("click", fetchDataAndDrawChart);

const currentNav = sessionStorage.getItem("currentSidebarBtn") || "students";

if (currentNav === "students") {
  fetchDataAndDrawChart();
}

async function fetchDataAndDrawChart() {
  const pieChartContainer = document.getElementById("pieChart");

  pieChartContainer.innerHTML = "";

  const snapshot = await get(ref(database, "users"));
  const snapshotData = snapshot.val();

  const totalUsers = Object.keys(snapshotData).length;
  let maleUsers = 0;
  let femaleUsers = 0;

  for (const ID in snapshotData) {
    const data = snapshotData[ID];
    if (data.sex === "Male") {
      maleUsers++;
    } else {
      femaleUsers++;
    }
  }

  document.getElementById("total-users").textContent = `Total Students: ${
    Object.keys(snapshotData).length
  }`;
  document.getElementById(
    "male-users"
  ).textContent = `Male Students: ${maleUsers}`;
  document.getElementById(
    "female-users"
  ).textContent = `Female Students: ${femaleUsers}`;

  drawDynamicPieChart(pieChartContainer, totalUsers, maleUsers, femaleUsers);
}

function drawDynamicPieChart(element, totalUsers, maleUsers, femaleUsers) {
  const malePercentage = (maleUsers / totalUsers) * 100;
  const femalePercentage = (femaleUsers / totalUsers) * 100;

  const data = [
    { title: "Male", value: malePercentage, color: "var(--color-sub-bg-4)" },
    {
      title: "Female",
      value: femalePercentage,
      color: "var(--color-sub-bg-1)",
    },
  ];

  drawPieChart(element, data);
}

function drawPieChart(element, data, options) {
  var W = element.clientWidth,
    H = element.clientHeight,
    centerX = W / 2,
    centerY = H / 2,
    cos = Math.cos,
    sin = Math.sin,
    PI = Math.PI,
    settings = Object.assign(
      {
        segmentShowStroke: true,
        segmentStrokeColor: "#fff",
        segmentStrokeWidth: 1,
        baseColor: "#fff",
        baseOffset: 15,
        edgeOffset: 30,
        pieSegmentGroupClass: "pieSegmentGroup",
        pieSegmentClass: "pieSegment",
        lightPiesOffset: 12,
        lightPiesOpacity: 0.3,
        lightPieClass: "lightPie",
        animation: true,
        animationSteps: 90,
        animationEasing: "easeInOutExpo",
        tipOffsetX: -15,
        tipOffsetY: -45,
        tipClass: "pieTip",
        beforeDraw: function () {},
        afterDrawed: function () {},
        onPieMouseenter: function (e, data) {},
        onPieMouseleave: function (e, data) {},
        onPieClick: function (e, data) {},
      },
      options
    ),
    animationOptions = {
      linear: function (t) {
        return t;
      },
      easeInOutExpo: function (t) {
        var v = t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
        return v > 1 ? 1 : v;
      },
    },
    requestAnimFrame = (function () {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        }
      );
    })();

  var wrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  wrapper.setAttribute("width", W);
  wrapper.setAttribute("height", H);
  wrapper.setAttribute("viewBox", "0 0 " + W + " " + H);
  wrapper.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  wrapper.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  element.appendChild(wrapper);

  var groups = [],
    pies = [],
    lightPies = [],
    easingFunction = animationOptions[settings.animationEasing],
    pieRadius = Math.min(H / 2, W / 2) - settings.edgeOffset,
    segmentTotal = 0;

  var base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  base.setAttribute("cx", centerX);
  base.setAttribute("cy", centerY);
  base.setAttribute("r", pieRadius + settings.baseOffset);
  base.setAttribute("fill", settings.baseColor);
  wrapper.appendChild(base);

  var pathGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  pathGroup.setAttribute("opacity", 0);
  wrapper.appendChild(pathGroup);

  var tip = document.createElement("div");
  tip.className = settings.tipClass;
  document.body.appendChild(tip);
  tip.style.display = "none";

  data.forEach(function (d, i) {
    segmentTotal += d.value;
    var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("data-order", i);
    group.setAttribute("class", settings.pieSegmentGroupClass);
    pathGroup.appendChild(group);
    groups[i] = group;

    group.addEventListener("mouseenter", pathMouseEnter);
    group.addEventListener("mouseleave", pathMouseLeave);
    group.addEventListener("mousemove", pathMouseMove);
    group.addEventListener("click", pathClick);

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke-width", settings.segmentStrokeWidth);
    path.setAttribute("stroke", settings.segmentStrokeColor);
    path.setAttribute("stroke-miterlimit", 2);
    path.setAttribute("fill", d.color);
    path.setAttribute("class", settings.pieSegmentClass);
    group.appendChild(path);
    pies[i] = path;

    var lightPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    lightPath.setAttribute("stroke-width", settings.segmentStrokeWidth);
    lightPath.setAttribute("stroke", settings.segmentStrokeColor);
    lightPath.setAttribute("stroke-miterlimit", 2);
    lightPath.setAttribute("fill", d.color);
    lightPath.setAttribute("opacity", settings.lightPiesOpacity);
    lightPath.setAttribute("class", settings.lightPieClass);
    group.appendChild(lightPath);
    lightPies[i] = lightPath;
  });

  settings.beforeDraw.call(element);
  triggerAnimation();

  function pathMouseEnter(e) {
    var index = this.getAttribute("data-order");
    tip.textContent =
      data[index].title + ": " + data[index].value.toFixed(2) + "%";
    tip.style.display = "block";
    if (groups[index].getAttribute("data-active") !== "active") {
      lightPies[index].style.opacity = 0.8;
    }
    settings.onPieMouseenter.call(this, e, data);
  }

  function pathMouseLeave(e) {
    var index = this.getAttribute("data-order");
    tip.style.display = "none";
    if (groups[index].getAttribute("data-active") !== "active") {
      lightPies[index].style.opacity = settings.lightPiesOpacity;
    }
    settings.onPieMouseleave.call(this, e, data);
  }

  function pathMouseMove(e) {
    tip.style.top = e.pageY + settings.tipOffsetY + "px";
    tip.style.left = e.pageX - tip.offsetWidth / 2 + settings.tipOffsetX + "px";
  }

  function pathClick(e) {
    var index = this.getAttribute("data-order");
    var targetGroup = groups[index];

    data.forEach(function (_, i) {
      if (i === index) return;
      groups[i].setAttribute("data-active", "");
      lightPies[i].style.opacity = settings.lightPiesOpacity;
    });

    if (targetGroup.getAttribute("data-active") === "active") {
      targetGroup.setAttribute("data-active", "");
      lightPies[index].style.opacity = 0.8;
    } else {
      targetGroup.setAttribute("data-active", "active");
      lightPies[index].style.opacity = 1;
    }
    settings.onPieClick.call(this, e, data);
  }

  function drawPieSegments(animationDecimal) {
    var startRadius = -PI / 2,
      rotateAnimation = 1;
    if (settings.animation) {
      rotateAnimation = animationDecimal;
    }

    pathGroup.setAttribute("opacity", animationDecimal);

    data.forEach(function (d, i) {
      var segmentAngle =
          rotateAnimation * ((d.value / segmentTotal) * (PI * 2)),
        endRadius = startRadius + segmentAngle,
        largeArc = (endRadius - startRadius) % (PI * 2) > PI ? 1 : 0,
        startX = centerX + cos(startRadius) * pieRadius,
        startY = centerY + sin(startRadius) * pieRadius,
        endX = centerX + cos(endRadius) * pieRadius,
        endY = centerY + sin(endRadius) * pieRadius,
        startX2 =
          centerX + cos(startRadius) * (pieRadius + settings.lightPiesOffset),
        startY2 =
          centerY + sin(startRadius) * (pieRadius + settings.lightPiesOffset),
        endX2 =
          centerX + cos(endRadius) * (pieRadius + settings.lightPiesOffset),
        endY2 =
          centerY + sin(endRadius) * (pieRadius + settings.lightPiesOffset);

      var cmd = [
        "M",
        startX,
        startY,
        "A",
        pieRadius,
        pieRadius,
        0,
        largeArc,
        1,
        endX,
        endY,
        "L",
        centerX,
        centerY,
        "Z",
      ];
      var cmd2 = [
        "M",
        startX2,
        startY2,
        "A",
        pieRadius + settings.lightPiesOffset,
        pieRadius + settings.lightPiesOffset,
        0,
        largeArc,
        1,
        endX2,
        endY2,
        "L",
        centerX,
        centerY,
        "Z",
      ];

      pies[i].setAttribute("d", cmd.join(" "));
      lightPies[i].setAttribute("d", cmd2.join(" "));
      startRadius += segmentAngle;
    });
  }

  var animFrameAmount = settings.animation ? 1 / settings.animationSteps : 1,
    animCount = settings.animation ? 0 : 1;

  function triggerAnimation() {
    if (settings.animation) {
      requestAnimFrame(animationLoop);
    } else {
      drawPieSegments(1);
    }
  }

  function animationLoop() {
    animCount += animFrameAmount;
    drawPieSegments(easingFunction(animCount));
    if (animCount < 1) {
      requestAnimFrame(animationLoop);
    } else {
      settings.afterDrawed.call(element);
    }
  }
}

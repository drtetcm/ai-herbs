const imageInput =
  document.getElementById("imageInput");

const analyzeBtn =
  document.getElementById("analyzeBtn");

const result =
  document.getElementById("result");

const loading =
  document.getElementById("loading");

const loadingText =
  document.getElementById("loadingText");

const idleState =
  document.getElementById("idleState");

const riskBadge =
  document.getElementById("riskBadge");

const riskFill =
  document.getElementById("riskFill");

const riskScore =
  document.getElementById("riskScore");

const clarityValue =
  document.getElementById("clarityValue");

const lightingValue =
  document.getElementById("lightingValue");

const visibilityValue =
  document.getElementById("visibilityValue");

const confidenceValue =
  document.getElementById("confidenceValue");

const previewImage =
  document.getElementById("previewImage");

const uploadOverlay =
  document.getElementById("uploadOverlay");

/* -------------------------------- */
/* STATES */
/* -------------------------------- */

const loadingStates = [

  "Initializing Claude Vision...",

  "Scanning herbal structure...",

  "Running AI verification...",

  "Analyzing contamination risk...",

  "Evaluating image quality...",

  "Generating AI report..."

];

let loadingInterval = null;

/* -------------------------------- */
/* IMAGE PREVIEW */
/* -------------------------------- */

imageInput.addEventListener("change", () => {

  const file = imageInput.files[0];

  if (!file) return;

  const imageUrl =
    URL.createObjectURL(file);

  previewImage.src =
    imageUrl;

  previewImage.classList.add("show");

  uploadOverlay.style.opacity = ".18";

  const uploadText =
    document.querySelector(".upload-text");

  uploadText.textContent =
    file.name;

  /* reset state */

  result.innerHTML = "";

  riskBadge.textContent = "--";

  riskBadge.className =
    "risk-badge";

  riskFill.style.width = "0%";

  riskScore.textContent = "--";

  clarityValue.textContent = "--";

  lightingValue.textContent = "--";

  visibilityValue.textContent = "--";

  confidenceValue.textContent = "--";

  idleState.classList.remove("hidden");

  loading.classList.add("hidden");

});

/* -------------------------------- */
/* ANALYZE */
/* -------------------------------- */

analyzeBtn.addEventListener("click", async () => {

  const file = imageInput.files[0];

  if (!file) {

    alert("请先上传药材图片");

    return;
  }

  startLoading();

  try {

    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch("/api/analyze", {

      method: "POST",

      body: formData

    });

    const data =
      await response.json();

    console.log(
      "AI RESULT:",
      data
    );

    stopLoading();

    renderResult(data);

  } catch (error) {

    console.error(error);

    stopLoading();

    showError(error);

  }

});

/* -------------------------------- */
/* LOADING SYSTEM */
/* -------------------------------- */

function startLoading() {

  loading.classList.remove("hidden");

  idleState.classList.add("hidden");

  result.innerHTML = `
    <div style="
      color:#8c97b2;
      line-height:1.8;
    ">
      AI report is generating...
    </div>
  `;

  let index = 0;

  loadingText.textContent =
    loadingStates[0];

  loadingInterval =
    setInterval(() => {

      index++;

      if (
        index >=
        loadingStates.length
      ) {

        index = 0;

      }

      loadingText.textContent =
        loadingStates[index];

    }, 1800);

}

function stopLoading() {

  clearInterval(
    loadingInterval
  );

  loading.classList.add(
    "hidden"
  );

  idleState.classList.add(
    "hidden"
  );

}

/* -------------------------------- */
/* RESULT RENDER */
/* -------------------------------- */

function renderResult(data) {

  const report =
    data.report ||
    data.message ||
    "No AI report returned.";

  result.innerHTML = `
    <div class="report-content">
      ${formatReport(report)}
    </div>
  `;

  renderRisk(data);

  renderQuality(data);

}

/* -------------------------------- */
/* REPORT FORMAT */
/* -------------------------------- */

function formatReport(text) {

  return text

    .replace(
      /\n/g,
      "<br>"
    )

    .replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

}

/* -------------------------------- */
/* RISK SYSTEM */
/* -------------------------------- */

function renderRisk(data) {

  const risk = (

    data.risk ||

    data.riskLevel ||

    "LOW"

  ).toUpperCase();

  let score = 12;

  let badgeClass =
    "risk-low";

  if (
    risk.includes("HIGH")
  ) {

    score = 88;

    badgeClass =
      "risk-high";

  }

  else if (
    risk.includes("MEDIUM")
  ) {

    score = 56;

    badgeClass =
      "risk-medium";

  }

  else if (
    risk.includes("UNKNOWN")
  ) {

    score = 72;

    badgeClass =
      "risk-medium";

  }

  riskBadge.className =
    `risk-badge ${badgeClass}`;

  riskBadge.textContent =
    risk;

  riskScore.textContent =
    `${score}%`;

  riskFill.style.width =
    `${score}%`;

}

/* -------------------------------- */
/* QUALITY SYSTEM */
/* -------------------------------- */

function renderQuality(data) {

  clarityValue.textContent =

    data.clarity ||

    "--";

  lightingValue.textContent =

    data.lighting ||

    "--";

  visibilityValue.textContent =

    data.visibility ||

    "--";

  confidenceValue.textContent =

    data.confidence ||

    "--";

}

/* -------------------------------- */
/* ERROR */
/* -------------------------------- */

function showError(error) {

  result.innerHTML = `
    <div style="
      color:#ff8f8f;
      line-height:1.8;
    ">

      <strong>
        AI Analysis Failed
      </strong>

      <br><br>

      ${error.message}

    </div>
  `;

  riskBadge.textContent =
    "ERROR";

  riskBadge.className =
    "risk-badge risk-high";

  riskFill.style.width =
    "100%";

  riskScore.textContent =
    "--";

}
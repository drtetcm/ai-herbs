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

  resetUI();

});

/* -------------------------------- */
/* RESET UI */
/* -------------------------------- */

function resetUI() {

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

  loading.classList.add("hidden");

}

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
/* LOADING */
/* -------------------------------- */

function startLoading() {

  loading.classList.remove("hidden");

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

}

/* -------------------------------- */
/* RESULT */
/* -------------------------------- */

function renderResult(data) {

  console.log(
    "RENDER DATA:",
    data
  );

  const herbName =
    data.herb_name ||
    "未知";

  const candidates =
    data.candidate_herbs ||
    data.possible_candidates ||
    [];

  const candidatesText =
    formatCandidates(
      candidates
    );

  const visualAnalysis =

    typeof data.visual_analysis === "object"

      ? JSON.stringify(
          data.visual_analysis,
          null,
          2
        )

      : (
          data.visual_analysis ||
          "暂无"
        );

  const report = `
药材名称：
${herbName}

候选药材：
${candidatesText}

识别依据：
${data.identification_basis || "暂无"}

视觉特征分析：
${visualAnalysis}

对象类型：
${data.object_type || "unknown"}

是否药材：
${data.is_herbal ? "是" : "否"}

未知对象概率：
${data.unknown_probability || 0}%

风险等级：
${data.risk_level || data.risk || "LOW"}

总风险：
${data.overall_risk || data.totalRisk || 0}%

AI置信度：
${data.confidence || 0}%

图片清晰度：
${data.clarity || "--"}

光线质量：
${data.lighting || "--"}

可见度：
${data.visibility || "--"}%
`;

  result.innerHTML = `
    <div class="report-content">
      ${formatReport(report)}
    </div>
  `;

  renderRisk(data);

  renderQuality(data);

}

/* -------------------------------- */
/* FORMAT CANDIDATES */
/* -------------------------------- */

function formatCandidates(candidates) {

  if (
    !candidates ||
    !Array.isArray(candidates) ||
    candidates.length === 0
  ) {

    return "无";

  }

  return candidates.join("、");

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
/* RISK */
/* -------------------------------- */

function renderRisk(data) {

  const risk = (

    data.risk_level ||

    data.risk ||

    "LOW"

  ).toUpperCase();

  let score =
    Number(
      data.overall_risk ||
      data.totalRisk ||
      12
    );

  let badgeClass =
    "risk-low";

  if (
    risk.includes("HIGH")
  ) {

    badgeClass =
      "risk-high";

  }

  else if (
    risk.includes("MEDIUM")
  ) {

    badgeClass =
      "risk-medium";

  }

  else if (
    risk.includes("ELEVATED")
  ) {

    badgeClass =
      "risk-medium";

  }

  if (score > 100) {

    score = 100;

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
/* QUALITY */
/* -------------------------------- */

function renderQuality(data) {

  clarityValue.textContent =

    data.clarity ||

    "--";

  lightingValue.textContent =

    data.lighting ||

    "--";

  visibilityValue.textContent =

    `${data.visibility || "--"}%`;

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
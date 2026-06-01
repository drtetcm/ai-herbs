export function rootSliceCorrection(result) {

  if (!result) return result;

  const herbName =
    result.herb_name || "";

  const herbForm =
    result.herb_form || "";

  const reasoning =
    result.reasoning || "";

  const candidates =
    result.possible_candidates || [];

  /*
  ====================================
  党参饮片纠偏
  ====================================
  */

  if (
    herbForm === "slice" &&
    herbName === "黄芪"
  ) {

    const hasDangshenCandidate =
      candidates.some(
        c => c.herb_name === "党参"
      );

    const usedAbsenceReasoning =
      reasoning.includes("未见狮子盘头") ||
      reasoning.includes("无狮子盘头") ||
      reasoning.includes("未见花盘状中心") ||
      reasoning.includes("无花盘状中心");

    if (
      hasDangshenCandidate &&
      usedAbsenceReasoning
    ) {

      console.log(
        "ROOT SLICE CORRECTION: HuangQi -> DangShen"
      );

      result.herb_name =
        "党参";

      result.confidence =
        Math.max(
          result.confidence - 10,
          70
        );

    }

  }

  return result;

}
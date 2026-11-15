
"use strict";

document.addEventListener("DOMContentLoaded", function () {

  const essayInput = document.getElementById("essay");
  const result = document.getElementById("result");
  const button = document.getElementById("reviewBtn");

  button.addEventListener("click", function () {

    const essay = essayInput.value.trim();
    const grade = document.getElementById("grade").value;

    if (!essay) {
      result.textContent = "请先输入作文！";
      return;
    }

    const cleanEssay = essay.replace(/\s/g, "");
    const words = cleanEssay.length;

    const paragraphs = essay
      .split(/\n\s*\n/)
      .filter(function (p) {
        return p.trim().length > 0;
      }).length;

    let suggestions = [];

    if (words < 500) {
      suggestions.push("文章篇幅较短，可以适当补充细节描写。");
    }

    if (paragraphs < 3) {
      suggestions.push("建议合理分段，使文章结构更加清晰。");
    }

    if (!/然而|但是|于是|最终|后来/.test(essay)) {
      suggestions.push("可以增加自然的情节转折。");
    }

    if (!/我明白|我懂得|成长|感悟|让我懂得/.test(essay)) {
      suggestions.push("建议在结尾深化中心思想。");
    }

    if (!/[，。！？；：]/.test(essay)) {
      suggestions.push("请检查标点符号是否完整。");
    }

    if (suggestions.length === 0) {
      suggestions.push("文章基本结构较完整，可以继续优化语言。");
    }

    const report =
      "作文分析报告\n\n" +
      "年级：" + grade + "\n" +
      "字数：" + words + "\n" +
      "自然段：" + paragraphs + "\n\n" +
      "修改建议：\n" +
      suggestions.map(function (item, index) {
        return (index + 1) + ". " + item;
      }).join("\n") +
      "\n\n温馨提示：这只是基础分析，并非正式考试评分。";

    result.textContent = report;
  });

});

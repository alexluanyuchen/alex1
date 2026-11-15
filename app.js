
// 把这里替换成你部署成功后的 Worker 地址
const API_URL = "https://替换成你的Worker地址.workers.dev/review";

const $ = id => document.getElementById(id);

$("essay").addEventListener("input", () => {
  const text = $("essay").value.trim();
  $("wordCount").textContent = text.length + " 字";
});

async function reviewEssay() {
  const essay = $("essay").value.trim();
  const topic = $("topic").value.trim();

  if (essay.length < 30) {
    alert("作文至少写30个字，再进行批改吧。");
    return;
  }
  if (essay.length > 5000) {
    alert("作文太长了，请控制在5000字以内。");
    return;
  }
  if (API_URL.includes("替换成你的Worker地址")) {
    alert("还没有填写Worker地址，请先完成第三步。");
    return;
  }

  $("reviewBtn").disabled = true;
  $("reviewBtn").textContent = "AI批改中……";
  $("loading").classList.remove("hidden");
  $("results").classList.add("hidden");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        essay,
        topic,
        grade: $("grade").value,
        genre: $("genre").value
      })
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "AI服务暂时不可用");
    }

    renderResult(result.data);
    $("results").classList.remove("hidden");
    $("results").scrollIntoView({behavior:"smooth"});
  } catch (error) {
    alert("批改失败：" + error.message + "\n请检查Worker地址和AI服务设置。");
  } finally {
    $("loading").classList.add("hidden");
    $("reviewBtn").disabled = false;
    $("reviewBtn").textContent = "开始AI批改";
  }
}

function addItems(id, items, formatter) {
  const el = $(id);
  el.innerHTML = "";
  if (!Array.isArray(items) || !items.length) {
    el.textContent = "暂无内容";
    return;
  }
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    if (formatter) {
      const parts = formatter(item);
      parts.forEach(part => {
        const p = document.createElement("div");
        p.textContent = part;
        div.appendChild(p);
      });
    } else {
      div.textContent = typeof item === "string" ? item : JSON.stringify(item);
    }
    el.appendChild(div);
  });
}

function renderResult(data) {
  $("summary").textContent = data.summary || "暂无综合评价";
  const total = Number(data.total_score);
  $("totalScore").textContent =
    Number.isFinite(total) ? total + " / 60" : "暂未评分";

  const scores = data.scores || {};
  $("scores").innerHTML = "";
  [
    ["内容", scores.content],
    ["结构", scores.structure],
    ["语言", scores.language],
    ["立意", scores.idea]
  ].forEach(([name, score]) => {
    const div = document.createElement("div");
    div.className = "item";
    div.textContent = name + "：" + (score ?? "未提供") + " 分";
    $("scores").appendChild(div);
  });

  addItems("strengths", data.strengths);
  addItems("issues", data.issues);
  addItems("edits", data.sentence_edits, item => [
    "原句：" + (item.original || ""),
    "修改：" + (item.revised || ""),
    "理由：" + (item.reason || "")
  ]);
  $("rewrite").textContent = data.rewrite || "AI没有返回修改版作文。";
  addItems("nextSteps", data.next_steps);
}

function copyRewrite() {
  const text = $("rewrite").textContent;
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => alert("修改版作文已复制！"))
      .catch(() => alert("复制失败，请长按文字手动复制。"));
  } else {
    alert("请长按修改版作文文字进行复制。");
  }
}

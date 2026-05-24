export async function analyzeHerb(file) {

  const formData = new FormData();

  formData.append("image", file);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  return data;

}
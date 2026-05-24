export async function analyzeHerb(file) {

  console.log("上传文件:", file);

  try {

    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch("/api/analyze", {

      method: "POST",

      body: formData

    });

    const data = await response.json();

    console.log("API返回:", data);

    return data;

  } catch (error) {

    console.error("上传失败:", error);

    return {
      status: "error",
      message: error.message
    };

  }

}
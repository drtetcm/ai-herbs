import sharp from "sharp";

/**
 * Object Isolation V1
 * 自动主体裁切
 */

export async function isolateObject(imageBuffer) {
  try {
    // 读取图片信息
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const width = metadata.width;
    const height = metadata.height;

    if (!width || !height) {
      throw new Error("Invalid image dimensions");
    }

    // ===== 核心策略 =====
    // 裁掉外围背景
    // 保留中心主体区域

    // 中心区域比例
    const cropRatio = 0.72;

    const cropWidth = Math.floor(width * cropRatio);
    const cropHeight = Math.floor(height * cropRatio);

    // 居中裁切
    const left = Math.floor((width - cropWidth) / 2);
    const top = Math.floor((height - cropHeight) / 2);

    // 执行裁切
    const croppedBuffer = await image
      .extract({
        left,
        top,
        width: cropWidth,
        height: cropHeight,
      })
      .jpeg({
        quality: 95,
      })
      .toBuffer();

    return {
      success: true,
      croppedBuffer,
      cropInfo: {
        originalWidth: width,
        originalHeight: height,
        cropWidth,
        cropHeight,
        cropRatio,
      },
    };
  } catch (error) {
    console.error("Object isolation error:", error);

    return {
      success: false,
      error: error.message,
      croppedBuffer: imageBuffer, // fallback
    };
  }
}
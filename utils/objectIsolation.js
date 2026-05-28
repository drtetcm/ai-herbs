import sharp from "sharp";

/**
 * Industrial Object Isolation V2
 * 自动主体检测 + 背景裁切
 */

export async function isolateObject(imageBuffer) {

  try {

    const image =
      sharp(imageBuffer);

    const metadata =
      await image.metadata();

    const width =
      metadata.width;

    const height =
      metadata.height;

    if (!width || !height) {

      throw new Error(
        "Invalid image dimensions"
      );

    }

    // =========================
    // TRIM BACKGROUND
    // 自动移除外围背景
    // =========================

    const trimmed =
      image.trim();

    const trimInfo =
      await trimmed.metadata();

    // =========================
    // RESIZE FOR CLAUDE
    // =========================

    const processedBuffer =
      await trimmed
        .resize({
          width: 1024,
          withoutEnlargement: true,
          fit: "inside"
        })
        .jpeg({
          quality: 95
        })
        .toBuffer();

    return {

      success: true,

      croppedBuffer:
        processedBuffer,

      cropInfo: {

        originalWidth: width,

        originalHeight: height,

        trimmedWidth:
          trimInfo.width,

        trimmedHeight:
          trimInfo.height

      }

    };

  } catch (error) {

    console.error(
      "Object isolation error:",
      error
    );

    return {

      success: false,

      error:
        error.message,

      croppedBuffer:
        imageBuffer

    };

  }

}
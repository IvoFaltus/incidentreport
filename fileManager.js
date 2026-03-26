const compressImageTo2MB = (file, maxBytes = 2 * 1024 * 1024) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => (img.src = e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);

    img.onload = async () => {
      try {
        const base64 = await compressDataUrlTo2MB(img.src, maxBytes);
        resolve(base64);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = reject;
  });
};

const estimateBase64Bytes = (dataUrl) => Math.ceil((dataUrl.length * 3) / 4);

const compressDataUrlTo2MB = (dataUrl, maxBytes = 2 * 1024 * 1024) => {
  return new Promise((resolve, reject) => {
    if (!dataUrl || typeof dataUrl !== "string") {
      reject(new Error("Missing dataUrl"));
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      let quality = 0.9;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }

      const tryCompress = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", quality);
        const size = estimateBase64Bytes(base64);

        if (size <= maxBytes) {
          resolve(base64);
          return;
        }

        if (quality > 0.5) {
          quality -= 0.1;
        } else {
          width *= 0.8;
          height *= 0.8;
        }

        if (width < 200 || height < 200) {
          resolve(base64);
          return;
        }

        tryCompress();
      };

      tryCompress();
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
};

export { compressImageTo2MB, compressDataUrlTo2MB };

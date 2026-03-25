const compressImageTo2MB = (file, maxBytes = 2 * 1024 * 1024) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => (img.src = e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);

    img.onload = () => {
      let width = img.width;
      let height = img.height;
      let quality = 0.9;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const tryCompress = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", quality);
        const size = Math.ceil((base64.length * 3) / 4);

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

    img.onerror = reject;
  });
};

export { compressImageTo2MB };

const parseFileNameFromDisposition = (disposition) => {
  const source = String(disposition || "");
  if (!source) {
    return "";
  }

  const utf8Match = source.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const basicMatch = source.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] || "";
};

export const triggerBlobDownload = (blob, filename = "download.bin") => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadFromAxiosPdfResponse = (response, fallbackName) => {
  const header =
    response?.headers?.["content-disposition"] ||
    response?.headers?.["Content-Disposition"] ||
    "";
  const filename = parseFileNameFromDisposition(header) || fallbackName;
  triggerBlobDownload(response.data, filename);
};


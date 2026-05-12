
export const getMediaInfo = (url: string) => {
  const filename = url.split("?")[0].toLowerCase();
  const extension = filename.split(".").pop();

  const videoExtensions = ["mp4", "webm", "ogg", "mov", "mkv"];
  const audioExtensions = ["mp3", "wav", "aac", "m4a", "flac", "wma", "ogg"];

  if (extension && videoExtensions.includes(extension)) {
    return { isMedia: true, type: "video" as const };
  }
  if (extension && audioExtensions.includes(extension)) {
    return { isMedia: true, type: "audio" as const };
  }

  return { isMedia: false, type: null };
};

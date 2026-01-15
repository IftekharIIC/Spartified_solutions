module.exports = {
  content: ["fraudprotect.html"],
  css: ["style.css"],
  output: "css/",
  safelist: {
    standard: [
      /^swiper/,
      /^roadmap/,
      /^km-/,
      /^kb-/,
      /^mod-/,
      /^feat-/,
      /^contact-/,
      /^btn-/,
      /^gradient/,
      /^icon/,
      /^active$/,
    ],
    deep: [
      /hover/,
      /focus/,
      /after/,
      /before/,
    ],
  },
};
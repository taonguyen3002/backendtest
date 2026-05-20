const generateSlug = (title) => {
  const from = "àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ";
  const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

  const newTitle = title
    .toLowerCase()
    .split("")
    .map((char) => {
      const i = from.indexOf(char);
      return i !== -1 ? to[i] : char;
    })
    .join("");

  return newTitle
    .replace(/[^a-z0-9]+/g, "-") // thay chuỗi ký tự không hợp lệ bằng dấu '-'
    .replace(/-+/g, "-") // gộp nhiều dấu '-' liên tiếp thành 1
    .replace(/^-+|-+$/g, ""); // xóa '-' ở đầu và cuối
};
export default generateSlug;

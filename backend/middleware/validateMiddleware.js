const validate = (schema) => (req, res, next) => {
  // safeParse не выкидывает ошибку, а возвращает объект с результатом
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Ошибка валидации",
      // result.error.issues — это массив всех найденных проблем
      errors: result.error.issues.map(issue => ({
        // Проверяем, есть ли путь к полю, если нет — пишем 'body'
        field: issue.path.length > 0 ? issue.path[0] : 'request',
        message: issue.message
      }))
    });
  }

  // Если всё ок, перезаписываем req.body очищенными данными и идем дальше
  req.body = result.data;
  next();
};

module.exports = validate;
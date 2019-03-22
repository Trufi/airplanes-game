export const parseResult = (result: any) => {
  const string = JSON.stringify(result.rows);
  return JSON.parse(string);
};

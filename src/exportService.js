const XLSX = require("xlsx");
const path = require("path")
const exportExcel = (data, workSheetColumnNames, workSheetName, filePath) => {
  const workBook = XLSX.utils.book_new();
  const workSheetData = [workSheetColumnNames, ...data];
  const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);
  XLSX.utils.book_append_sheet(workBook, workSheet, workSheetName);
  XLSX.writeFile(workBook, path.resolve(filePath));
};

const exportUsersToExcel = (
  users,
  workSheetColumnNames,
  workSheetName,
  filePath
) => {
  const data = users.map((user) => {
    return [user.walletId, user.winner, user.createdAt];
  });
  exportExcel(data, workSheetColumnNames, workSheetName, filePath);
};

module.exports = exportUsersToExcel;
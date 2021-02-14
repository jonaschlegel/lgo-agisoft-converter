// read through all the files in the in folder
const fs = require('fs');
// const csv = require('csv');
const csv = require('csv/lib/sync');
// const data = [];
// TODO accept date from argv
const year = process.argv[2];

if (!year) {
  console.error(`No year provided! Please specify year as follows:

node index.js 2021`);
  process.exit(1);
}

fs.readdirSync('in', 'utf8').forEach((file) => {
  const fileContent = fs.readFileSync('in/' + file, 'utf8');
  const date = file.match(/(\d{4})\.txt/)?.[1];
  if (!date) {
    console.warn(
      `No date found in filename "in/${file}" (attempt to find last four numbers before file extension failed)! Skipped file.`,
    );
    return;
  }
  // for each file, parse the content as tab separated (possibly also remove extra spaces?)
  // [
  //   {
  //     PointID: '2003484',
  //     PointCode: 'PP',
  //     'SE-Nr': '065_243',
  //     Att2: '2',
  //     Att3: 'BS_IF',
  //     Easting: '17437.8715724798',
  //     Northing: '389942.9379840849',
  //     OrthoHeight: '297.9981262636',
  //     PrismHeight: '1.299',
  //   },
  // ]
  const rows = csv.parse(fileContent, {
    columns: true,
    ltrim: true,
    skip_empty_lines: true,
    delimiter: '\t',
  });

  // filter the rows to only include rows with PP in the PointCode field
  const passPointsRows = rows.filter((row) => {
    if (row.PointCode === 'PP') {
      return true;
    } else {
      return false;
    }
  });

  // group the rows by those having identical SE numbers

  const passPointsRowsGroups = passPointsRows.reduce((groups, row) => {
    const groupKey = 'SE' + row['SE-Nr'] + '-' + row.Att3;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    // for each group, create a separated object as follows:
    // .1 Att2 is added to the first column, with "target " prepended
    // .2 Easting is added to the second column
    // .3 Northing is added to the third column
    // .4 OrthoHeight is added to the fourth column
    groups[groupKey].push({
      Att2: 'target ' + row.Att2,
      Easting: row.Easting,
      Northing: row.Northing,
      OrthoHeight: row.OrthoHeight,
    });
    return groups;
  }, {});
  // the file name is generated as follows, with "-" separating the parts:
  // .1 the last 4 numbers from the "in" file are added as the first part
  // .2 PointCode is added as the second part
  // .3 SE-Nr is added with "SE" prefix
  // .4 Att3 is added as the fourth part
  Object.entries(passPointsRowsGroups).forEach(([seNrAndAtt3, group]) => {
    fs.writeFileSync(
      'out/' + year + date + '_PP_' + seNrAndAtt3 + '.txt',
      csv.stringify(group),
    );
  });
  // data.push(passPointsRowsGroups);
});

// console.log(data);

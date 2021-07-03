#!/usr/bin/env node

// read through all the files in the in folder
const fs = require('fs');
// const csv = require('csv');
const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
// const data = [];
// TODO accept date from argv
const year = process.argv[2];

/** @typedef {{
  PointID: string,
  PointCode: string,
  SUID: string,
  FID: string,
  PPID: string,
  xPos: string,
  yPos: string,
  zHeight: string,
  PrismType: string,
  PrismHeight: string,
  Date: string,
  Time: string,
}} Row */

if (!year) {
  console.error(`No year provided! Please specify year as follows:

node index.js 2021`);
  process.exit(1);
}

fs.readdirSync('in', 'utf8').forEach((file) => {
  if (file === '.gitkeep') return;
  const fileContent = fs.readFileSync('in/' + file, 'utf8');
  const date = file.match(/(\d{4})\.txt/)?.[1];
  if (!date) {
    console.warn(
      `No date found in filename "in/${file}" (attempt to find last four numbers before file extension failed)! Skipped file.`
    );
    return;
  }
  // for each file, parse the content as tab separated (possibly also remove extra spaces?)
  // [
  //   {
  //     PointID: '2003484',
  //     PointCode: 'PP',
  //     SUID: '065_243',
  //     FID: '2',
  //     PPID: 'BS_IF',
  //     xPos: '17437.8715724798',
  //     yPos: '389942.9379840849',
  //     zHeight: '297.9981262636',
  //     PrismType: 'Ref',
  //     PrismHeight: '1.299',
  //     Date: '1999-3-1',
  //     Time: '18:59:12.3'
  //   },
  // ]
  /** @type Row[] */
  const rows = parse(fileContent, {
    columns: true,
    ltrim: true,
    skip_empty_lines: true,
    delimiter: '\t',
  });

  // filter the rows to only include rows with PAP in the PointCode field
  const passPointsRows = rows.filter((row) => {
    if (row.PointCode === 'PAP') {
      return true;
    } else {
      return false;
    }
  });

  // group the rows by those having identical SE numbers

  const passPointsRowsGroups = passPointsRows.reduce((groups, row) => {
    const groupKey = 'SE' + row.SUID + '-' + row.PPID;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    // for each group, create a separated object as follows:
    // .1 Att2 is added to the first column, with "target " prepended
    // .2 Easting is added to the second column
    // .3 Northing is added to the third column
    // .4 OrthoHeight is added to the fourth column
    groups[groupKey].push({
      Att2: 'target ' + row.FID,
      Easting: row.xPos,
      Northing: row.yPos,
      OrthoHeight: row.zHeight,
    });
    return groups;
  }, /** @type {{ [key: string]: {Att2: string, Easting: string, Northing: string, OrthoHeight: string}[] }} */ ({}));
  // the file name is generated as follows, with "-" separating the parts:
  // .1 the last 4 numbers from the "in" file are added as the first part
  // .2 PointCode is added as the second part
  // .3 SE-Nr is added with "SE" prefix
  // .4 Att3 is added as the fourth part
  Object.entries(passPointsRowsGroups).forEach(([suIdAndFid, group]) => {
    fs.writeFileSync(
      'out/' + year + date + '_PP_' + suIdAndFid + '.txt',
      stringify(group)
    );
  });
  // data.push(passPointsRowsGroups);
});

// console.log(data);

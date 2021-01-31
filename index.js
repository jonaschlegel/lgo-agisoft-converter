// 1. read through all the files in the in folder
// 2. for each file, parse the content as tab separated (possibly also remove extra spaces?)
// 3. filter the rows to only include rows with PP in the PointCode field
// 4. group the rows by those having identical SE numbers
// 5. for each group, create a comma separated file as follows:
// 5.1 Att2 is added to the first column, with "target " prepended
// 5.2 Easting is added to the second column
// 5.3 Northing is added to the third column
// 5.4 OrthoHeight is added to the fourth column
// 5.5 the file name is generated as follows, with "-" separating the parts:
// 5.5.1 the last 4 numbers from the "in" file are added as the first part
// 5.5.2 PointCode is added as the second part
// 5.5.3 SE-Nr is added with "SE" prefix
// 5.5.4 Att3 is added as the fourth part

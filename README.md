# CloneHeroCleaner

Small cli utility quickly written in js to remove Clone Hero songs that only support 6 fret guitars.

Runs recursively against the Clone Hero song folder located in your home directory.

## Disclaimer
This was written quickly without much regard for systems/folder structures other than my own. Run at your own risk. This script removes files and folders recursively and could be dangerous if run unchecked.

## Requirements
- node v10.13.0^
- Mac OS (APIs used are not OS specific, but your mileage may vary)
- A messy Clone Hero library in need of cleaning

## Assumptions
This was thrown together after reading through only a few `song.ini` files.
Everything here is assumed, and was not verified against official resources.

- Given that `diff_guitarghl` or `diff_bassghl` are defined and non-negative, the chart supports 6 fret guitars
- Given that `diff_guitar` or `diff_band` are defined and non-negative, the chart supports 5 fret guitars

## If you really want to run this

Clone the script and ensure you have met the [requirements](#requirements)

Then, from the script folder run `node index.js [args]`

**Supported Args**
> -dryRun

This mode will output file names and some debug info and will not delete files.

> -testRun

This mode will limit the number of top-level folders crawled to 6.
I added this so I could run the script on a subset of directories, it's completely arbitrary and your own folder structure will determine how many actual files the program is executed against. 
Combined with `-destructive` you can still delete files from your system, so use with caution.

> -destructive

Deletes folders if they support Guitar Hero Live (6 fret) guitars only.
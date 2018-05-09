const fs = require('fs')
const fp = require('lodash/fp')
const _ = require('lodash')
const parse = require('csv-parse')
const axios = require('axios')

let rows = []

fs.createReadStream('./data.csv')
	.pipe(parse({ delimiter: ',', columns: true }))
	.on('data', row => rows.push(row))
	.on('end', () => {
		console.log(`Got ${rows.length} rows\n`)

		if (rows && rows.length > 0) {
			const mapped = stream(rows)
			console.dir(mapped, { depth: null })
			console.log('\n')

			mapped.forEach(async row => {
				try {
					const res = await postRow(row)
				} catch(error) {
					console.error(`Got error: '${error.message}' for row: ${row.title}`)
				}
			})
		}
	})

const stream = fp.flow(
	fp.omitBy(fp.isEmpty),
	fp.omitBy(omitRows),
	fp.map(mapRow)
)

function mapRow(row) {
	const { categories, mediaURL, ...rest} = row

	return {
		...rest,
		categories: categories.split(' ').filter(s => s && !_.isNil(s) && _.isString(s) ),
		resources: [
			{
				title: 'Introduction',
				type: 'video',
				mediaURL
			}
		]
	}
}

function omitRows(row) {
	return !row.title || !row.author
}

async function postRow(row) {
	return await axios.default.post('http://localhost:3000/api/course', row)
}

